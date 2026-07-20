"""Draft routes — Phase 5: Gmail draft create/update."""

import uuid

from fastapi import APIRouter

from app.schemas import UpsertDraftRequest, UpsertDraftResponse

router = APIRouter(prefix="/drafts", tags=["replies"])


@router.post("", response_model=UpsertDraftResponse)
async def upsert_draft(payload: UpsertDraftRequest) -> UpsertDraftResponse:
    # TODO(phase-5): Create or update draft via Gmail API service
    draft_id = payload.draft_id or f"draft_{uuid.uuid4().hex[:12]}"
    return UpsertDraftResponse(draft_id=draft_id, thread_id=payload.thread_id)
