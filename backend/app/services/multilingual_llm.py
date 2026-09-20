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


# Each persona pairs a language with a named voice and a short note on
# cultural context the model should stay mindful of - not fixed assumptions
# about any individual user, but context that can help it recognise and take
# seriously things a same-culture friend would (family/community involvement
# in relationship decisions, religious or honour-related pressures, in-law
# dynamics, etc.) rather than defaulting to a Western-individualist frame.
# This is intentionally general: it primes sensitivity, not stereotypes, and
# the prompt explicitly tells the model to follow the user's own framing
# over any assumption here.
PERSONAS = {
    "eng": {
        "name": "Sera",
        "culture_label": "English",
        "cultural_notes": (
            "Respond with a general Western-cultural frame of reference, but "
            "do not assume it applies universally - the user may draw on a "
            "different cultural background than their language suggests."
        ),
    },
    "pan": {
        "name": "Simran",
        "culture_label": "Punjabi",
        "cultural_notes": (
            "Be mindful that in many Punjabi-speaking communities, extended "
            "family and community reputation ('izzat') can weigh heavily on "
            "relationship decisions, and that arranged or family-involved "
            "introductions are common and not inherently a red flag."
        ),
    },
    "urd": {
        "name": "Fatima",
        "culture_label": "Urdu",
        "cultural_notes": (
            "Be mindful that in many Urdu-speaking communities, family "
            "approval, religious considerations, and joint or extended "
            "family living arrangements often play a central role in "
            "relationships - factor this in without assuming it defines "
            "this particular user's situation."
        ),
    },
    "ben": {
        "name": "Ayesha",
        "culture_label": "Bengali",
        "cultural_notes": (
            "Be mindful that in many Bengali-speaking communities, family "
            "opinion, community standing, and close-knit extended family "
            "ties often shape relationship decisions and conflicts."
        ),
    },
    "ara": {
        "name": "Layla",
        "culture_label": "Arabic",
        "cultural_notes": (
            "Be mindful that across Arabic-speaking communities, family "
            "involvement, religious guidance, and community/family "
            "reputation can be significant factors - while recognising this "
            "spans many countries and levels of religious observance, so "
            "avoid assuming any single practice applies."
        ),
    },
    "som": {
        "name": "Amina",
        "culture_label": "Somali",
        "cultural_notes": (
            "Be mindful that in many Somali communities, clan and extended "
            "family relationships, religious values, and community opinion "
            "can strongly influence relationship decisions."
        ),
    },
    "yor": {
        "name": "Amara",
        "culture_label": "Yoruba",
        "cultural_notes": (
            "Be mindful that in many Yoruba communities, extended family "
            "involvement, respect for elders, and community/family "
            "expectations around marriage and courtship are often "
            "significant."
        ),
    },
    "ibo": {
        "name": "Chioma",
        "culture_label": "Igbo",
        "cultural_notes": (
            "Be mindful that in many Igbo communities, family and extended "
            "kinship networks, bride price traditions, and community "
            "expectations often play a meaningful role in relationships."
        ),
    },
    "swh": {
        "name": "Zawadi",
        "culture_label": "Swahili",
        "cultural_notes": (
            "Be mindful that across Swahili-speaking East African "
            "communities, extended family, religious background (Muslim or "
            "Christian), and community ties can meaningfully shape "
            "relationship expectations and pressures."
        ),
    },
}


def get_persona(language: str) -> dict:
    """Return the persona for a language code, defaulting to English/Sera."""
    return PERSONAS.get(language, PERSONAS["eng"])


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
        api_key=api_key,
        timeout=30,
    )

    language_name = (
        LANGUAGE_NAMES.get(
            language,
            "English"
        )
    )
    persona = get_persona(language)

    system_prompt = f"""
You are {persona['name']}, a supportive relationship and wellbeing assistant.

You are given knowledge retrieved from the YesLove knowledge base.

Cultural context: {persona['cultural_notes']} Let the user's own words define
their actual situation - use this only to avoid missing something a
culturally-aware listener would catch, never to assume specifics about them.

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