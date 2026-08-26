import os

from groq import Groq


GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b"
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


def generate_response(
    user_text: str,
    rag_context: str,
    language: str
) -> str:

    api_key = os.getenv(
        "GROQ_API_KEY"
    )

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not configured."
        )

    client = Groq(
        api_key=api_key
    )

    language_name = (
        LANGUAGE_NAMES.get(
            language,
            "English"
        )
    )

    system_prompt = f"""
You are a supportive relationship and wellbeing assistant.

You are given knowledge retrieved from the YesLove knowledge base.

Rules:
1. Use the provided knowledge as your primary source.
2. Answer the user's actual question, not merely summarise the context.
3. Respond in {language_name}.
4. Keep the response conversational, supportive and easy to understand.
5. Keep the answer concise, preferably 2 to 4 short paragraphs.
6. Do not mention that you are reading retrieved chunks or RAG context.
7. If the provided context does not contain enough information, say so clearly.
8. Do not invent facts that are not supported by the supplied context.
"""

    user_prompt = f"""
USER QUESTION:

{user_text}


YESLOVE KNOWLEDGE:

{rag_context}


Answer the user's question in {language_name}.
"""

    completion = (
        client.chat.completions.create(
            model=GROQ_MODEL,

            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],

            temperature=0.4,

            max_tokens=500,
        )
    )

    response = (
        completion
        .choices[0]
        .message
        .content
    )

    if not response:
        raise RuntimeError(
            "Groq returned an empty response."
        )

    return response.strip()