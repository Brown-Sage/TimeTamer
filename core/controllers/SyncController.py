import json

import django.utils.timezone
from django.http import JsonResponse
from django.utils.dateparse import parse_datetime
from django.views import View

from core.models import FocusSession, Setting


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

        payload = _parse_body(request)
        if payload is None:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)

        items = payload.get('sessions')
        if items is None:
            # Convenience: allow posting a bare single session object
            if 'minutes' in payload:
                items = [payload]
            else:
                return JsonResponse({'message': 'Expected {"sessions": [...]} or a session object'}, status=400)
        elif not isinstance(items, list):
            return JsonResponse({'message': '"sessions" must be a list'}, status=400)

        if len(items) > 500:
            return JsonResponse({'message': 'Too many sessions in one request'}, status=400)

        created, skipped = 0, 0
        for item in items:
            if not isinstance(item, dict):
                skipped += 1
                continue

            minutes = item.get('minutes')
            client_id = str(item.get('client_id') or '')[:64] or None
            completed_at = parse_datetime(str(item.get('timestamp') or ''))

            if not isinstance(minutes, int) or isinstance(minutes, bool) or minutes <= 0 or completed_at is None:
                skipped += 1
                continue

            if django.utils.timezone.is_naive(completed_at):
                completed_at = django.utils.timezone.make_aware(completed_at)

            if client_id and FocusSession.objects.filter(
                    user=request.user, client_id=client_id).exists():
                skipped += 1
                continue

            FocusSession.objects.create(
                user=request.user,
                minutes=minutes,
                completed_at=completed_at,
                client_id=client_id,
            )
            created += 1

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
            try:
                settings_map[setting.key] = json.loads(setting.value)
            except (json.JSONDecodeError, TypeError):
                settings_map[setting.key] = setting.value
        return JsonResponse({'settings': settings_map})

    def put(self, request):
        unauthorized = _require_auth(request)
        if unauthorized:
            return unauthorized

        payload = _parse_body(request)
        if not isinstance(payload, dict) or not isinstance(payload.get('settings'), dict):
            return JsonResponse({'message': 'Expected {"settings": {...}}'}, status=400)

        settings_map = payload['settings']
        for key, value in settings_map.items():
            Setting.objects.update_or_create(
                user=request.user,
                key=str(key)[:255],
                defaults={'value': json.dumps(value)},
            )
        return JsonResponse({'saved': len(settings_map)})

    def post(self, request):
        return self.put(request)
