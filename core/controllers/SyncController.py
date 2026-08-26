import json

import django.utils.timezone
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.views import View
from pydantic import ValidationError as PydanticValidationError

from core.controllers.common import parse_validated, validate_data
from core.models import FocusSession, Note, Setting, Task
from core.schemas import (
    NoteCollectionSchema,
    NoteItemSchema,
    SessionItemSchema,
    SessionsPushSchema,
    SettingsPutSchema,
    TaskCollectionSchema,
    TaskItemSchema,
)


def _require_auth(request):
    """Return a 401 response when the request is not authenticated."""
    if not request.user.is_authenticated:
        return JsonResponse({'message': 'Authentication required'}, status=401)
    return None


def _parse_body(request):
    try:
        return json.loads(request.body or '{}')
    except (json.JSONDecodeError, TypeError):
        return None


def _ensure_aware(value):
    if value is not None and django.utils.timezone.is_naive(value):
        return django.utils.timezone.make_aware(value)
    return value


class SessionController(View):
    """Authenticated focus-session log: list and bulk-append."""

    http_method_names = ['get', 'post']

    def get(self, request):
        unauthorized = _require_auth(request)
        if unauthorized:
            return unauthorized

        sessions = FocusSession.objects.filter(user=request.user)[:5000]
        return JsonResponse({'sessions': [
            {
                'id': s.id,
                'minutes': s.minutes,
                'timestamp': s.completed_at.isoformat(),
            }
            for s in sessions
        ]})

    def post(self, request):
        unauthorized = _require_auth(request)
        if unauthorized:
            return unauthorized

        raw = _parse_body(request)
        if not isinstance(raw, dict):
            return JsonResponse({'message': 'Invalid JSON'}, status=400)

        # Convenience: allow posting a bare single session object
        if 'sessions' not in raw and 'minutes' in raw:
            raw = {'sessions': [raw]}

        data, error = validate_data(raw, SessionsPushSchema)
        if error:
            return error

        created, skipped = 0, 0
        for item in data.sessions:
            # Junk items are skipped, not fatal: an offline queue flush may
            # contain garbage from old app versions.
            try:
                session = SessionItemSchema.model_validate(item)
            except (PydanticValidationError, ValueError):
                skipped += 1
                continue

            completed_at = _ensure_aware(session.timestamp)

            # Race-safe append: with a client_id, concurrent duplicate pushes
            # resolve to one row instead of crashing; without one, every
            # session is appended (unique constraints ignore NULLs).
            if session.client_id:
                _, was_created = FocusSession.objects.get_or_create(
                    user=request.user,
                    client_id=session.client_id,
                    defaults={
                        'minutes': session.minutes,
                        'completed_at': completed_at,
                    },
                )
            else:
                FocusSession.objects.create(
                    user=request.user,
                    minutes=session.minutes,
                    completed_at=completed_at,
                    client_id=None,
                )
                was_created = True
            if was_created:
                created += 1
            else:
                skipped += 1

        return JsonResponse({'created': created, 'skipped': skipped}, status=201)


class SettingController(View):
    """Key/value settings backup per user (values stored as JSON)."""

    http_method_names = ['get', 'put', 'post']

    def get(self, request):
        unauthorized = _require_auth(request)
        if unauthorized:
            return unauthorized

        settings_map = {}
        for setting in Setting.objects.filter(user=request.user, deleted_at__isnull=True):
            # OAuth tokens live here too but are server-internal state;
            # they are never part of the client settings payload.
            if setting.key.startswith('spotify_'):
                continue
            try:
                settings_map[setting.key] = json.loads(setting.value)
            except (json.JSONDecodeError, TypeError):
                settings_map[setting.key] = setting.value
        return JsonResponse({'settings': settings_map})

    def put(self, request):
        unauthorized = _require_auth(request)
        if unauthorized:
            return unauthorized

        data, error = parse_validated(request, SettingsPutSchema)
        if error:
            return error

        settings_map = data.settings
        for key, value in settings_map.items():
            Setting.objects.update_or_create(
                user=request.user,
                key=str(key)[:255],
                defaults={
                    'value': json.dumps(value),
                    # Reviving a soft-deleted row must make it visible again.
                    'deleted_at': None,
                },
            )
        return JsonResponse({'saved': len(settings_map)})

    def post(self, request):
        return self.put(request)


class CollectionSyncController(View):
    """
    Whole-collection sync for client-owned item lists (tasks, notes).

    The client owns ordering/ids; the server mirrors its current state.
    GET    → list every stored item for the user
    PUT    → bulk-upsert keyed by client_id, then delete rows whose
             client_id is missing from the payload (tombstone-free sync)
    """

    model = None                # set by subclasses
    payload_key = 'items'       # expected body key
    collection_schema = None    # structural schema for the whole payload
    max_items = 500

    def serialize(self, obj):
        return {
            'client_id': obj.client_id,
            'created_at': obj.created_at.isoformat(),
            'updated_at': obj.updated_at.isoformat(),
            'extra': obj.extra or {},
        }

    def get(self, request):
        unauthorized = _require_auth(request)
        if unauthorized:
            return unauthorized

        # Rows without a client_id predate the sync protocol (or were written
        # out-of-band); the client cannot address them, so they are excluded.
        items = [
            self.serialize(o)
            for o in self.model.objects.filter(user=request.user, client_id__isnull=False)[:5000]
        ]
        return JsonResponse({self.payload_key: items})

    def put(self, request):
        unauthorized = _require_auth(request)
        if unauthorized:
            return unauthorized

        raw = _parse_body(request)
        if raw is None:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)

        # Structural validation: the payload key must be present and hold a
        # list. Only an explicit empty list may clear the collection; a
        # malformed body must never wipe stored rows. Individual items are
        # validated leniently in build_row.
        data, error = validate_data(raw, self.collection_schema)
        if error:
            return error
        items = getattr(data, self.payload_key)

        if len(items) > self.max_items:
            return JsonResponse({'message': 'Too many items in one request'}, status=400)

        saved, skipped = 0, 0
        seen_client_ids = set()
        for item in items:
            row = self.build_row(item)
            if row is None:
                skipped += 1
                continue

            client_id, fields, extra = row

            # A duplicate client_id inside one batch (or a concurrent PUT of
            # the same item) must not crash the whole request: last write wins.
            try:
                with transaction.atomic():
                    if client_id in seen_client_ids:
                        raise IntegrityError
                    seen_client_ids.add(client_id)

                    defaults = {'extra': extra or None}
                    defaults.update(fields)
                    self.model.objects.update_or_create(
                        user=request.user, client_id=client_id, defaults=defaults,
                    )
                    saved += 1
            except IntegrityError:
                skipped += 1

        # Anything this user has on the server that the payload no longer
        # mentions was deleted on some device: drop it here too.
        stale = self.model.objects.filter(user=request.user, client_id__isnull=False)
        if seen_client_ids:
            stale = stale.exclude(client_id__in=seen_client_ids)
        deleted = stale.delete()[0]

        return JsonResponse({'saved': saved, 'skipped': skipped, 'deleted': deleted}, status=200)

    def post(self, request):
        return self.put(request)

    def build_row(self, item):
        """
        Validate one incoming item.

        Returns (client_id, column_fields dict, extra dict) or None when the
        item should be skipped. Structurally broken payloads are caught
        before this runs; junk *items* are skipped, mirroring sessions.
        """
        raise NotImplementedError


class TaskController(CollectionSyncController):
    model = Task
    payload_key = 'tasks'
    collection_schema = TaskCollectionSchema

    def serialize(self, obj):
        data = super().serialize(obj)
        data.update({
            'title': obj.title,
            'completed': obj.completed,
            'completed_at': obj.completed_at.isoformat() if obj.completed_at else None,
        })
        return data

    def build_row(self, item):
        try:
            item_data = TaskItemSchema.model_validate(item)
        except (PydanticValidationError, ValueError):
            return None

        title = (item_data.title or item_data.text or '').strip()[:255]
        if not title:
            return None

        completed_at = _ensure_aware(item_data.completed_at) if item_data.completed else None

        return item_data.client_id, {
            'title': title,
            'description': '',
            'completed': item_data.completed,
            'completed_at': completed_at,
            'deleted_at': None,
        }, dict(item_data.model_extra or {})


class NoteController(CollectionSyncController):
    model = Note
    payload_key = 'notes'
    collection_schema = NoteCollectionSchema

    def serialize(self, obj):
        data = super().serialize(obj)
        data['text'] = obj.text
        return data

    def build_row(self, item):
        try:
            item_data = NoteItemSchema.model_validate(item)
        except (PydanticValidationError, ValueError):
            return None

        return item_data.client_id, {
            'text': item_data.text[:10000],
        }, dict(item_data.model_extra or {})
