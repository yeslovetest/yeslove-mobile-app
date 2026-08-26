import os, glob 
from openai import OpenAI

from app.chatbot_package.vectorstore.db import SessionLocal
from app.chatbot_package.vectorstore.models import Document
from app.chatbot_package.vectorstore.utils import embed_texts, chunk_text
from dotenv import load_dotenv

# OpenAI key held in chatbot_packages, so backend/.env loaded first then the chatbot_package/.env 
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Initialize OpenAI client (optional override via env)
openai = OpenAI()

# Directory containing your Markdown knowledge base files
BASE = os.path.dirname(__file__)
KB_DIR = os.getenv("KB_DIR", 
                   os.path.abspath(os.path.join(BASE, "..", "knowledge_base"))
                   )


def ingest_all():
    """
    Read all Markdown files, chunk them, embed, and store in Postgres.
    """
    print("🔍 Searching for files in:", KB_DIR)
    paths = glob.glob(os.path.join(KB_DIR, "*.md"))
    print("🗂️  Found markdown files:", paths)
    session = SessionLocal()
    try:
        for path in glob.glob(os.path.join(KB_DIR, "*.md")):
            with open(path, "r", encoding="utf-8") as f:
                text = f.read()

            # Split into overlapping chunks
            chunks = chunk_text(text)
            # Get embeddings for each chunk
            embeddings = embed_texts(chunks)

            # Create Document records
            for idx, (chunk, emb) in enumerate(zip(chunks, embeddings)):
                doc = Document(
                    source=os.path.basename(path), # type: ignore
                    chunk_index=idx, # type: ignore
                    content=chunk, # type: ignore
                    embedding=emb # type: ignore
                )
                session.add(doc)

        # Commit all at once
        session.commit()
        print(f"Ingested {session.query(Document).count()} document chunks.")

    except Exception:
        session.rollback()
        raise

    finally:
        session.close()


if __name__ == "__main__":
    ingest_all()
