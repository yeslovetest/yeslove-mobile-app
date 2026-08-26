"""add wordpress blog cache fields

Revision ID: c9b3f2a1e7d4
Revises: b1d2c3e4f5a6
Create Date: 2026-07-14 16:30:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "c9b3f2a1e7d4"
down_revision = "b1d2c3e4f5a6"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("blog_posts", schema=None) as batch_op:
        batch_op.add_column(sa.Column("wp_post_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("source", sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column("status", sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column("slug", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("link", sa.String(length=1000), nullable=True))
        batch_op.add_column(sa.Column("modified_at", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("synced_at", sa.DateTime(), nullable=True))
        batch_op.create_index(batch_op.f("ix_blog_posts_source"), ["source"], unique=False)
        batch_op.create_index(batch_op.f("ix_blog_posts_wp_post_id"), ["wp_post_id"], unique=True)

    op.execute("UPDATE blog_posts SET source = 'local' WHERE source IS NULL")


def downgrade():
    with op.batch_alter_table("blog_posts", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_blog_posts_wp_post_id"))
        batch_op.drop_index(batch_op.f("ix_blog_posts_source"))
        batch_op.drop_column("synced_at")
        batch_op.drop_column("modified_at")
        batch_op.drop_column("link")
        batch_op.drop_column("slug")
        batch_op.drop_column("status")
        batch_op.drop_column("source")
        batch_op.drop_column("wp_post_id")
