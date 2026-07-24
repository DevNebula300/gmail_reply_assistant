"""Thread routes — Phase 3: Gmail API + context cleaning."""

import base64
import email.utils
import hashlib
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.dependencies import get_current_user
from app.schemas import ThreadContext, ThreadMessage, UserSession
from app.services.context import clean_message_body, truncate_context
from app.services.gmail import build_gmail_service, fetch_raw_thread, get_credentials_for_user

router = APIRouter(prefix="/threads", tags=["threads"])


def _decode_part(payload: dict) -> str:
    """Decode a single MIME part body from base64url to plain text."""
    data = payload.get("body", {}).get("data", "")
    if not data:
        return ""
    return base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace")


def _extract_body(payload: dict) -> str:
    """Walk MIME parts to find text/plain (preferred) or text/html fallback."""
    mime_type = payload.get("mimeType", "")
    if not payload.get("parts"):
        if mime_type == "text/plain":
            text = _decode_part(payload)
            return clean_message_body(text, is_html=False)
        if mime_type == "text/html":
            text = _decode_part(payload)
            return clean_message_body(text, is_html=True)
        return ""
    plain = ""
    html = ""
    for part in payload.get("parts", []):
        body = _extract_body(part)
        if part.get("mimeType") == "text/plain" and not plain:
            plain = body
        elif part.get("mimeType") == "text/html" and not html:
            html = body
    return plain or html


def _header(headers: list[dict], name: str) -> str:
    """Return the value of a named message header (case-insensitive)."""
    name_lower = name.lower()
    for h in headers:
        if h.get("name", "").lower() == name_lower:
            return h.get("value", "")
    return ""


def _parse_address_list(raw: str) -> list[str]:
    """Parse a To/Cc header string into a list of email addresses."""
    if not raw:
        return []
    return [addr for _, addr in email.utils.getaddresses([raw])]


def _compute_fingerprint(thread_id: str, last_message_id: str) -> str:
    """16-char hex fingerprint — changes whenever a new message arrives."""
    payload = f"{thread_id}:{last_message_id}"
    return hashlib.sha256(payload.encode()).hexdigest()[:16]


def _build_thread_context(raw: dict) -> ThreadContext:
    """Convert a raw Gmail API Thread resource into a ThreadContext schema."""
    thread_id = raw.get("id", "")
    messages_raw = raw.get("messages", [])
    if not messages_raw:
        return ThreadContext(
            thread_id=thread_id,
            subject="(no subject)",
            participants=[],
            messages=[],
            fingerprint=_compute_fingerprint(thread_id, ""),
        )
    participants: set[str] = set()
    subject = ""
    parsed_messages: list[ThreadMessage] = []
    for msg in messages_raw:
        headers = msg.get("payload", {}).get("headers", [])
        msg_from = _header(headers, "From")
        msg_to_raw = _header(headers, "To")
        msg_date_raw = _header(headers, "Date")
        msg_subject = _header(headers, "Subject")
        if msg_subject and not subject:
            subject = msg_subject
        if msg_from:
            _, addr = email.utils.parseaddr(msg_from)
            if addr:
                participants.add(addr)
        for addr in _parse_address_list(msg_to_raw):
            if addr:
                participants.add(addr)
        try:
            msg_date = datetime(*email.utils.parsedate(msg_date_raw)[:6])
        except (TypeError, ValueError):
            msg_date = datetime.utcnow()
        body = _extract_body(msg.get("payload", {}))
        parsed_messages.append(
            ThreadMessage(
                **{
                    "id": msg.get("id", ""),
                    "from": msg_from,
                    "to": _parse_address_list(msg_to_raw),
                    "date": msg_date,
                    "body": body,
                }
            )
        )

    last_msg_id = messages_raw[-1].get("id", "") if messages_raw else ""
    parsed_messages = truncate_context(parsed_messages)
    return ThreadContext(
        thread_id=thread_id,
        subject=subject or "(no subject)",
        participants=sorted(participants),
        messages=parsed_messages,
        fingerprint=_compute_fingerprint(thread_id, last_msg_id),
    )


@router.get("", response_model=list[dict])
async def list_threads(
    user: UserSession = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    max_results: int = 10,
):
    credentials = await get_credentials_for_user(user.user_id, db)
    service = build_gmail_service(credentials)
    result = service.users().threads().list(userId="me", maxResults=max_results).execute()
    return [{"id": t["id"], "snippet": t.get("snippet", "")} for t in result.get("threads", [])]


@router.get("/{thread_id}", response_model=ThreadContext)
async def get_thread_context(
    thread_id: str,
    user: UserSession = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ThreadContext:
    """Fetch a Gmail thread and return cleaned context for AI generation."""
    credentials = await get_credentials_for_user(user.user_id, db)
    service = build_gmail_service(credentials)
    raw = fetch_raw_thread(service, thread_id)
    return _build_thread_context(raw)
