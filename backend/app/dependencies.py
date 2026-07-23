"""Shared FastAPI dependencies."""

from fastapi import Header, HTTPException

from app.schemas import UserSession
from app.security import decode_access_token


async def get_optional_user(
    authorization: str | None = Header(default=None),
) -> UserSession | None:
    """Extract user from Bearer token, returns None if missing/invalid."""
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


async def get_current_user(
    authorization: str | None = Header(default=None),
) -> UserSession:
    """Extract user from Bearer token, raises HTTP 401 if missing/invalid."""
    user = await get_optional_user(authorization)
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated. Provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
