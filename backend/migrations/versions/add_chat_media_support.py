"""Add media support to chat

Revision ID: add_chat_media_support
Revises: 5593202cc71c
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_chat_media_support'
down_revision = '5593202cc71c'
branch_labels = None
depends_on = None

def upgrade():
    # Add media_id column to chat table
    op.add_column('chat', sa.Column('media_id', sa.String(36), nullable=True))
    
    # Add foreign key constraint
    op.create_foreign_key('fk_chat_media_id', 'chat', 'media', ['media_id'], ['id'])
    
    # Make message column nullable since we can have media-only messages
    op.alter_column('chat', 'message', nullable=True)
    
    # Add check constraint to ensure either message or media_id exists
    op.create_check_constraint(
        'check_message_or_media',
        'chat',
        'message IS NOT NULL OR media_id IS NOT NULL'
    )

def downgrade():
    # Remove constraints and column
    op.drop_constraint('check_message_or_media', 'chat')
    op.drop_constraint('fk_chat_media_id', 'chat')
    op.drop_column('chat', 'media_id')
    
    # Make message column non-nullable again
    op.alter_column('chat', 'message', nullable=False)