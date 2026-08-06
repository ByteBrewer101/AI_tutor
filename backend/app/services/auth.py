import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.config import settings

TOKEN_TTL_DAYS = 30


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_auth_token(user_id: uuid.UUID) -> str:
    """Mint an HS256 JWT with the user id in the ``sub`` claim.

    Symmetric with ``decode_auth_token`` and verified by ``get_current_user``.
    """
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(days=TOKEN_TTL_DAYS),
    }
    return jwt.encode(payload, settings.AUTH_SECRET, algorithm=settings.AUTH_ALGORITHM)


def decode_auth_token(token: str) -> dict:
    """Decode the HS256 JWT issued by the NextAuth BFF.

    The BFF overrides Auth.js's default encrypted sessions and issues a plain
    signed JWT using the shared AUTH_SECRET. The user id is in the ``sub`` claim.
    """
    return jwt.decode(token, settings.AUTH_SECRET, algorithms=[settings.AUTH_ALGORITHM])


def user_id_from_token(token: str) -> uuid.UUID | None:
    try:
        payload = decode_auth_token(token)
    except jwt.InvalidTokenError:
        return None
    sub = payload.get("sub")
    if sub is None:
        return None
    try:
        return uuid.UUID(str(sub))
    except (ValueError, AttributeError):
        return None
