"""
Spotify OAuth scaffold (Authorization Code flow, server-side exchange).

Setup (env vars, see .env.example):
    SPOTIFY_CLIENT_ID      - from a Spotify developer app
    SPOTIFY_CLIENT_SECRET  - same app
    SPOTIFY_REDIRECT_URI   - optional; defaults to <request origin>/api/spotify/callback/
                             (the app's dashboard must whitelist exactly this URI)

Flow: browser hits api/spotify/login/ -> Spotify consent screen ->
api/spotify/callback/ exchanges ?code for tokens -> tokens stored server-side.

Endpoints:
    GET     api/spotify/login/      redirect to Spotify consent (401 anon, 503 unconfigured)
    GET     api/spotify/callback/   token exchange + storage
    GET     api/spotify/status/     {"connected": bool}
    DELETE  api/spotify/disconnect/ drop stored tokens

Playback API calls are intentionally out of scope for this scaffold.
"""

import json
import secrets
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.http import HttpResponseRedirect, JsonResponse
from django.views import View

from core.controllers.SyncController import _require_auth
from core.models import Setting

TOKENS_KEY = 'spotify_tokens'
STATE_SESSION_KEY = 'spotify_oauth_state'

SCOPES = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
]

AUTHORIZE_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'


def spotify_configured():
    return bool(
        getattr(settings, 'SPOTIFY_CLIENT_ID', None)
        and getattr(settings, 'SPOTIFY_CLIENT_SECRET', None)
    )


def redirect_uri(request):
    configured = getattr(settings, 'SPOTIFY_REDIRECT_URI', None)
    if configured:
        return configured
    return request.build_absolute_uri('/api/spotify/callback/')


class SpotifyLoginView(View):
    http_method_names = ['get']

    def get(self, request):
        unauthorized = _require_auth(request)
        if unauthorized:
            return unauthorized

        if not spotify_configured():
            return JsonResponse({
                'message': 'Spotify is not configured. Set SPOTIFY_CLIENT_ID and '
                           'SPOTIFY_CLIENT_SECRET in the backend environment.',
            }, status=503)

        state = secrets.token_urlsafe(32)
        request.session[STATE_SESSION_KEY] = state

        params = urlencode({
            'client_id': settings.SPOTIFY_CLIENT_ID,
            'response_type': 'code',
            'redirect_uri': redirect_uri(request),
            'state': state,
            'scope': ' '.join(SCOPES),
        })
        # 302: the whole browser tab goes to the consent screen
        return HttpResponseRedirect(f'{AUTHORIZE_URL}?{params}')


class SpotifyCallbackView(View):
    http_method_names = ['get']

    def get(self, request):
        error = request.GET.get('error')
        if error:
            return JsonResponse({'message': f'Spotify authorization failed: {error}'}, status=400)

        code = request.GET.get('code')
        state = request.GET.get('state')
        expected_state = request.session.pop(STATE_SESSION_KEY, None)

        if not expected_state or not state or not secrets.compare_digest(state, expected_state):
            return JsonResponse({'message': 'OAuth state mismatch'}, status=400)
        if not code:
            return JsonResponse({'message': 'Missing authorization code'}, status=400)
        if not spotify_configured():
            return JsonResponse({'message': 'Spotify is not configured on the server'}, status=503)
        if not request.user.is_authenticated:
            return JsonResponse({'message': 'Authentication required'}, status=401)

        tokens = self._exchange_code(code, request)
        if tokens is None:
            return JsonResponse({'message': 'Token exchange with Spotify failed'}, status=502)

        Setting.objects.update_or_create(
            user=request.user,
            key=TOKENS_KEY,
            defaults={'value': json.dumps(tokens)},
        )
        # Back to the SPA; it can re-check api/spotify/status/
        return JsonResponse({'detail': 'Spotify connected'})

    def _exchange_code(self, code, request):
        body = urlencode({
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri(request),
            'client_id': settings.SPOTIFY_CLIENT_ID,
            'client_secret': settings.SPOTIFY_CLIENT_SECRET,
        }).encode()

        req = Request(TOKEN_URL, data=body, headers={
            'Content-Type': 'application/x-www-form-urlencoded',
        })
        try:
            with urlopen(req, timeout=15) as resp:
                payload = json.load(resp)
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
            return None

        access_token = payload.get('access_token')
        refresh_token = payload.get('refresh_token')
        if not access_token:
            return None

        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_at': time.time() + int(payload.get('expires_in', 3600)),
            'scope': payload.get('scope', ''),
        }


class SpotifyStatusView(View):
    http_method_names = ['get']

    def get(self, request):
        unauthorized = _require_auth(request)
        if unauthorized:
            return unauthorized

        connected = Setting.objects.filter(
            user=request.user, key=TOKENS_KEY, deleted_at__isnull=True,
        ).exists()
        return JsonResponse({'connected': connected})


class SpotifyDisconnectView(View):
    http_method_names = ['delete']

    def delete(self, request):
        unauthorized = _require_auth(request)
        if unauthorized:
            return unauthorized

        deleted, _ = Setting.objects.filter(user=request.user, key=TOKENS_KEY).delete()
        return JsonResponse({'connected': False, 'removed': deleted})
