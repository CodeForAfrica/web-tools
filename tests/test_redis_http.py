import base64
import importlib.util
import unittest
from unittest.mock import Mock

spec = importlib.util.spec_from_file_location('redis_http', 'server/redis_http.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class GatewayTest(unittest.TestCase):
    def client(self):
        client = module.GatewayRedis('https://tenant:example-token@redis.example.org')
        client.http = Mock()
        return client

    def response(self, client, result):
        client.http.post.return_value.status_code = 200
        client.http.post.return_value.json.return_value = {'result': result}

    def test_binary_cache_values_round_trip(self):
        client = self.client()
        value = b'\x80\x04\xff\x00cached'
        encoded = module.GatewayRedis._argument(value)
        self.response(client, base64.b64encode(encoded.encode()).decode())
        self.assertEqual(client.get('cache-key'), value)
        self.assertEqual(client.http.post.call_args.kwargs['json'], ['GET', 'cache-key'])
        self.assertFalse(client.http.post.call_args.kwargs['allow_redirects'])

    def test_session_json_and_ping(self):
        client = self.client()
        self.response(client, base64.b64encode(b'{"user":1}').decode())
        self.assertEqual(client.get('session-key'), b'{"user":1}')
        self.response(client, base64.b64encode(b'PONG').decode())
        self.assertTrue(client.ping())

    def test_lock_script_does_not_require_script_admin_commands(self):
        client = self.client()
        script = 'return redis.call("del", KEYS[1])'
        sha = client.script_load(script)
        client.http.post.assert_not_called()
        self.response(client, 1)
        self.assertEqual(client.evalsha(sha, 1, 'lock-key', b'token'), 1)
        self.assertEqual(client.http.post.call_args.kwargs['json'][0], 'EVAL')

    def test_failure_messages_do_not_include_credentials(self):
        client = self.client()
        client.http.post.return_value.status_code = 403
        with self.assertRaisesRegex(module.redis.ConnectionError, 'HTTP 403'):
            client.ping()
        with self.assertRaises(ValueError):
            module.GatewayRedis('https://redis.example.org')
