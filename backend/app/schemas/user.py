from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    name: str | None = None
    is_active: bool = True


class UserCreate(UserBase):
    google_id: str | None = None


class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
