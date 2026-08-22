from django.test import Client, TestCase


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


class AuthenticatedApiTests(TestCase):
    """Base: a registered + logged-in client."""

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
        import json as _json
        return self.client.post(
            path, data=_json.dumps(payload), content_type='application/json'
        )

    def json_put(self, path, payload):
        import json as _json
        return self.client.put(
            path, data=_json.dumps(payload), content_type='application/json'
        )

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
