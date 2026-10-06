import importlib.util
import unittest
from unittest.mock import Mock
from flask import Flask

spec = importlib.util.spec_from_file_location('session_runtime', 'server/sessions.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class SessionTest(unittest.TestCase):
    def test_configured_cookie_name_and_secure_flags(self):
        app = Flask('session-test')
        app.config.update(SESSION_COOKIE_NAME='civic-test', SESSION_COOKIE_DOMAIN='.example.org', SESSION_COOKIE_SECURE=True, SESSION_COOKIE_SAMESITE='Lax')
        client = Mock()
        interface = module.RedisSessionInterface(client)
        session = interface.session_class({'user_id': 1}, sid='fixture-session')
        response = app.response_class()
        interface.save_session(app, session, response)
        cookie = response.headers['Set-Cookie']
        for expected in ('civic-test=fixture-session', 'Secure', 'HttpOnly', 'SameSite=Lax'):
            self.assertIn(expected, cookie)
        self.assertEqual(client.setex.call_args.args[0], 'session:fixture-session')
