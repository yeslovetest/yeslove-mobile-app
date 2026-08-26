import io
from collections import OrderedDict

import numpy as np
import soundfile as sf
import torch

from transformers import VitsModel, AutoTokenizer


DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

MAX_CACHED_VOICES = 3

_cache = OrderedDict()


def _get_model(language: str):

    if language in _cache:
        _cache.move_to_end(language)
        model, tokenizer = _cache[language]
        return model, tokenizer

    model_id = f"facebook/mms-tts-{language}"

    print(f"[tts] Loading {model_id}")

    try:
        model = (
            VitsModel
            .from_pretrained(model_id)
            .to(DEVICE)
        )

        tokenizer = AutoTokenizer.from_pretrained(
            model_id
        )

    except Exception as exc:

        print(
            f"[tts] TTS unavailable for "
            f"{language}: {exc}"
        )

        return None, None

    model.eval()

    if len(_cache) >= MAX_CACHED_VOICES:

        removed_language, _ = (
            _cache.popitem(last=False)
        )

        print(
            f"[tts] Removed cached voice: "
            f"{removed_language}"
        )

    _cache[language] = (
        model,
        tokenizer
    )

    return model, tokenizer


def synthesize_speech(
    text: str,
    language: str
):
    # RAG currently returns English text.
    # Keep English TTS for this temporary RAG-only POC.
    tts_language = language

    model, tokenizer = _get_model(
        tts_language
    )

    if model is None:
        return {
            "available": False,
            "audio_chunks": []
        }

    clean_text = text.strip()

    if not clean_text:
        return {
            "available": False,
            "audio_chunks": []
        }

    # Keep individual VITS requests small.
    MAX_CHARS = 260

    chunks = []

    while clean_text:

        if len(clean_text) <= MAX_CHARS:
            chunks.append(clean_text)
            break

        # Prefer splitting at sentence boundary.
        split_at = clean_text.rfind(
            ".",
            0,
            MAX_CHARS
        )

        # Otherwise split at whitespace.
        if split_at < 80:
            split_at = clean_text.rfind(
                " ",
                0,
                MAX_CHARS
            )

        if split_at <= 0:
            split_at = MAX_CHARS

        chunk = clean_text[
            :split_at + 1
        ].strip()

        if chunk:
            chunks.append(chunk)

        clean_text = clean_text[
            split_at + 1:
        ].strip()

    print(
        f"[tts] Input language: {language}"
    )

    print(
        f"[tts] Voice language: {tts_language}"
    )

    print(
        f"[tts] Total chunks: {len(chunks)}"
    )

    audio_chunks = []

    for index, chunk in enumerate(chunks):

        print(
            f"[tts] Generating "
            f"{index + 1}/{len(chunks)} "
            f"({len(chunk)} chars)"
        )

        inputs = tokenizer(
            chunk,
            return_tensors="pt"
        )

        inputs = {
            key: value.to(DEVICE)
            for key, value in inputs.items()
        }

        with torch.no_grad():
            waveform = model(
                **inputs
            ).waveform

        waveform = (
            waveform
            .squeeze()
            .cpu()
            .numpy()
            .astype(np.float32)
        )

        buffer = io.BytesIO()

        sf.write(
            buffer,
            waveform,
            model.config.sampling_rate,
            format="WAV"
        )

        buffer.seek(0)

        audio_chunks.append(
            buffer.read()
        )

    return {
        "available": len(audio_chunks) > 0,
        "audio_chunks": audio_chunks
    }