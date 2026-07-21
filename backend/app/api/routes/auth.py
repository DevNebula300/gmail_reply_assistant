"""Auth routes — Phase 2: implement real Google OAuth."""

from fastapi import APIRouter, Depends

from app.dependencies import get_optional_user
from app.schemas import AuthStartResponse, UserSession

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/google/start", response_model=AuthStartResponse)
async def start_google_auth() -> AuthStartResponse:
    # TODO(phase-2): Build real Google OAuth authorization URL
    return AuthStartResponse(
        authorization_url="https://accounts.google.com/o/oauth2/v2/auth?stub=true"
    )


@router.get("/me", response_model=UserSession)
async def get_current_user(
    user: UserSession | None = Depends(get_optional_user),
) -> UserSession:
    if user:
        return user

    # Phase 0 mock session for local development
    return UserSession(
        user_id="user_dev_001",
        email="dev@example.com",
        gmail_connected=False,
        display_name="Dev User",
    )


@router.post("/logout", status_code=204)
async def logout() -> None:
    # TODO(phase-2): Revoke refresh token and clear session
    return None
