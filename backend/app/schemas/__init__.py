"""Pydantic schemas aligned with contracts/openapi.yaml."""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, EmailStr, Field


class Tone(StrEnum):
    PROFESSIONAL = "professional"
    FRIENDLY = "friendly"
    CONCISE = "concise"
    FORMAL = "formal"
    CASUAL = "casual"


class Length(StrEnum):
    SHORT = "short"
    MEDIUM = "medium"
    DETAILED = "detailed"


class RewriteMode(StrEnum):
    PROFESSIONALIZE = "professionalize"
    SHORTEN = "shorten"
    EXPAND = "expand"
    SIMPLIFY = "simplify"
    TRANSLATE = "translate"
    CORRECT_GRAMMAR = "correct_grammar"


class SafetyWarningCode(StrEnum):
    DATE = "date"
    PAYMENT = "payment"
    ATTACHMENT = "attachment"
    APPROVAL = "approval"
    LEGAL_CLAIM = "legal_claim"
    COMPLETED_ACTION = "completed_action"


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str


class AuthStartResponse(BaseModel):
    authorization_url: str


class UserSession(BaseModel):
    user_id: str
    email: EmailStr
    gmail_connected: bool
    display_name: str | None = None


class ThreadMessage(BaseModel):
    id: str
    from_: str = Field(alias="from")
    to: list[str] = Field(default_factory=list)
    date: datetime
    body: str

    model_config = {"populate_by_name": True}


class ThreadContext(BaseModel):
    thread_id: str
    subject: str
    participants: list[str]
    messages: list[ThreadMessage]
    fingerprint: str | None = None


class SafetyWarning(BaseModel):
    code: SafetyWarningCode
    message: str


class ReplySuggestion(BaseModel):
    id: str
    text: str
    warnings: list[SafetyWarning] = Field(default_factory=list)


class GenerateRepliesRequest(BaseModel):
    thread_id: str
    tone: Tone
    length: Length
    language: str = "en"
    instruction: str | None = None
    thread_fingerprint: str | None = None


class GenerateRepliesResponse(BaseModel):
    request_id: str
    suggestions: list[ReplySuggestion]
    thread_fingerprint: str | None = None


class RewriteDraftRequest(BaseModel):
    text: str
    mode: RewriteMode
    language: str = "en"


class RewriteDraftResponse(BaseModel):
    text: str
    warnings: list[SafetyWarning] = Field(default_factory=list)


class UpsertDraftRequest(BaseModel):
    thread_id: str
    body: str
    draft_id: str | None = None
    thread_fingerprint: str | None = None


class UpsertDraftResponse(BaseModel):
    draft_id: str
    thread_id: str


class StyleProfile(BaseModel):
    default_tone: Tone | None = None
    default_length: Length | None = None
    greeting: str | None = None
    sign_off: str | None = None
    formality: int | None = Field(default=None, ge=1, le=5)
    directness: int | None = Field(default=None, ge=1, le=5)
    phrases_to_avoid: list[str] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    error: str
    message: str
    request_id: str | None = None
