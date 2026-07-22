"""Shared FastAPI dependencies."""

from fastapi import Header

from app.schemas import UserSession
from app.security import decode_access_token


async def get_optional_user(
    authorization: str | None = Header(default=None),
) -> UserSession | None:
    """Extract user from Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.removeprefix("Bearer ").strip()
    if not token or token == "invalid":
        return None

    decoded = decode_access_token(token)
    if not decoded:
        return None

    return UserSession(
        user_id=decoded.get("sub"),
        email=decoded.get("email"),
        gmail_connected=decoded.get("gmail_connected", False),
        display_name=decoded.get("name"),
    )
