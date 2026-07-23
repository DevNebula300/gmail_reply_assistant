"""Auth routes — Phase 2: implement real Google OAuth."""

import base64
import hashlib
import os
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import get_settings
from app.db.database import get_db
from app.dependencies import get_optional_user
from app.models.oauth_token import OAuthToken
from app.models.user import User
from app.schemas import AuthStartResponse, UserSession
from app.security import create_access_token, encrypt_token

router = APIRouter(prefix="/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# PKCE helpers — stateless: code_verifier is embedded in the state param
# so it survives server reloads and requires no server-side storage.
# ---------------------------------------------------------------------------

def _generate_pkce_pair() -> tuple[str, str]:
    """Return (code_verifier, code_challenge) using S256 method."""
    code_verifier = base64.urlsafe_b64encode(os.urandom(40)).decode().rstrip("=")
    digest = hashlib.sha256(code_verifier.encode()).digest()
    code_challenge = base64.urlsafe_b64encode(digest).decode().rstrip("=")
    return code_verifier, code_challenge


def _build_state(code_verifier: str) -> str:
    """Embed code_verifier in state: '<random>.<b64(verifier)>'."""
    random_part = base64.urlsafe_b64encode(os.urandom(16)).decode().rstrip("=")
    encoded = base64.urlsafe_b64encode(code_verifier.encode()).decode().rstrip("=")
    return f"{random_part}.{encoded}"


def _extract_verifier(state: str) -> str:
    """Recover code_verifier from a state produced by _build_state."""
    if not state or "." not in state:
        return ""
    try:
        encoded = state.rsplit(".", 1)[1]
        return base64.urlsafe_b64decode(encoded + "==").decode()
    except Exception:
        return ""


def get_google_flow() -> Flow:
    settings = get_settings()
    client_config = {
        "web": {
            "client_id": settings.google_client_id,
            "project_id": "gmail-assistant",
            "auth_uri": "https://accounts.google.com/o/oauth2/v2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": settings.google_client_secret,
            "redirect_uris": [settings.google_redirect_uri],
        }
    }
    scopes = [
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ] + settings.gmail_scope_list

    return Flow.from_client_config(client_config, scopes=scopes)


def _build_auth_url(flow: Flow, settings) -> str:
    """Generate the Google auth URL with PKCE baked into the state."""
    code_verifier, code_challenge = _generate_pkce_pair()
    state = _build_state(code_verifier)
    flow.redirect_uri = settings.google_redirect_uri
    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state,
        code_challenge=code_challenge,
        code_challenge_method="S256",
    )
    return authorization_url


@router.get("/google/start", response_model=AuthStartResponse)
async def start_google_auth() -> AuthStartResponse:
    flow = get_google_flow()
    settings = get_settings()
    return AuthStartResponse(authorization_url=_build_auth_url(flow, settings))


@router.get("/google/login")
async def login_google_auth() -> RedirectResponse:
    flow = get_google_flow()
    settings = get_settings()
    return RedirectResponse(url=_build_auth_url(flow, settings))


@router.get("/google/callback")
async def google_auth_callback(request: Request, db: AsyncSession = Depends(get_db)):
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    flow = get_google_flow()
    settings = get_settings()
    flow.redirect_uri = settings.google_redirect_uri

    # Recover PKCE code_verifier from the state param (encoded at auth-URL build time)
    code_verifier = _extract_verifier(state) if state else ""
    if code_verifier:
        flow.code_verifier = code_verifier

    try:
        flow.fetch_token(code=code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    credentials = flow.credentials
    try:
        id_info = id_token.verify_oauth2_token(
            credentials.id_token, google_requests.Request(), settings.google_client_id
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid ID token")

    google_id = id_info.get("sub")
    email = id_info.get("email")
    name = id_info.get("name")

    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()

    if not user:
        user = User(email=email, name=name, google_id=google_id)
        db.add(user)
        await db.flush()
    result = await db.execute(select(OAuthToken).where(OAuthToken.user_id == user.id))
    oauth_token = result.scalars().first()

    refresh_token = credentials.refresh_token
    encrypted_refresh_token = encrypt_token(refresh_token) if refresh_token else None

    if not oauth_token:
        oauth_token = OAuthToken(
            user_id=user.id,
            access_token=credentials.token,
            refresh_token=encrypted_refresh_token,
            expires_at=credentials.expiry.replace(tzinfo=UTC)
            if credentials.expiry
            else datetime.now(UTC),
        )
        db.add(oauth_token)
    else:
        oauth_token.access_token = credentials.token
        if encrypted_refresh_token:
            oauth_token.refresh_token = encrypted_refresh_token
        if credentials.expiry:
            oauth_token.expires_at = credentials.expiry.replace(tzinfo=UTC)

    await db.commit()
    access_token = create_access_token(
        {"sub": user.id, "email": user.email, "name": user.name, "gmail_connected": True}
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserSession)
async def get_current_user(
    user: UserSession | None = Depends(get_optional_user),
) -> UserSession:
    if user:
        return user
    return UserSession(
        user_id="user_dev_001",
        email="dev@example.com",
        gmail_connected=False,
        display_name="Dev User",
    )


@router.post("/logout", status_code=204)
async def logout(
    user: UserSession | None = Depends(get_optional_user), db: AsyncSession = Depends(get_db)
) -> None:
    # Phase 2 implementation for logout
    # In a real app we might revoke the refresh token and clear from DB
    if user:
        # Revoke the token if needed, or clear the row
        pass
    return None
