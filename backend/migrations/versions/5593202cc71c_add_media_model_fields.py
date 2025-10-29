"""Add media model fields

Revision ID: 5593202cc71c
Revises: 0ed84cb9a115
Create Date: 2025-01-27 17:40:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '5593202cc71c'
down_revision = '0ed84cb9a115'
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to media table
    with op.batch_alter_table('media', schema=None) as batch_op:
        batch_op.alter_column('content', nullable=True)  # Make nullable for S3 storage
        batch_op.add_column(sa.Column('filename', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('file_size', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('width', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('height', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('duration', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('created_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('is_public', sa.Boolean(), nullable=True, default=True))
        batch_op.add_column(sa.Column('s3_url', sa.String(length=500), nullable=True))
        batch_op.create_foreign_key('fk_media_user_id', 'user', ['user_id'], ['id'])

def downgrade():
    # Remove added columns
    with op.batch_alter_table('media', schema=None) as batch_op:
        batch_op.drop_constraint('fk_media_user_id', type_='foreignkey')
        batch_op.drop_column('s3_url')
        batch_op.drop_column('is_public')
        batch_op.drop_column('created_at')
        batch_op.drop_column('user_id')
        batch_op.drop_column('duration')
        batch_op.drop_column('height')
        batch_op.drop_column('width')
        batch_op.drop_column('file_size')
        batch_op.drop_column('filename')
        batch_op.alter_column('content', nullable=False)