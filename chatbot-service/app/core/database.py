import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.document import Base

DATABASE_URL = os.getenv("VECTOR_DATABASE_URL", "sqlite:///chatbot.db")

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def create_tables():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()