"""Gmail API service — Phase 3.

Responsibilities
----------------
- Load the stored (encrypted) OAuth tokens for a user from the DB.
- Refresh the access token when expired and persist the new one.
- Expose a thin wrapper around the Gmail REST API (threads.get).
"""

from __future__ import annotations

import logging
from datetime import UTC

from fastapi import HTTPException
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import get_settings
from app.models.oauth_token import OAuthToken
from app.security import decrypt_token, encrypt_token

logger = logging.getLogger(__name__)


async def get_credentials_for_user(user_id: str, db: AsyncSession) -> Credentials:
    """Load, (optionally refresh), and return Google OAuth credentials.

    Raises
    ------
    HTTPException(401)  — user has no stored token (not connected to Gmail).
    HTTPException(401)  — stored token cannot be refreshed.
    """
    settings = get_settings()

    result = await db.execute(select(OAuthToken).where(OAuthToken.user_id == user_id))
    token_row: OAuthToken | None = result.scalars().first()

    if not token_row:
        raise HTTPException(
            status_code=401,
            detail="Gmail not connected. Please complete the OAuth flow first.",
        )

    refresh_token: str | None = None
    if token_row.refresh_token:
        try:
            refresh_token = decrypt_token(token_row.refresh_token)
        except Exception:
            logger.warning("Could not decrypt refresh token for user %s", user_id)

    credentials = Credentials(
        token=token_row.access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        scopes=settings.gmail_scope_list,
        expiry=token_row.expires_at.replace(tzinfo=None) if token_row.expires_at else None,
    )
    if credentials.expired or not credentials.valid:
        if not refresh_token:
            raise HTTPException(
                status_code=401,
                detail="Access token expired and no refresh token available. Re-authenticate.",
            )
        try:
            credentials.refresh(GoogleRequest())
        except Exception as exc:
            logger.error("Token refresh failed for user %s: %s", user_id, exc)
            raise HTTPException(
                status_code=401,
                detail="Failed to refresh Gmail access token. Re-authenticate.",
            ) from exc
        token_row.access_token = credentials.token
        if credentials.expiry:
            token_row.expires_at = credentials.expiry.replace(tzinfo=UTC)
        if credentials.refresh_token:
            token_row.refresh_token = encrypt_token(credentials.refresh_token)
        await db.commit()
        logger.info("Refreshed access token for user %s", user_id)

    return credentials


def build_gmail_service(credentials: Credentials):
    """Build and return a Gmail API service resource."""
    return build("gmail", "v1", credentials=credentials, cache_discovery=False)


def fetch_raw_thread(service, thread_id: str) -> dict:
    """Fetch a full Gmail thread.

    Parameters
    ----------
    service:
        Gmail API resource built by :func:`build_gmail_service`.
    thread_id:
        Gmail thread ID (as provided by the extension via the URL/DOM).

    Returns
    -------
    dict
        Raw Gmail API ``Thread`` resource with ``format=full`` MIME payloads.

    Raises
    ------
    HTTPException(404)  — thread not found or not accessible.
    HTTPException(502)  — unexpected Gmail API error.
    """
    try:
        return service.users().threads().get(userId="me", id=thread_id, format="full").execute()
    except HttpError as exc:
        if exc.resp.status == 404:
            raise HTTPException(
                status_code=404,
                detail=f"Thread '{thread_id}' not found.",
            ) from exc
        logger.error("Gmail API error fetching thread %s: %s", thread_id, exc)
        raise HTTPException(
            status_code=502,
            detail="Gmail API returned an unexpected error.",
        ) from exc
