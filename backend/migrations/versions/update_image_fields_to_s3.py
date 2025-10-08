"""Update image fields to S3 URLs

Revision ID: update_image_fields_to_s3
Revises: 5593202cc71c_add_media_model_fields
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'abc123def456'
down_revision = '4893553cb2e3'
branch_labels = None
depends_on = None


def upgrade():
    # SQLite doesn't support DROP COLUMN, use batch operations
    
    # Update Post table: image -> image_url
    with op.batch_alter_table('post', schema=None) as batch_op:
        batch_op.add_column(sa.Column('image_url', sa.String(length=500), nullable=True))
        batch_op.drop_column('image')
    
    # Update User table: profile_pic -> profile_pic_url
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('profile_pic_url', sa.String(length=500), nullable=True))
        batch_op.drop_column('profile_pic')
    
    # Add image_url to Event table
    with op.batch_alter_table('event', schema=None) as batch_op:
        batch_op.add_column(sa.Column('image_url', sa.String(length=500), nullable=True))


def downgrade():
    # Reverse the changes using batch operations
    
    with op.batch_alter_table('event', schema=None) as batch_op:
        batch_op.drop_column('image_url')
    
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('profile_pic', sa.String(length=200), nullable=True))
        batch_op.drop_column('profile_pic_url')
    
    with op.batch_alter_table('post', schema=None) as batch_op:
        batch_op.add_column(sa.Column('image', sa.String(length=200), nullable=True))
        batch_op.drop_column('image_url')