"""add vector extension & documents table

Revision ID: 1cd7e01bfb1f
Revises: 
Create Date: 2025-08-07 15:14:52.955285

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision: str = '1cd7e01bfb1f'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1) enable the pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # 2) create the documents table with vector column
    op.create_table(
        "documents",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("source", sa.Text, nullable=False),
        sa.Column("chunk_index", sa.Integer, nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("embedding",Vector(1536), nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.text("now()"), nullable=False),
    )

    # 3) add an ivfflat index for fast k-NN searches
    op.execute(
        "CREATE INDEX ON documents "
        "USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);"
    )

def downgrade() -> None:
    """Downgrade schema."""
     # undo index, table, and extension
    op.execute("DROP INDEX IF EXISTS documents_embedding_idx;")
    op.drop_table("documents")
    op.execute("DROP EXTENSION IF EXISTS vector;")
