"""Mock fixtures for phase-0 parallel development."""

import json
from datetime import datetime
from pathlib import Path

FIXTURES_DIR = Path(__file__).resolve().parents[3] / "contracts" / "fixtures"


def _load_fixture(name: str) -> dict:
    path = FIXTURES_DIR / name
    if path.exists():
        return json.loads(path.read_text())
    return {}


def get_mock_thread_context(thread_id: str) -> dict:
    data = _load_fixture("thread_context.json")
    data["thread_id"] = thread_id
    return data


def get_mock_generate_response() -> dict:
    return _load_fixture("generate_replies_response.json")


def get_mock_rewrite_response(text: str, mode: str) -> dict:
    prefix = {
        "professionalize": "Professional version:\n\n",
        "shorten": "Short version:\n\n",
        "expand": "Expanded version:\n\n",
        "simplify": "Simplified version:\n\n",
        "translate": "Translated version:\n\n",
        "correct_grammar": "Corrected version:\n\n",
    }.get(mode, "")
    return {"text": f"{prefix}{text}", "warnings": []}


def get_fallback_thread_context(thread_id: str) -> dict:
    """Inline fallback when fixture file is unavailable."""
    return {
        "thread_id": thread_id,
        "subject": "Mock thread",
        "participants": ["sender@example.com"],
        "messages": [
            {
                "id": "msg_fallback",
                "from": "sender@example.com",
                "to": ["you@example.com"],
                "date": datetime.utcnow().isoformat() + "Z",
                "body": "This is mock thread content for development.",
            }
        ],
        "fingerprint": "fp_fallback",
    }
