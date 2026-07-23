"""add content_file_path to topics

Revision ID: a1b2c3d4e5f6
Revises: 15e08ee01504
Create Date: 2026-07-21 18:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '15e08ee01504'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add content_file_path column to topics table."""
    op.add_column('topics', sa.Column('content_file_path', sa.String(length=500), nullable=True))


def downgrade() -> None:
    """Remove content_file_path column from topics table."""
    op.drop_column('topics', 'content_file_path')
