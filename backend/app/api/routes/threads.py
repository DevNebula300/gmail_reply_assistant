"""Thread routes — Phase 3: Gmail API + context cleaning."""

from fastapi import APIRouter

from app.services.mock_data import get_mock_thread_context

router = APIRouter(prefix="/threads", tags=["threads"])


@router.get("/{thread_id}")
async def get_thread_context(thread_id: str):
    # TODO(phase-3): Fetch from Gmail API and run context-processing pipeline
    return get_mock_thread_context(thread_id)
