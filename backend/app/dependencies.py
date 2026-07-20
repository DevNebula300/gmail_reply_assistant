"""Shared FastAPI dependencies."""

from fastapi import Header

from app.schemas import UserSession


async def get_optional_user(
    authorization: str | None = Header(default=None),
) -> UserSession | None:
    """Extract user from Bearer token. Phase 2 will validate JWT/session."""
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.removeprefix("Bearer ").strip()
    if not token or token == "invalid":
        return None

    # TODO(phase-2): Decode and validate session token
    return UserSession(
        user_id="user_authenticated_001",
        email="user@example.com",
        gmail_connected=True,
        display_name="Authenticated User",
    )
