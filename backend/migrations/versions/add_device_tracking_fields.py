"""Add device tracking fields to DeviceToken

Revision ID: add_device_tracking
Revises: abc123def456
Create Date: 2024-01-01 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'add_device_tracking'
down_revision = 'abc123def456'
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to device_token table
    with op.batch_alter_table('device_token', schema=None) as batch_op:
        batch_op.add_column(sa.Column('device_id', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('last_used', sa.DateTime(), nullable=True, default=datetime.utcnow))

def downgrade():
    # Remove added columns
    with op.batch_alter_table('device_token', schema=None) as batch_op:
        batch_op.drop_column('last_used')
        batch_op.drop_column('device_id')