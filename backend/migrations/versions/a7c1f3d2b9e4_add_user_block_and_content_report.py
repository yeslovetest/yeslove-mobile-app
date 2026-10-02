"""add user_block and content_report tables

Revision ID: a7c1f3d2b9e4
Revises: d39f20095b92
Create Date: 2026-10-02 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'a7c1f3d2b9e4'
down_revision = 'd39f20095b92'
branch_labels = None
depends_on = None


def _existing_tables():
    return set(sa.inspect(op.get_bind()).get_table_names())


def upgrade():
    # The app also creates these tables on startup (checkfirst), so guard against
    # them already existing.
    existing = _existing_tables()

    if 'user_block' not in existing:
        op.create_table(
            'user_block',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('blocker_id', sa.Integer(), nullable=False),
            sa.Column('blocked_id', sa.Integer(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.CheckConstraint('blocker_id != blocked_id', name='check_no_self_block'),
            sa.ForeignKeyConstraint(['blocked_id'], ['user.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['blocker_id'], ['user.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('blocker_id', 'blocked_id', name='unique_user_block'),
        )
        op.create_index('ix_user_block_blocker_id', 'user_block', ['blocker_id'])
        op.create_index('ix_user_block_blocked_id', 'user_block', ['blocked_id'])

    if 'content_report' not in existing:
        op.create_table(
            'content_report',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('reporter_id', sa.Integer(), nullable=False),
            sa.Column('reported_user_id', sa.Integer(), nullable=True),
            sa.Column('content_type', sa.String(length=20), nullable=False),
            sa.Column('content_id', sa.Integer(), nullable=False),
            sa.Column('reason', sa.String(length=30), nullable=False),
            sa.Column('details', sa.String(length=500), nullable=True),
            sa.Column('status', sa.String(length=20), nullable=False),
            sa.Column('admin_notes', sa.Text(), nullable=True),
            sa.Column('reviewed_by', sa.Integer(), nullable=True),
            sa.Column('reviewed_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['reported_user_id'], ['user.id'], ondelete='SET NULL'),
            sa.ForeignKeyConstraint(['reporter_id'], ['user.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('reporter_id', 'content_type', 'content_id', name='unique_content_report'),
        )
        op.create_index('ix_content_report_reporter_id', 'content_report', ['reporter_id'])
        op.create_index('ix_content_report_reported_user_id', 'content_report', ['reported_user_id'])


def downgrade():
    op.drop_table('content_report')
    op.drop_table('user_block')
