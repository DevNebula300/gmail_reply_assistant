import html
import re

from app.schemas import ThreadMessage


def clean_html(text: str) -> str:
    """Strip HTML tags and unescape entities, consolidating whitespace."""
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)

    return text.strip()


def remove_quoted_history(text: str) -> str:
    """Remove quoted email history (e.g., lines starting with > and 'On ... wrote:')."""
    if not text:
        return ""
    lines = text.split("\n")
    cleaned_lines = []
    for line in lines:
        if not re.match(r"^\s*>", line):
            cleaned_lines.append(line)

    text = "\n".join(cleaned_lines)
    pattern = r"(?i)\n*On\s+.*?(?:wrote|sent):\s*\n"
    match = re.search(pattern, text)
    if match:
        text = text[: match.start()]
    pattern_orig = r"(?i)-+Original Message-+"
    match_orig = re.search(pattern_orig, text)
    if match_orig:
        text = text[: match_orig.start()]
    return text.strip()


def remove_signatures(text: str) -> str:
    """Remove common email signatures."""
    if not text:
        return ""
    delimiters = [
        r"\n-- \n",
        r"\n--\n",
        r"\n___\n",
    ]
    for delimiter in delimiters:
        match = re.search(delimiter, text)
        if match:
            text = text[: match.start()]
            break
    return text.strip()


def clean_message_body(text: str, is_html: bool = False) -> str:
    """Orchestrate the cleaning steps on a single message string."""
    if not text:
        return ""
    if is_html:
        text = clean_html(text)
    text = remove_quoted_history(text)
    text = remove_signatures(text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def truncate_context(messages: list[ThreadMessage], max_messages: int = 5) -> list[ThreadMessage]:
    """Retain only the most relevant recent messages."""
    if not messages:
        return []
    return messages[-max_messages:]
