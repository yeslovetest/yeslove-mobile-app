import os
import openai
from dotenv import load_dotenv

load_dotenv()

def setup_openai():
    """Setup OpenAI API key"""
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        openai.api_key = api_key

def embed_text(text: str) -> list[float]:
    """Generate embedding for a single text"""
    setup_openai()
    response = openai.Embedding.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response['data'][0]['embedding']

def embed_texts(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for multiple texts"""
    setup_openai()
    response = openai.Embedding.create(
        model="text-embedding-ada-002",
        input=texts
    )
    return [data['embedding'] for data in response['data']]