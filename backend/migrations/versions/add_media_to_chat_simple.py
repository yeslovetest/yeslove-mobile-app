"""Add media_id to chat table

Revision ID: add_media_to_chat_simple
Revises: 436d231d72ae
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_media_to_chat_simple'
down_revision = '436d231d72ae'
branch_labels = None
depends_on = None

def upgrade():
    # Use batch operations for SQLite compatibility
    with op.batch_alter_table('chat', schema=None) as batch_op:
        batch_op.add_column(sa.Column('media_id', sa.String(36), nullable=True))
        batch_op.alter_column('message', existing_type=sa.TEXT(), nullable=True)
        batch_op.create_foreign_key('fk_chat_media_id', 'media', ['media_id'], ['id'])

def downgrade():
    # Use batch operations for SQLite compatibility
    with op.batch_alter_table('chat', schema=None) as batch_op:
        batch_op.drop_constraint('fk_chat_media_id', type_='foreignkey')
        batch_op.drop_column('media_id')
        batch_op.alter_column('message', existing_type=sa.TEXT(), nullable=False)