import importlib.util
import unittest

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


if __name__ == '__main__':
    unittest.main()
