"""auth and visibility

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-08-06 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # --- users ---
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('display_name', sa.String(length=100), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )

    # --- notebooks: owner + visibility ---
    op.add_column(
        'notebooks',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
    )
    op.add_column(
        'notebooks',
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.text('true')),
    )
    op.create_index('ix_notebooks_user_id', 'notebooks', ['user_id'])
    op.create_index('ix_notebooks_is_public', 'notebooks', ['is_public'])

    # --- progress: per-user ---
    op.add_column(
        'progress',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
    )
    op.drop_constraint('progress_topic_id_key', 'progress', type_='unique')
    op.create_index('ix_progress_user_topic', 'progress', ['user_id', 'topic_id'], unique=True)

    # --- margin notes removed ---
    op.drop_table('margin_notes')


def downgrade() -> None:
    """Downgrade schema."""
    op.create_table(
        'margin_notes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('topic_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('topics.id'), nullable=False),
        sa.Column('text', sa.TEXT(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    op.drop_index('ix_progress_user_topic', table_name='progress')
    op.create_unique_constraint('progress_topic_id_key', 'progress', ['topic_id'])
    op.drop_column('progress', 'user_id')

    op.drop_index('ix_notebooks_is_public', table_name='notebooks')
    op.drop_index('ix_notebooks_user_id', table_name='notebooks')
    op.drop_column('notebooks', 'is_public')
    op.drop_column('notebooks', 'user_id')

    op.drop_table('users')
