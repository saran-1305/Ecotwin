
import re

def clean_text(text: str) -> str:
    """Removes extra whitespace and non-printable characters."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def truncate_text(text: str, max_length: int = 2000) -> str:
    """Truncates text to a maximum length."""
    if not text:
        return ""
    return text[:max_length] + "..." if len(text) > max_length else text
