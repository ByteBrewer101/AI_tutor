"""add notebook published_at

Revision ID: c1d2e3f4a5b6
Revises: b2c3d4e5f6a7
Create Date: 2026-08-06 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4a5b6'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add published_at so the feed can sort by publish time."""
    op.add_column(
        'notebooks',
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.execute(
        "UPDATE notebooks SET published_at = COALESCE(updated_at, created_at) "
        "WHERE is_public IS TRUE"
    )
    op.create_index('ix_notebooks_published_at', 'notebooks', ['published_at'])


def downgrade() -> None:
    """Remove published_at."""
    op.drop_index('ix_notebooks_published_at', table_name='notebooks')
    op.drop_column('notebooks', 'published_at')
