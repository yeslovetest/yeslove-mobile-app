"""merge branches

Revision ID: 824f71d28dd7
Revises: a4290628deb3, add_device_tracking
Create Date: 2025-11-02 14:53:57.019334

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '824f71d28dd7'
down_revision = ('a4290628deb3', 'add_device_tracking')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
