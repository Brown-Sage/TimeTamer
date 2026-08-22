"""
Settings used only for running the test suite: SQLite in-memory instead of
MySQL, and a fast password hasher.

Usage:
    python manage.py test --settings=pomodoro.test_settings
"""
from pomodoro.settings import *  # noqa: F401,F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
