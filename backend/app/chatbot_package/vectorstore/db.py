import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Pull the URL from your .env
DATABASE_URL = os.getenv("VECTOR_DATABASE_URL")

# Create engine
engine = create_engine(DATABASE_URL, future=True)

# SessionLocal is your “function” to get a new Session
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False
)