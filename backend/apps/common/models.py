"""Shared abstract models used across the Tiryaq apps."""

import uuid

from django.db import models


class UUIDModel(models.Model):
    """Primary keys are UUIDs so ids stay stable and unguessable in the API."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


HONORIFICS = {"dr", "prof", "professor", "mr", "mrs", "ms", "miss"}


def initials_for(name: str) -> str:
    """'Dr. Amine Haddad' -> 'AH' (used for the avatar chips in the UI)."""

    parts = [
        part
        for part in name.replace(".", " ").split()
        if part and part.lower() not in HONORIFICS
    ]
    if not parts:
        return "?"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()
