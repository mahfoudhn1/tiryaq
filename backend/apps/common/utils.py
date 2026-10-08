"""Small helpers shared by the API apps."""

from datetime import timedelta
import uuid

from django.utils import timezone

SEED_NAMESPACE = uuid.UUID("6f9619ff-8b86-d011-b42d-00c04fc964ff")


def deterministic_uuid(key: str) -> uuid.UUID:
    """Stable UUID for a seed key, so re-running the seeder keeps ids constant."""

    return uuid.uuid5(SEED_NAMESPACE, f"tiryaq:{key}")


def humanize_delta(moment) -> str:
    """'20 mins ago' / '2 hours ago' / 'Yesterday' — matches the UI's wording."""

    if moment is None:
        return ""
    now = timezone.now()
    delta: timedelta = now - moment
    seconds = int(delta.total_seconds())

    if seconds < 0:
        return "Just now"
    if seconds < 60:
        return "Just now"
    if seconds < 3600:
        minutes = seconds // 60
        return f"{minutes} min{'s' if minutes != 1 else ''} ago"
    if seconds < 86_400:
        hours = seconds // 3600
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    days = delta.days
    if days == 1:
        return "Yesterday"
    if days < 30:
        return f"{days} days ago"
    months = days // 30
    return f"{months} month{'s' if months != 1 else ''} ago"


def parse_duration_to_minutes(duration: str) -> int:
    """'18h 30m' / '90m' / '1h' -> minutes. Returns 0 when unparseable."""

    if not duration:
        return 0
    minutes = 0
    number = ""
    for char in duration.lower():
        if char.isdigit():
            number += char
        elif char in {"h", "m"} and number:
            minutes += int(number) * (60 if char == "h" else 1)
            number = ""
        elif char == " ":
            continue
        else:
            number = ""
    if number:
        minutes += int(number)
    return minutes
