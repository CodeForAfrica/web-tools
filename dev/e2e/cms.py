"""Local-only CMS content fixture. Does not emulate backend or authentication."""
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlsplit

LOGIN = dict(title='Login', emailLabel='Email', passwordLabel='Password', emailErrorMessage='Email required',
             passwordErrorMessage='Password required', loginFailed='Login failed', loginSucceeded='Logged in',
             registrationButton='Sign up', loginButton='Login', forgotPasswordButton='Forgot password?', needsToActivate=[])

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/api/globals/login-form':
            result = LOGIN
        elif path.endswith('-pages'):
            result = {'docs': [{'fullTitle': 'CivicSignal Tools', 'slug': 'media', 'blocks': [
                {'blockType': 'page-header', 'title': 'CivicSignal Tools', 'subtitle': [{'type': 'paragraph', 'children': [{'text': 'Local content fixture'}]}]}]}]}
        elif path == '/api/media-data':
            result = {'docs': []}
        else:
            self.send_error(404)
            return
        body = json.dumps(result).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *_):
        pass

HTTPServer(('0.0.0.0', 18084), Handler).serve_forever()
