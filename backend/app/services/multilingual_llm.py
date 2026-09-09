import os

from groq import Groq
from app.services.personas import get_persona


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
    language: str,
    persona: str = "neutral"
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

    persona_data = get_persona(persona)

    persona_name = persona_data["name"]
    persona_prompt = persona_data["prompt"]

    system_prompt = f"""
You are YesLove, a supportive relationship and wellbeing assistant.

CURRENT PERSONA:
{persona_name}

PERSONA BEHAVIOUR:
{persona_prompt}

LANGUAGE:
Respond in {language_name}.

KNOWLEDGE RULES:
1. Use the provided YesLove knowledge as your primary source.
2. Answer the user's actual question.
3. Do not simply summarise the retrieved information.
4. Do not invent facts that are not supported by the supplied knowledge.
5. If there is not enough information, say so clearly.

PERSONA RULES:
1. The selected persona must noticeably influence the response style.
2. Follow the persona's tone, conversational behaviour and advice style throughout the response.
3. Do not default to a generic assistant tone.
4. Different personas should approach the same situation differently while remaining grounded in the same YesLove knowledge.
5. Persona changes communication style and perspective, not factual knowledge or safety rules.
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

            temperature=0.6,

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