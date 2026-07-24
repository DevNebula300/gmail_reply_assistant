import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes.threads import _build_thread_context
from app.db.database import get_db
from app.dependencies import get_current_user
from app.schemas import (
    GenerateRepliesRequest,
    GenerateRepliesResponse,
    RewriteDraftRequest,
    UserSession,
)
from app.services.ai import generate_suggestions
from app.services.gmail import build_gmail_service, fetch_raw_thread, get_credentials_for_user
from app.services.mock_data import get_mock_rewrite_response

router = APIRouter(prefix="/replies", tags=["replies"])


@router.post("/generate", response_model=GenerateRepliesResponse)
async def generate_replies(
    payload: GenerateRepliesRequest,
    user: UserSession = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    credentials = await get_credentials_for_user(user.user_id, db)
    service = build_gmail_service(credentials)
    raw = fetch_raw_thread(service, payload.thread_id)
    thread_ctx = _build_thread_context(raw)

    suggestions = await generate_suggestions(thread_ctx, payload)

    return GenerateRepliesResponse(
        request_id=f"req_{uuid.uuid4().hex[:12]}",
        suggestions=suggestions,
        thread_fingerprint=payload.thread_fingerprint,
    )


@router.post("/rewrite")
async def rewrite_draft(payload: RewriteDraftRequest):
    return get_mock_rewrite_response(payload.text, payload.mode.value)
