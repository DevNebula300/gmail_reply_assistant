"""User preferences — Phase 5: persist style profiles."""

from fastapi import APIRouter

from app.schemas import Length, StyleProfile, Tone

router = APIRouter(prefix="/preferences", tags=["preferences"])

_DEFAULT_PROFILE = StyleProfile(
    default_tone=Tone.PROFESSIONAL,
    default_length=Length.MEDIUM,
    greeting="Hi",
    sign_off="Best regards",
    formality=3,
    directness=3,
    phrases_to_avoid=[],
)


@router.get("/style", response_model=StyleProfile)
async def get_style_profile() -> StyleProfile:
    # TODO(phase-5): Load from database per authenticated user
    return _DEFAULT_PROFILE


@router.put("/style", response_model=StyleProfile)
async def update_style_profile(profile: StyleProfile) -> StyleProfile:
    # TODO(phase-5): Persist to database
    return profile
