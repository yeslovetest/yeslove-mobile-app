"""Merge migration heads

Revision ID: 2537837e19f7
Revises: add_media_to_chat_simple
Create Date: 2025-10-10 16:52:55.588543

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2537837e19f7'
down_revision = 'add_media_to_chat_simple'
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
