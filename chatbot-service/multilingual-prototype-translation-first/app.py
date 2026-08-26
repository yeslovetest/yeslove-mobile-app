from dotenv import load_dotenv

load_dotenv()


import os
import tempfile
import time

import streamlit as st
from deep_translator import GoogleTranslator
from langdetect import detect
from google import genai
from faster_whisper import WhisperModel

st.set_page_config(page_title="YesLove! AI", page_icon="", layout="wide")

# -----------------------------
# Configuration
# -----------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

@st.cache_resource
def get_llm():
    if not GEMINI_API_KEY:
        return None
    client = genai.Client(api_key=GEMINI_API_KEY)
    return client

@st.cache_resource
def get_whisper():
    return WhisperModel("base", device="cpu", compute_type="int8")

def translate_text(text, source, target):
    return GoogleTranslator(source=source, target=target).translate(text)

def run_translation_first(user_message):
    detected_language = detect(user_message)

    t1 = time.time()
    english = translate_text(user_message, "auto", "en")
    t2 = time.time()

    llm = get_llm()
    if llm is None:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured. Set it as an environment variable."
        )

    g1 = time.time()
    response = llm.models.generate_content(
        model="gemini-3.6-flash",
        contents=english
    )
    english_response = response.text
    g2 = time.time()

    b1 = time.time()
    final_response = translate_text(
        english_response, "en", detected_language
    )
    b2 = time.time()

    return {
        "language": detected_language,
        "english": english,
        "llm_response": english_response,
        "response": final_response,
        "translation_time": t2 - t1,
        "llm_time": g2 - g1,
        "back_translation_time": b2 - b1,
        "total_time": (t2 - t1) + (g2 - g1) + (b2 - b1),
    }

def transcribe_audio(audio_bytes, suffix):
    whisper = get_whisper()

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as f:
        f.write(audio_bytes)
        audio_path = f.name

    try:
        start = time.time()
        segments, info = whisper.transcribe(audio_path)
        transcript = " ".join(segment.text.strip() for segment in segments).strip()
        elapsed = time.time() - start
        return {
            "language": info.language,
            "confidence": info.language_probability,
            "transcript": transcript,
            "time": elapsed,
        }
    finally:
        try:
            os.remove(audio_path)
        except OSError:
            pass

# -----------------------------
# UI
# -----------------------------
st.title("YesLove! AI")
st.caption("Multilingual AI prototype and speech-to-text evaluation")

tab1, tab2 = st.tabs(["Translation-First", "Faster Whisper"])

with tab1:
    st.header("Translation-First Architecture")
    st.write("Translate the user's message to English, generate the LLM response, then translate the response back.")

    user_message = st.text_area(
        "Enter your message",
        placeholder="Type a message in English or another supported language...",
        height=140,
    )

    if st.button("Send", type="primary", key="send_translation"):
        if not user_message.strip():
            st.warning("Please enter a message.")
        else:
            try:
                with st.spinner("Processing..."):
                    result = run_translation_first(user_message)

                st.success("Response generated.")

                col1, col2 = st.columns(2)
                with col1:
                    st.metric("Detected language", result["language"])
                with col2:
                    st.metric("Total time", f"{result['total_time']:.2f}s")

                st.subheader("English Translation")
                st.info(result["english"])

                st.subheader("LLM Response")
                st.write(result["llm_response"])

                st.subheader("Final Translated Response")
                st.success(result["response"])

                with st.expander("Performance details"):
                    st.write(f"Translation: {result['translation_time']:.2f}s")
                    st.write(f"LLM: {result['llm_time']:.2f}s")
                    st.write(f"Back translation: {result['back_translation_time']:.2f}s")
                    st.write(f"Total: {result['total_time']:.2f}s")

            except Exception as e:
                st.error(f"Something went wrong: {e}")

with tab2:
    st.header("Faster Whisper Evaluation")

    st.write(
        "Record your voice or upload an existing recording to test "
        "language detection and transcription."
    )

    # Record directly in the browser
    st.subheader("Record your voice")

    recorded_audio = st.audio_input(
        "Click the microphone button to record",
        sample_rate=16000
    )

    # Or upload an existing recording
    st.subheader("Or upload an audio file")

    uploaded_audio = st.file_uploader(
        "Upload audio",
        type=["wav", "mp3", "m4a", "ogg", "opus", "webm"]
    )

    # Use the recording if available, otherwise use the uploaded file
    audio_file = recorded_audio if recorded_audio is not None else uploaded_audio

    if audio_file is not None:

        st.audio(audio_file)

        if st.button("Transcribe", type="primary", key="whisper_transcribe"):

            with st.spinner("Transcribing..."):

                result = transcribe_audio(
                    audio_file.getvalue(),
                    ".wav"
                )

            st.success("Transcription complete!")

            st.write("### Results")

            st.write(
                "**Detected language:**",
                result["language"]
            )

            st.write(
                "**Language confidence:**",
                f"{result['confidence'] * 100:.1f}%"
            )

            st.write(
                "**Transcription time:**",
                f"{result['time']:.2f} seconds"
            )

            st.write("### Transcript")

            st.write(result["transcript"])