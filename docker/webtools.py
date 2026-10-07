#!/usr/bin/env python3
"""Run the four existing Flask apps behind one hostname-routing nginx process."""
import json
import os
import re
import signal
import subprocess
import sys
import time
import threading
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import urlopen

APPS = ('explorer', 'sources', 'topics', 'tools')
PORTS = dict(zip(APPS, range(8101, 8105)))


def hostnames(environment):
    hosts = {}
    for name in APPS:
        url = urlsplit(environment[name.upper() + '_URL'])
        if url.scheme not in ('http', 'https') or not url.hostname or url.username or url.password or url.path not in ('', '/') or url.query or url.fragment:
            raise ValueError(name.upper() + '_URL must be an HTTP origin')
        if not re.fullmatch(r'[a-zA-Z0-9.-]+', url.hostname):
            raise ValueError('Invalid frontend hostname')
        if url.hostname in hosts:
            raise ValueError('Each frontend must have a distinct hostname')
        hosts[url.hostname] = PORTS[name]
    return hosts


def nginx_config(hosts):
    mapping = '\n'.join('    {} {};'.format(host, port) for host, port in hosts.items())
    return '''pid /tmp/webtools/nginx.pid;
error_log /dev/stderr warn;
events { worker_connections 512; }
http {
  access_log off;
  map $host $app_port {
    default 8101;
%s
  }
  client_body_temp_path /tmp/webtools/client;
  proxy_temp_path /tmp/webtools/proxy;
  fastcgi_temp_path /tmp/webtools/fastcgi;
  uwsgi_temp_path /tmp/webtools/uwsgi;
  scgi_temp_path /tmp/webtools/scgi;
  server {
    listen 8080;
    client_max_body_size 1m;
    location = /healthz {
      proxy_pass http://127.0.0.1:8100/healthz;
      proxy_set_header Host $http_host;
    }
    location / {
      proxy_pass http://127.0.0.1:$app_port;
      proxy_set_header Host $http_host;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_read_timeout 500s;
    }
  }
}
''' % mapping


def healthy(include_proxy=True):
    if include_proxy:
        with urlopen('http://127.0.0.1:8080/healthz', timeout=8) as response:
            if response.status != 200:
                raise RuntimeError('Frontend proxy health check failed')
        return

    def check_app(item):
        name, port = item
        with urlopen('http://127.0.0.1:{}/healthz'.format(port), timeout=5) as response:
            if response.status != 200 or json.load(response).get('app') != name:
                raise RuntimeError('Frontend health check failed')

    # Independent dependency checks must fit within the container health timeout.
    with ThreadPoolExecutor(max_workers=len(PORTS)) as checks:
        list(checks.map(check_app, PORTS.items()))


def run():
    if os.environ.get('CFA_REDIS_URL'):
        os.environ.setdefault('SESSION_REDIS_URL', os.environ['CFA_REDIS_URL'])
        os.environ.setdefault('CACHE_REDIS_URL', os.environ['CFA_REDIS_URL'])
    required = ('MONGO_URL', 'SESSION_REDIS_URL', 'CACHE_REDIS_URL', 'MEDIA_CLOUD_API_URL', 'MEDIA_CLOUD_API_KEY', 'SECRET_KEY', 'PAYLOAD_API_URL', 'PAYLOAD_API_KEY')
    for key in required:
        if not os.environ.get(key):
            raise ValueError('Missing required environment variable ' + key)
    hosts = hostnames(os.environ)
    class HealthHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            status = 200
            try:
                healthy(include_proxy=False)
            except Exception:
                status = 503
            host = self.headers.get('Host', '').split(':')[0]
            app_name = next((name for name, port in PORTS.items() if port == hosts.get(host, 8101)), 'explorer')
            body = json.dumps({'status': 'ok' if status == 200 else 'unavailable', 'app': app_name}).encode()
            self.send_response(status)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        def log_message(self, *_args):
            pass
    health_server = ThreadingHTTPServer(('127.0.0.1', 8100), HealthHandler)
    threading.Thread(target=health_server.serve_forever, daemon=True).start()
    Path('/tmp/webtools').mkdir(exist_ok=True)
    Path('/tmp/webtools/nginx.conf').write_text(nginx_config(hosts))
    children = []
    stopping = False

    def stop(_signal, _frame):
        nonlocal stopping
        stopping = True

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    try:
        for name, port in PORTS.items():
            environment = dict(os.environ, SERVER_APP=name, SERVER_MODE='prod')
            command = ['gunicorn', 'server:app', '--bind', '127.0.0.1:' + str(port), '--workers', '1',
                       '--worker-class', 'gevent', '--timeout', '500', '--graceful-timeout', '20', '--error-logfile', '-']
            children.append((name, subprocess.Popen(command, env=environment)))
            print('[webtools] Started ' + name, flush=True)
        children.append(('nginx', subprocess.Popen(['nginx', '-c', '/tmp/webtools/nginx.conf', '-g', 'daemon off;'])))
        while not stopping:
            for name, child in children:
                if child.poll() is not None:
                    raise RuntimeError(name + ' exited; stopping the complete frontend container')
            time.sleep(0.2)
    finally:
        health_server.shutdown()
        for _, child in children:
            if child.poll() is None:
                child.terminate()
        deadline = time.monotonic() + 25
        for _, child in children:
            try:
                child.wait(timeout=max(0.1, deadline - time.monotonic()))
            except subprocess.TimeoutExpired:
                child.kill()
                child.wait()


if __name__ == '__main__':
    try:
        healthy() if '--healthcheck' in sys.argv else run()
    except Exception as error:
        print('[webtools] ' + str(error), file=sys.stderr)
        sys.exit(1)
