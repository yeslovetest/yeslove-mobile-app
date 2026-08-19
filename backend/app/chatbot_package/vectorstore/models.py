from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    Text,
)

from sqlalchemy.orm import declarative_base
from pgvector.sqlalchemy import Vector


Base = declarative_base()


class Document(Base):
    __tablename__ = "documents"

    id = Column(
        Integer,
        primary_key=True
    )

    source = Column(
        Text,
        nullable=False
    )

    chunk_index = Column(
        Integer,
        nullable=False
    )

    content = Column(
        Text,
        nullable=False
    )

    embedding = Column(
        Vector(1536),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )