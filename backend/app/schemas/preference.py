from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PreferenceBase(BaseModel):
    default_tone: str | None = None
    default_length: str | None = None
    greeting: str | None = None
    sign_off: str | None = None
    formality: int | None = None
    directness: int | None = None


class PreferenceCreate(PreferenceBase):
    pass


class PreferenceResponse(PreferenceBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
