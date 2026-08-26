import os
import threading

import numpy as np
import soundfile as sf
import torch

from transformers import (
    AutoFeatureExtractor,
    AutoProcessor,
    Wav2Vec2ForCTC,
    Wav2Vec2ForSequenceClassification,
)


LID_MODEL_ID = os.getenv(
    "MMS_LID_MODEL",
    "facebook/mms-lid-1024"
)

ASR_MODEL_ID = os.getenv(
    "MMS_ASR_MODEL",
    "facebook/mms-1b-all"
)

TARGET_SR = 16000

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

LOCAL_LOW_MEMORY = (
    os.getenv("LOCAL_LOW_MEMORY", "false").lower()
    == "true"
)


SUPPORTED_LANGUAGES = {
    "eng": "English",
    "pan": "Punjabi",
    "urd": "Urdu",
    "ben": "Bengali",
    "ara": "Arabic",
    "som": "Somali",
    "yor": "Yoruba",
    "ibo": "Igbo",
    "swh": "Swahili",
}


MMS_LANGUAGE_MAP = {
    "eng": "eng",
    "pan": "pan",
    "urd": "urd-script_arabic",
    "ben": "ben",
    "ara": "ara",
    "som": "som",
    "yor": "yor",
    "ibo": "ibo",
    "swh": "swh",
}


_lid_extractor = None
_lid_model = None

_asr_processor = None
_asr_model = None

_current_adapter = None

_model_lock = threading.Lock()


def _load_lid():

    global _lid_extractor
    global _lid_model

    if _lid_model is not None:
        return

    print(
        f"[stt] Loading MMS LID "
        f"'{LID_MODEL_ID}'..."
    )

    _lid_extractor = (
        AutoFeatureExtractor
        .from_pretrained(LID_MODEL_ID)
    )

    _lid_model = (
        Wav2Vec2ForSequenceClassification
        .from_pretrained(LID_MODEL_ID)
        .to(DEVICE)
    )

    _lid_model.eval()


def _load_asr():

    global _asr_processor
    global _asr_model

    if _asr_model is not None:
        return

    print(
        f"[stt] Loading MMS ASR "
        f"'{ASR_MODEL_ID}'..."
    )

    _asr_processor = (
        AutoProcessor
        .from_pretrained(ASR_MODEL_ID)
    )

    _asr_model = (
        Wav2Vec2ForCTC
        .from_pretrained(ASR_MODEL_ID)
        .to(DEVICE)
    )

    _asr_model.eval()

    print("[stt] MMS ASR ready.")


def _load_audio(file_path: str):

    audio, sr = sf.read(
        file_path,
        dtype="float32"
    )

    if audio.ndim > 1:
        audio = audio.mean(axis=1)

    if sr != TARGET_SR:

        import torchaudio

        audio_tensor = (
            torch
            .from_numpy(audio)
            .unsqueeze(0)
        )

        audio_tensor = (
            torchaudio.functional.resample(
                audio_tensor,
                sr,
                TARGET_SR
            )
        )

        audio = (
            audio_tensor
            .squeeze(0)
            .numpy()
        )

    return audio


def _detect_language(audio):

    _load_lid()

    inputs = _lid_extractor(
        audio,
        sampling_rate=TARGET_SR,
        return_tensors="pt"
    )

    inputs = {
        key: value.to(DEVICE)
        for key, value in inputs.items()
    }

    with torch.no_grad():

        logits = _lid_model(
            **inputs
        ).logits

    probabilities = torch.softmax(
        logits,
        dim=-1
    )[0]

    lang_id = int(
        torch.argmax(probabilities)
    )

    confidence = float(
        probabilities[lang_id]
    )

    language = (
        _lid_model
        .config
        .id2label[lang_id]
    )

    return language, confidence


def transcribe_audio(
    file_path: str,
    forced_language: str | None = None
):

    global _current_adapter

    audio = _load_audio(
        file_path
    )

    # LOCAL MODE:
    # supplied language means we never load
    # the huge LID model.
    if forced_language:

        language = forced_language
        confidence = 1.0

    else:

        if LOCAL_LOW_MEMORY:

            return {
                "text": "",
                "language": "",
                "confidence": 0.0,
                "supported": False,
                "requires_language": True,
            }

        language, confidence = (
            _detect_language(audio)
        )

    if language not in SUPPORTED_LANGUAGES:

        return {
            "text": "",
            "language": language,
            "confidence": confidence,
            "supported": False,
            "requires_language": False,
        }

    # Load ASR only when actually required.
    _load_asr()

    adapter_language = (
        MMS_LANGUAGE_MAP.get(
            language,
            language
        )
    )

    with _model_lock:

        if adapter_language != _current_adapter:

            print(
                f"[stt] Switching adapter "
                f"to {adapter_language}"
            )

            (
                _asr_processor
                .tokenizer
                .set_target_lang(
                    adapter_language
                )
            )

            _asr_model.load_adapter(
                adapter_language
            )

            _asr_model.to(DEVICE)

            _current_adapter = (
                adapter_language
            )

        inputs = _asr_processor(
            audio,
            sampling_rate=TARGET_SR,
            return_tensors="pt"
        )

        inputs = {
            key: value.to(DEVICE)
            for key, value in inputs.items()
        }

        with torch.no_grad():

            logits = _asr_model(
                **inputs
            ).logits

        ids = torch.argmax(
            logits,
            dim=-1
        )

        text = (
            _asr_processor
            .batch_decode(ids)[0]
        )

    return {
        "text": text.strip(),
        "language": language,
        "confidence": confidence,
        "supported": True,
        "requires_language": False,
    }