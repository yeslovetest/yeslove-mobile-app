from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
import logging
from .db import SessionLocal
from app.models import Document 
from app.chatbot_package.vectorstore.utils import embed_texts

def query_rag(query: str, top_k: int = 5) -> list[str]:
    """
    Embed the query text and retrieve the top_k most similar document chunks.
    """
    # 1) Get the raw list of floats
    embedding = embed_texts([query])[0]

    try:
        # 2) Use a session context manager to handle commit/rollback/close automatically
        with SessionLocal() as session:
            stmt = (
                select(Document.content)
                # 3) Pass the raw list directly—no PGVector()
                .order_by(Document.embedding.cosine_distance(embedding))
                .limit(top_k)
            )
            return session.execute(stmt).scalars().all()

    except SQLAlchemyError:
        logging.exception("Error running RAG query")
        # decide if you want to propagate or return a safe default:
        return []