from django.test import Client, TestCase, override_settings

import json as _json


class AuthFlowTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.credentials = {
            'email': 'tester@example.com',
            'username': 'tester',
            'password': 'sup3r-secret-pass',
        }

    def register(self, client=None, **overrides):
        payload = {**self.credentials, **overrides}
        return (client or self.client).post('/api/register/', payload)

    def login(self, client=None, **overrides):
        payload = {
            'username': self.credentials['username'],
            'password': self.credentials['password'],
            **overrides,
        }
        return (client or self.client).post('/api/login/', payload)

    def test_register_login_get_user_logout(self):
        resp = self.register()
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['user']['username'], 'tester')

        resp = self.login()
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['user']['username'], 'tester')
        self.assertTrue(resp.json()['user']['uid'])

        resp = self.client.get('/api/user/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['username'], 'tester')

        resp = self.client.delete('/api/logout/')
        self.assertEqual(resp.status_code, 200)

        resp = self.client.get('/api/user/')
        self.assertEqual(resp.status_code, 401)

    def test_register_missing_fields(self):
        resp = self.register(username='')
        self.assertEqual(resp.status_code, 400)

    def test_register_duplicate_username(self):
        self.register()
        resp = self.register(email='other@example.com')
        self.assertEqual(resp.status_code, 400)

    def test_login_invalid_credentials(self):
        self.register()
        resp = self.login(password='wrong-password')
        self.assertEqual(resp.status_code, 400)

    def test_user_endpoint_requires_authentication(self):
        resp = self.client.get('/api/user/')
        self.assertEqual(resp.status_code, 401)

    def test_unsafe_requests_require_csrf_token(self):
        enforcing = Client(enforce_csrf_checks=True)

        # No token -> rejected by CSRF middleware before the view runs
        resp = enforcing.post(
            '/api/login/', {'username': 'x', 'password': 'y'}
        )
        self.assertEqual(resp.status_code, 403)

        # Fetch a valid token, then the request passes CSRF validation
        csrf_resp = enforcing.get('/api/csrf/')
        self.assertEqual(csrf_resp.status_code, 200)
        token = enforcing.cookies['csrftoken'].value

        resp = enforcing.post(
            '/api/login/',
            {'username': 'x', 'password': 'y'},
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(resp.status_code, 400)

        resp = enforcing.delete('/api/logout/', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(resp.status_code, 200)


class LoggedInMixin:
    """Shared fixture: a registered + logged-in client."""

    def setUp(self):
        self.client = Client()
        resp = self.client.post('/api/register/', {
            'email': 'sync@example.com',
            'username': 'syncer',
            'password': 'sup3r-secret-pass',
        })
        self.assertEqual(resp.status_code, 201)
        resp = self.client.post('/api/login/', {
            'username': 'syncer',
            'password': 'sup3r-secret-pass',
        })
        self.assertEqual(resp.status_code, 200)

    def json_post(self, path, payload):
        return self.client.post(
            path, data=_json.dumps(payload), content_type='application/json'
        )

    def json_put(self, path, payload):
        return self.client.put(
            path, data=_json.dumps(payload), content_type='application/json'
        )


class AuthenticatedApiTests(LoggedInMixin, TestCase):
    """Sessions/settings/tasks/notes endpoint behavior."""

    # ---- sessions ----

    def test_sessions_require_auth(self):
        anon = Client()
        self.assertEqual(anon.get('/api/sessions/').status_code, 401)
        self.assertEqual(self.json_post('/api/sessions/', {'minutes': 50}).status_code if False else Client().post('/api/sessions/', {'minutes': 50}, content_type='application/json').status_code, 401)

    def test_create_and_list_session(self):
        ts = '2026-08-22T10:00:00.000Z'
        resp = self.json_post('/api/sessions/', {
            'sessions': [{'minutes': 50, 'timestamp': ts, 'client_id': 'abc-123'}]
        })
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json(), {'created': 1, 'skipped': 0})

        resp = self.client.get('/api/sessions/')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()['sessions']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['minutes'], 50)
        self.assertIn('2026-08-22T10:00:00', data[0]['timestamp'])

    def test_duplicate_client_id_is_skipped(self):
        body = {'sessions': [
            {'minutes': 50, 'timestamp': '2026-08-22T10:00:00.000Z', 'client_id': 'dup-1'},
        ]}
        self.json_post('/api/sessions/', body)
        # same client pushed again after retry/offline queue flush
        resp = self.json_post('/api/sessions/', body)
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json(), {'created': 0, 'skipped': 1})

        # and no duplicate row exists
        listing = self.client.get('/api/sessions/').json()['sessions']
        self.assertEqual(len(listing), 1)

    def test_invalid_session_payload_rejected(self):
        # Structurally broken payloads -> 400
        for bad in ({}, {'sessions': 'nope'}, {'sessions': 123}):
            resp = self.json_post('/api/sessions/', bad)
            self.assertEqual(resp.status_code, 400, bad)

        # Junk items inside a valid batch are skipped, not fatal -> 201
        resp = self.json_post('/api/sessions/', {'sessions': [
            {'minutes': 0, 'timestamp': '2026-08-22T10:00:00.000Z'},
            {'minutes': 25, 'timestamp': 'not-a-date'},
            'nope',
        ]})
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json(), {'created': 0, 'skipped': 3})

    def test_settings_roundtrip(self):
        payload = {
            'settings': {
                'timerSettings': {'focus': {'minutes': 50, 'seconds': 0}},
                'timerAlarm': True,
                'timerWebcamDetection': False,
            }
        }
        resp = self.json_put('/api/settings/', payload)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['saved'], 3)

        # upsert over an existing key
        resp = self.json_put('/api/settings/', {
            'settings': {'timerAlarm': False}
        })
        self.assertEqual(resp.status_code, 200)

        resp = self.client.get('/api/settings/')
        self.assertEqual(resp.status_code, 200)
        settings = resp.json()['settings']
        self.assertEqual(settings['timerAlarm'], False)
        self.assertEqual(settings['timerWebcamDetection'], False)
        self.assertEqual(settings['timerSettings']['focus']['minutes'], 50)

    def test_settings_require_auth(self):
        anon = Client()
        self.assertEqual(anon.get('/api/settings/').status_code, 401)

    # ---- tasks ----

    def task(self, id_, **overrides):
        base = {
            'client_id': str(id_),
            'text': f'Task {id_}',
            'completed': False,
            'completed_at': None,
            'priority': 'high',
            'duration': 25,
            'createdAt': '2026-08-22T09:00:00.000Z',
        }
        base.update(overrides)
        if base['completed'] and not base['completed_at']:
            base['completed_at'] = '2026-08-22T09:30:00.000Z'
        return base

    def test_tasks_require_auth(self):
        anon = Client()
        self.assertEqual(anon.get('/api/tasks/').status_code, 401)
        self.assertEqual(
            anon.put('/api/tasks/', data='{"tasks": []}', content_type='application/json').status_code,
            401,
        )

    def test_tasks_roundtrip_preserves_extra_fields(self):
        resp = self.json_put('/api/tasks/', {'tasks': [self.task(1, completed=True)]})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json(), {'saved': 1, 'skipped': 0, 'deleted': 0})

        tasks = self.client.get('/api/tasks/').json()['tasks']
        self.assertEqual(len(tasks), 1)
        row = tasks[0]
        self.assertEqual(row['title'], 'Task 1')
        self.assertTrue(row['completed'])
        self.assertIsNotNone(row['completed_at'])
        # client-side fields ride along in `extra`
        self.assertEqual(row['extra']['priority'], 'high')
        self.assertEqual(row['extra']['duration'], 25)

    def test_tasks_upsert_updates_existing_row(self):
        self.json_put('/api/tasks/', {'tasks': [self.task(1)]})
        self.json_put('/api/tasks/', {'tasks': [self.task(1, completed=True)]})

        tasks = self.client.get('/api/tasks/').json()['tasks']
        self.assertEqual(len(tasks), 1)
        self.assertTrue(tasks[0]['completed'])

    def test_tasks_delete_missing_rows(self):
        self.json_put('/api/tasks/', {'tasks': [self.task(1), self.task(2)]})
        # device B deleted task 2 and pushed the remaining state
        resp = self.json_put('/api/tasks/', {'tasks': [self.task(1)]})
        self.assertEqual(resp.json()['deleted'], 1)

        tasks = self.client.get('/api/tasks/').json()['tasks']
        self.assertEqual([t['client_id'] for t in tasks], ['1'])

    def test_tasks_empty_payload_clears_collection(self):
        self.json_put('/api/tasks/', {'tasks': [self.task(1)]})
        resp = self.json_put('/api/tasks/', {'tasks': []})
        self.assertEqual(resp.json()['deleted'], 1)
        self.assertEqual(len(self.client.get('/api/tasks/').json()['tasks']), 0)

    def test_tasks_junk_items_skipped_broken_payload_rejected(self):
        resp = self.json_put('/api/tasks/', {'tasks': [
            {'client_id': '', 'text': 'no id'},
            'not-a-dict',
            {'client_id': '9', 'text': ''},
        ]})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json(), {'saved': 0, 'skipped': 3, 'deleted': 0})

        for bad in ({}, {'tasks': 'nope'}, None):
            body = _json.dumps(bad) if bad is not None else '{broken'
            resp = self.client.put(
                '/api/tasks/', data=body, content_type='application/json'
            )
            self.assertEqual(resp.status_code, 400, bad)

    def test_tasks_are_per_user(self):
        other = Client()
        other.post('/api/register/', {
            'email': 'other@example.com', 'username': 'other', 'password': 'sup3r-secret-pass',
        })
        other.post('/api/login/', {'username': 'other', 'password': 'sup3r-secret-pass'})

        self.json_put('/api/tasks/', {'tasks': [self.task(1)]})
        resp = other.get('/api/tasks/')
        self.assertEqual(resp.json()['tasks'], [])

    # ---- notes ----

    def note(self, id_, **overrides):
        return {'client_id': str(id_), 'text': f'Note {id_}', 'timestamp': '8/22/26, 9:00 AM', **overrides}

    def test_notes_require_auth(self):
        anon = Client()
        self.assertEqual(anon.get('/api/notes/').status_code, 401)
        self.assertEqual(
            anon.put('/api/notes/', data='{"notes": []}', content_type='application/json').status_code,
            401,
        )

    def test_notes_roundtrip_and_delete_missing(self):
        resp = self.json_put('/api/notes/', {'notes': [self.note(1), self.note(2)]})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json(), {'saved': 2, 'skipped': 0, 'deleted': 0})

        notes = self.client.get('/api/notes/').json()['notes']
        self.assertEqual(len(notes), 2)
        self.assertEqual(notes[0]['text'], 'Note 1')
        self.assertEqual(notes[0]['extra']['timestamp'], '8/22/26, 9:00 AM')

        resp = self.json_put('/api/notes/', {'notes': [self.note(2, text='Note 2 edited')]})
        self.assertEqual(resp.json(), {'saved': 1, 'skipped': 0, 'deleted': 1})

        notes = self.client.get('/api/notes/').json()['notes']
        self.assertEqual([n['text'] for n in notes], ['Note 2 edited'])


class SpotifyOAuthTests(LoggedInMixin, TestCase):
    """Offline checks for the OAuth scaffold (no real Spotify calls)."""

    def test_login_requires_auth(self):
        self.assertEqual(Client().get('/api/spotify/login/').status_code, 401)

    def test_status_requires_auth(self):
        self.assertEqual(Client().get('/api/spotify/status/').status_code, 401)

    @override_settings(SPOTIFY_CLIENT_ID=None, SPOTIFY_CLIENT_SECRET=None)
    def test_login_unconfigured_returns_503(self):
        resp = self.client.get('/api/spotify/login/')
        self.assertEqual(resp.status_code, 503)

    @override_settings(SPOTIFY_CLIENT_ID='cid', SPOTIFY_CLIENT_SECRET='secret')
    def test_login_redirects_to_spotify_with_state(self):
        resp = self.client.get('/api/spotify/login/')
        self.assertEqual(resp.status_code, 302)
        location = resp['Location']
        self.assertTrue(location.startswith('https://accounts.spotify.com/authorize?'))
        self.assertIn('client_id=cid', location)
        self.assertIn('user-read-playback-state', location)
        # a state token was stashed for callback verification
        self.assertTrue(self.client.session.get('spotify_oauth_state'))

    @override_settings(SPOTIFY_CLIENT_ID='cid', SPOTIFY_CLIENT_SECRET='secret')
    def test_callback_rejects_state_mismatch(self):
        resp = self.client.get('/api/spotify/callback/', {'code': 'abc', 'state': 'evil'})
        self.assertEqual(resp.status_code, 400)

    @override_settings(SPOTIFY_CLIENT_ID='cid', SPOTIFY_CLIENT_SECRET='secret')
    def test_callback_without_prior_login_rejected(self):
        resp = self.client.get('/api/spotify/callback/', {'code': 'abc', 'state': 'x'})
        self.assertEqual(resp.status_code, 400)

    def test_status_disconnected_by_default(self):
        resp = self.client.get('/api/spotify/status/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['connected'], False)

    def test_disconnect_is_idempotent(self):
        resp = self.client.delete('/api/spotify/disconnect/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['connected'], False)

    def test_disconnect_requires_auth(self):
        self.assertEqual(Client().delete('/api/spotify/disconnect/').status_code, 401)
