"""initial

Revision ID: 15e08ee01504
Revises: 
Create Date: 2026-07-20 18:48:25.583002

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '15e08ee01504'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # --- notebooks: add missing columns ---
    op.add_column('notebooks', sa.Column('description', sa.String(length=500), nullable=True))
    op.add_column('notebooks', sa.Column('access_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('notebooks', sa.Column('accessed_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))

    # --- questions: add new columns, migrate data, drop old ---
    op.add_column('questions', sa.Column('type', sa.String(length=10), nullable=False, server_default='open'))
    op.add_column('questions', sa.Column('question', sa.Text(), nullable=True))
    op.add_column('questions', sa.Column('answer', sa.Text(), nullable=True))
    op.add_column('questions', sa.Column('options', postgresql.JSONB(astext_type=sa.Text()), nullable=True))

    # Copy data from old columns to new
    op.execute("UPDATE questions SET question = question_text, answer = answer_text")

    # Drop old columns
    op.alter_column('questions', 'question', nullable=False)
    op.drop_column('questions', 'question_text')
    op.drop_column('questions', 'answer_text')


def downgrade() -> None:
    """Downgrade schema."""
    # Restore old columns
    op.add_column('questions', sa.Column('question_text', sa.TEXT(), autoincrement=False, nullable=False))
    op.add_column('questions', sa.Column('answer_text', sa.TEXT(), autoincrement=False, nullable=True))

    # Copy data back
    op.execute("UPDATE questions SET question_text = question, answer_text = answer")

    op.drop_column('questions', 'options')
    op.drop_column('questions', 'answer')
    op.drop_column('questions', 'question')
    op.drop_column('questions', 'type')
    op.drop_column('notebooks', 'access_count')
    op.drop_column('notebooks', 'accessed_at')
    op.drop_column('notebooks', 'description')
