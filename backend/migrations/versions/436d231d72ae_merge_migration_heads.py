"""Merge migration heads

Revision ID: 436d231d72ae
Revises: add_chat_media_support, add_device_tracking
Create Date: 2025-10-10 16:47:41.833321

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '436d231d72ae'
down_revision = ('add_chat_media_support', 'add_device_tracking')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
