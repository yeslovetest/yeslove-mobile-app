"""drop user phone_number and address columns

Revision ID: f3a9c1d7e2b8
Revises: 49e0870a5bd6
Create Date: 2026-07-26 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f3a9c1d7e2b8'
down_revision = '49e0870a5bd6'
branch_labels = None
depends_on = None


def upgrade():
    # Remove the User's phone_number and address columns.
    # Batch mode is required so this also works on SQLite.
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('phone_number')
        batch_op.drop_column('address')


def downgrade():
    # Re-add the columns (nullable) so the migration is reversible.
    # Note: previously stored values are NOT restored by a downgrade.
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('address', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('phone_number', sa.String(length=20), nullable=True))