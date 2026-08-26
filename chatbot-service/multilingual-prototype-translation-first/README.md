# YesLove! AI UI

This UI exposes two parts of the current prototype:

1. Translation-First architecture
2. Faster Whisper speech-to-text evaluation

## Run locally

Create a virtual environment, install the requirements, set the Gemini API key as an environment variable, then run:

```bash
pip install -r requirements.txt
streamlit run app.py
```

The UI expects:

```text
GEMINI_API_KEY
```

as an environment variable.

Do not hard-code API keys in `app.py` or any notebook before pushing to GitHub.
