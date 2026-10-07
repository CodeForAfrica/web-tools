import importlib.util
import unittest
import io
import json
import threading
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('webtools_runtime', 'docker/webtools.py')
runtime = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runtime)


class RuntimeTest(unittest.TestCase):
    def environment(self):
        return {name.upper() + '_URL': 'http://' + name + '.civicsignal.localhost:8083' for name in runtime.APPS}

    def test_all_apps_route_to_distinct_processes(self):
        hosts = runtime.hostnames(self.environment())
        self.assertEqual(set(hosts.values()), {8101, 8102, 8103, 8104})
        config = runtime.nginx_config(hosts)
        for host, port in hosts.items():
            self.assertIn('{} {};'.format(host, port), config)
        self.assertIn('listen 8080', config)

    def test_reject_duplicate_origins_and_nginx_injection(self):
        for invalid in ('http://explorer.civicsignal.localhost:8083', 'http://example.com/extra', 'http://user:pass@example.com', 'http://example.com;bad'):
            environment = self.environment()
            environment['TOOLS_URL'] = invalid
            with self.assertRaises(ValueError):
                runtime.hostnames(environment)

    def test_dependency_checks_overlap_and_validate_every_tool(self):
        ready = threading.Barrier(4)

        def response(url, timeout):
            port = int(url.split(':')[2].split('/')[0])
            name = next(name for name, value in runtime.PORTS.items() if value == port)
            ready.wait(timeout=1)
            body = io.BytesIO(json.dumps({'app': name}).encode())
            body.status = 200
            return body

        with patch.object(runtime, 'urlopen', side_effect=response) as requests:
            runtime.healthy(include_proxy=False)
        self.assertEqual(requests.call_count, 4)


if __name__ == '__main__':
    unittest.main()
