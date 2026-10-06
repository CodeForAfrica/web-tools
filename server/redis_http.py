"""Redis session/cache access through CFA's token-authenticated HTTPS gateway."""
import base64
import hashlib
from urllib.parse import unquote, urlsplit, urlunsplit

import redis
from redis.exceptions import NoScriptError
import requests
from dogpile.cache.backends.redis import RedisBackend

_BINARY_PREFIX = '__cfa_binary_v1__:'


def redis_from_url(url, **kwargs):
    if urlsplit(url).scheme == 'https':
        return GatewayRedis(url)
    return redis.StrictRedis.from_url(url, **kwargs)


class GatewayRedis(redis.Redis):
    def __init__(self, url):
        super().__init__()
        parsed = urlsplit(url)
        if parsed.scheme != 'https' or not parsed.password or parsed.query or parsed.fragment or parsed.path not in ('', '/'):
            raise ValueError('Redis HTTPS URL requires a token password and a root endpoint')
        self.endpoint = urlunsplit(('https', parsed.netloc.rsplit('@', 1)[-1], '', '', ''))
        self.scripts = {}
        self.http = requests.Session()
        self.http.headers.update({'Authorization': 'Bearer ' + unquote(parsed.password), 'Upstash-Encoding': 'base64'})

    @staticmethod
    def _argument(value):
        if isinstance(value, bytes):
            return _BINARY_PREFIX + base64.b64encode(value).decode('ascii')
        return str(value)

    @classmethod
    def _result(cls, value):
        if isinstance(value, list):
            return [cls._result(item) for item in value]
        if isinstance(value, str):
            raw = base64.b64decode(value)
            if raw.startswith(_BINARY_PREFIX.encode('ascii')):
                return base64.b64decode(raw[len(_BINARY_PREFIX):])
            return raw
        return value

    def execute_command(self, *args, **options):
        command = str(args[0]).upper()
        body = command.split() + [self._argument(value) for value in args[1:]]
        try:
            response = self.http.post(self.endpoint, json=body, timeout=(5, 10), allow_redirects=False)
            if response.status_code not in (200, 400):
                raise redis.ConnectionError('Redis HTTPS gateway returned HTTP {}'.format(response.status_code))
            payload = response.json()
        except requests.RequestException:
            raise redis.ConnectionError('Redis HTTPS gateway request failed') from None
        if 'error' in payload:
            error = payload['error']
            if error.startswith('NOSCRIPT'):
                raise NoScriptError(error)
            raise redis.ResponseError('Redis gateway rejected command ' + command)
        result = self._result(payload['result'])
        callback = self.response_callbacks.get(command)
        return callback(result, **options) if callback else result

    def script_load(self, script):
        raw = script.encode('utf-8') if isinstance(script, str) else script
        # Redis identifies Lua scripts by SHA-1; this is not a credential hash.
        digest = hashlib.sha1(raw).hexdigest()
        self.scripts[digest] = raw.decode('utf-8')
        return digest

    def evalsha(self, sha, numkeys, *keys_and_args):
        if sha in self.scripts:
            return self.execute_command('EVAL', self.scripts[sha], numkeys, *keys_and_args)
        return self.execute_command('EVALSHA', sha, numkeys, *keys_and_args)

    def pipeline(self, transaction=True, shard_hint=None):
        return GatewayPipeline(self)


class GatewayPipeline:
    """Cache batch commands; this is deliberately not a Redis transaction."""
    def __init__(self, client):
        self.client = client
        self.commands = []

    def __getattr__(self, name):
        def queue(*args, **kwargs):
            self.commands.append((name, args, kwargs))
            return self
        return queue

    def execute(self):
        commands, self.commands = self.commands, []
        return [getattr(self.client, name)(*args, **kwargs) for name, args, kwargs in commands]


class GatewayRedisBackend(RedisBackend):
    def _create_client(self):
        return redis_from_url(self.url)
