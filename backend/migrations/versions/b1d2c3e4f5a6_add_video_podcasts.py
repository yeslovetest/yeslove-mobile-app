"""add video podcasts table

Revision ID: b1d2c3e4f5a6
Revises: 797c143dcaa8
Create Date: 2026-05-14 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'b1d2c3e4f5a6'
down_revision = '797c143dcaa8'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'video_podcasts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('transcript', sa.Text(), nullable=True),
        sa.Column('video_url', sa.String(length=1000), nullable=False),
        sa.Column('thumbnail_url', sa.String(length=1000), nullable=True),
        sa.Column('tags', sa.Text(), nullable=True),
        sa.Column('author_id', sa.Integer(), nullable=False),
        sa.Column('published_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['author_id'], ['user.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_video_podcasts_published_at', 'video_podcasts', ['published_at'])


def downgrade():
    op.drop_index('ix_video_podcasts_published_at', table_name='video_podcasts')
    op.drop_table('video_podcasts')
