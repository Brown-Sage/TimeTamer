"""
Pydantic request schemas: every API payload is declared and validated here.

Two strictness levels, mirroring the sync protocol:
- Auth/settings payloads are validated strictly (bad shape -> 400 with
  field-level errors).
- Bulk-sync collections validate their structure (the payload key must hold
  a list) but each *item* is validated leniently by the controllers: junk
  items are skipped, not fatal.
"""

from datetime import datetime
from typing import Any, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    StrictInt,
    field_validator,
)

# Matches the client's session lengths; a "session" longer than a day is junk.
MAX_SESSION_MINUTES = 24 * 60


class _Stripped(BaseModel):
    @field_validator('*', mode='before')
    @classmethod
    def _strip_strings(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class RegisterSchema(_Stripped):
    email: EmailStr = Field(max_length=254)
    username: str = Field(min_length=1, max_length=150)
    password: str = Field(min_length=1)


class LoginSchema(_Stripped):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class SessionItemSchema(_Stripped):
    # Strict int: JSON junk like "25" (string) must be skipped, not coerced.
    minutes: StrictInt = Field(gt=0, le=MAX_SESSION_MINUTES)
    timestamp: datetime
    client_id: Optional[str] = Field(default=None, max_length=64)


class SessionsPushSchema(BaseModel):
    """Structure only; individual items go through SessionItemSchema."""

    sessions: list[Any] = Field(max_length=500)


class SettingsPutSchema(BaseModel):
    settings: dict[str, Any]


class TaskItemSchema(BaseModel):
    """
    One synced task. Unknown client-side fields (priority, duration, ...)
    are preserved via model_extra and land in the `extra` JSON column.
    """

    model_config = ConfigDict(extra='allow', str_strip_whitespace=True)

    client_id: str = Field(min_length=1, max_length=64)
    title: Optional[str] = None       # canonical name; `text` is the legacy alias
    text: Optional[str] = None
    completed: bool = False
    completed_at: Optional[datetime] = None


class TaskCollectionSchema(BaseModel):
    tasks: list[Any]


class NoteItemSchema(BaseModel):
    model_config = ConfigDict(extra='allow', str_strip_whitespace=True)

    client_id: str = Field(min_length=1, max_length=64)
    text: str = Field(min_length=1)


class NoteCollectionSchema(BaseModel):
    notes: list[Any]
