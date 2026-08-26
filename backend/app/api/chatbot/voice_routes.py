import os
import tempfile
import traceback
import requests
import base64 

from flask import request
from flask_restx import Namespace, Resource

from app.services.multilingual_llm import generate_response
from app.services.multilingual_stt import transcribe_audio
from app.services.audio_utils import convert_to_wav
from app.services.multilingual_tts import synthesize_speech


api = Namespace(
    "multilingual",
    description="Multilingual YesLove chatbot testing API"
)


LANGUAGE_NAMES = {
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


RAG_URL = os.getenv(
    "RAG_SERVICE_URL",
    "http://127.0.0.1:8000/api/v1/chat/retrieve"
)


@api.route("/voice")
class VoiceChat(Resource):

    def post(self):

        # --------------------------------------------------
        # 1. Validate uploaded audio
        # --------------------------------------------------

        if "audio" not in request.files:
            return {
                "error": "Audio file is required"
            }, 400

        audio = request.files["audio"]

        # --------------------------------------------------
        # 2. Read form fields
        # --------------------------------------------------

        session_id = request.form.get(
            "session_id",
            "local-test"
        )

        language = request.form.get(
            "language",
            ""
        ).strip()

        # For low-memory local testing we force
        # the selected language instead of loading MMS-LID.
        if not language:
            return {
                "error": "Language is required for local testing.",
                "requires_language": True
            }, 400

        if language not in LANGUAGE_NAMES:
            return {
                "error": f"Unsupported language: {language}",
                "supported": False
            }, 400

        # --------------------------------------------------
        # 3. Determine uploaded extension
        # --------------------------------------------------

        suffix = os.path.splitext(
            audio.filename or "recording.webm"
        )[1]

        if not suffix:
            suffix = ".webm"

        temp_path = None
        wav_path = None

        try:

            # --------------------------------------------------
            # 4. Save uploaded audio
            # --------------------------------------------------

            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=suffix
            ) as temp_file:

                audio.save(temp_file.name)
                temp_path = temp_file.name

            # --------------------------------------------------
            # 5. Convert to WAV
            # --------------------------------------------------

            wav_path = convert_to_wav(
                temp_path
            )

            # --------------------------------------------------
            # 6. MMS Speech-to-Text
            # --------------------------------------------------

            stt_result = transcribe_audio(
                wav_path,
                forced_language=language
            )

            # --------------------------------------------------
            # 7. Validate STT result
            # --------------------------------------------------

            if not stt_result.get(
                "supported",
                False
            ):
                return {
                    "session_id": session_id,
                    "user_text": "",
                    "language": language,
                    "language_name":
                        LANGUAGE_NAMES.get(
                            language,
                            language
                        ),
                    "confidence":
                        stt_result.get(
                            "confidence",
                            0.0
                        ),
                    "supported": False,
                    "requires_language": False,
                    "message":
                        "This language is not supported."
                }, 200

            user_text = (
                stt_result
                .get("text", "")
                .strip()
            )

            if not user_text:
                return {
                    "error":
                        "No speech could be transcribed.",
                    "session_id":
                        session_id,
                    "language":
                        language,
                    "supported":
                        True
                }, 400

            print(
                f"[voice] Transcription: {user_text}"
            )

            # --------------------------------------------------
            # 8. RAG-only retrieval
            #
            # NO LLM
            # NO OpenAI
            # --------------------------------------------------

            print(
                f"[voice] Sending text to RAG: {RAG_URL}"
            )

            rag_response = requests.post(
                RAG_URL,
                json={
                    "message": user_text
                },
                timeout=30
            )

            rag_response.raise_for_status()

            rag_data = rag_response.json()

            rag_context = (
                rag_data
                .get(
                    "response",
                    ""
                )
                .strip()
            )

            print(
                f"[voice] RAG context length: "
                f"{len(rag_context)}"
            )

            response_text = generate_response(
            user_text=user_text,
            rag_context=rag_context,
            language=language
            )

            print(
                f"[voice] LLM response: "
                f"{response_text}"
            )

            # --------------------------------------------------
            # TTS
            # --------------------------------------------------

            tts_result = synthesize_speech(
                response_text,
                language
            )

            audio_chunks_base64 = []

            if tts_result.get(
                "available",
                False
            ):
                for audio_bytes in tts_result.get(
                "audio_chunks",
                []
            ):
                    encoded = base64.b64encode(
                    audio_bytes
                ).decode("utf-8")

                audio_chunks_base64.append(
                encoded
            )
            print(
                f"[voice] RAG response length: "
                f"{len(response_text)}"
            )

            # --------------------------------------------------
            # 9. Return STT + RAG response
            #
            # TTS will be added after this test succeeds.
            # --------------------------------------------------

            return {
                "session_id":
                    session_id,

                "user_text":
                    user_text,

                "bot_text":
                    response_text,

                "language":
                    stt_result.get(
                        "language",
                        language
                    ),

                "detected_language":
                    stt_result.get(
                        "language",
                        language
                    ),

                "language_name":
                    LANGUAGE_NAMES.get(
                        language,
                        language
                    ),

                "confidence":
                    stt_result.get(
                        "confidence",
                        1.0
                    ),

                "supported":
                    True,

                "requires_language":
                    False,

                "requires_language_confirmation":
                    False,

                "mode":
                    "rag_only",

                # TTS disabled temporarily
                "tts_available":
                    len(audio_chunks_base64) > 0,

                "audio_chunks_base64":
                    audio_chunks_base64,

                "audio_base64":
                   audio_chunks_base64[0]
                    if audio_chunks_base64
                    else None
        },200

        except requests.RequestException as exc:

            traceback.print_exc()

            return {
                "error":
                    f"RAG service error: {str(exc)}"
            }, 503

        except Exception as exc:

            traceback.print_exc()

            return {
                "error": str(exc)
            }, 500

        finally:

            # --------------------------------------------------
            # 10. Clean temporary files
            # --------------------------------------------------

            if (
                temp_path
                and os.path.exists(temp_path)
            ):
                os.remove(temp_path)

            if (
                wav_path
                and os.path.exists(wav_path)
            ):
                os.remove(wav_path)


@api.route("/text")

class TextChat(Resource):

    def post(self):

        data = request.get_json(
            silent=True
        ) or {}

        user_text = (
            data
            .get("message", "")
            .strip()
        )

        language = (
            data
            .get("language", "eng")
            .strip()
        )

        session_id = data.get(
            "session_id",
            "local-test"
        )

        if not user_text:
            return {
                "error": "Message is required"
            }, 400

        if language not in LANGUAGE_NAMES:
            return {
                "error":
                    f"Unsupported language: {language}"
            }, 400

        try:

            # -------------------------
            # RAG ONLY
            # -------------------------

            rag_response = requests.post(
                RAG_URL,
                json={
                    "message": user_text
                },
                timeout=30
            )

            rag_response.raise_for_status()

            rag_data = (
                rag_response.json()
            )

            rag_context = (
                rag_data
                .get(
                    "response",
                    ""
                )
                .strip()
            )

            response_text = generate_response(
                user_text=user_text,
                rag_context=rag_context,
                language=language
            )

            # -------------------------
            # TTS
            # -------------------------

            tts_result = synthesize_speech(
                response_text,
                language
            )

            audio_chunks_base64 = []

            for audio_bytes in (
                tts_result.get(
                    "audio_chunks",
                    []
                )
            ):
                audio_chunks_base64.append(
                    base64.b64encode(
                        audio_bytes
                    ).decode("utf-8")
                )

            return {
                "session_id":
                    session_id,

                "user_text":
                    user_text,

                "bot_text":
                    response_text,

                "language":
                    language,

                "language_name":
                    LANGUAGE_NAMES.get(
                        language,
                        language
                    ),

                "mode":
                    "rag_only",

                "tts_available":
                    len(
                        audio_chunks_base64
                    ) > 0,

                "audio_chunks_base64":
                    audio_chunks_base64,

                "audio_base64":
                    audio_chunks_base64[0]
                    if audio_chunks_base64
                    else None
            }, 200

        except requests.RequestException as exc:

            traceback.print_exc()

            return {
                "error":
                    f"RAG service error: {exc}"
            }, 503

        except Exception as exc:

            traceback.print_exc()

            return {
                "error": str(exc)
            }, 500