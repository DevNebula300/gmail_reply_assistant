"""Reply generation routes — Phase 4: AI orchestration."""

import uuid

from fastapi import APIRouter

from app.schemas import GenerateRepliesRequest, RewriteDraftRequest
from app.services.mock_data import get_mock_generate_response, get_mock_rewrite_response

router = APIRouter(prefix="/replies", tags=["replies"])


@router.post("/generate")
async def generate_replies(payload: GenerateRepliesRequest):
    # TODO(phase-4): Build prompts, call AI provider, validate structured output
    response = get_mock_generate_response()
    response["request_id"] = f"req_{uuid.uuid4().hex[:12]}"
    if payload.thread_fingerprint:
        response["thread_fingerprint"] = payload.thread_fingerprint
    return response


@router.post("/rewrite")
async def rewrite_draft(payload: RewriteDraftRequest):
    # TODO(phase-4): Implement rewrite modes via AI orchestration service
    return get_mock_rewrite_response(payload.text, payload.mode.value)
