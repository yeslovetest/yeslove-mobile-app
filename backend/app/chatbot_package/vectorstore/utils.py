import os
from openai import OpenAI
import tiktoken
from dotenv import load_dotenv

# Initialize OpenAI client
openai = OpenAI()

# Embedding model and encoder
EMBED_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
ENCODER = tiktoken.encoding_for_model(EMBED_MODEL)

def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Get embeddings for a list of texts.
    """
    resp = openai.embeddings.create(model=EMBED_MODEL, input=texts)
    return [d.embedding for d in resp.data]

def embed(text: str) -> list[float]:
    """
    Get embedding for a single text.
    """
    return embed_texts([text])[0]

def chunk_text(text: str, max_tokens: int = 500, overlap: int = 50) -> list[str]:
    """
    Split text into chunks of max_tokens with overlap.
    """
    toks = ENCODER.encode(text)
    chunks = []
    for i in range(0, len(toks), max_tokens - overlap):
        chunk = ENCODER.decode(toks[i : i + max_tokens])
        chunks.append(chunk)
    return chunks