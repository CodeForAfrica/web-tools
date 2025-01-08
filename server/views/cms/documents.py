"""
This module contains methods that directly return responses from another API (Payload CMS).
While this approach is generally discouraged due to potential security risks,
it is considered acceptable in this case because the Payload CMS backend is trusted.
"""
import logging
from flask import jsonify, request
import requests
import html

from functools import wraps
from server import app
from server.util.request import api_error_handler, arguments_required

logger = logging.getLogger(__name__)
BASE_URL = app.config['PAYLOAD_API_URL']
API_KEY = app.config['PAYLOAD_API_KEY']

missing_configs = []
if not BASE_URL:
    missing_configs.append("PAYLOAD_API_URL")
if not API_KEY:
    missing_configs.append("PAYLOAD_API_KEY")

if missing_configs:
    missing_configs_str = ', '.join(missing_configs)
    error_message = f'Configuration error missing: {missing_configs_str}'
    logger.error(error_message)
    raise RuntimeError(error_message)

BASE_URL = BASE_URL.rstrip('/')


def handle_api_request(func):
    """Helper to handle common API request patterns and error handling"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            response = func(*args, **kwargs)
            response.raise_for_status()
            return response.json(), response.status_code
            
        except requests.RequestException as e:
            error_message = {'message': f'Request failed: {str(e)}'}
            logger.error(error_message)
            return jsonify(error_message), 500
            
        except ValueError as e:
            error_message = {'message': f'Invalid JSON response: {str(e)}'}
            logger.error(error_message)
            return jsonify(error_message), 500
            
        except Exception as e:
            error_message = {'message': f'Unexpected error: {str(e)}'}
            logger.error(error_message)
            return jsonify(error_message), 500
    
    return wrapper

def make_api_request(url, application_name=None, params=None):
    """Helper function to make API requests with consistent headers"""
    headers = {
        'Authorization': f'users API-Key {API_KEY}',
        'Content-Type': 'application/json'
    }
    
    if application_name:
        headers['Cs-App'] = application_name
 
    escaped_args = {k: html.escape(v) for k, v in (params or {}).items()}
    return requests.get(url, params=escaped_args, headers=headers)


@app.route('/api/cms/pages', methods=['GET'])
@api_error_handler
@arguments_required('cs-app')
@handle_api_request
def api_fetch_page_content():
    application_name = html.escape(request.args.get('cs-app'))
    url = f"{BASE_URL}/{application_name}-pages"
    return make_api_request(url, application_name, request.args)
  

@app.route('/api/cms/collections', methods=['GET'])
@api_error_handler
@arguments_required('collection')
@handle_api_request
def api_fetch_collections():
    collection = html.escape(request.args.get('collection'))
    url = f'{BASE_URL}/{collection}'
    return make_api_request(url, params=request.args)


@app.route('/api/cms/globals', methods=['GET'])
@api_error_handler
@arguments_required('cs-app')
@handle_api_request
def api_fetch_globals():
    application_name = html.escape(request.args.get('cs-app'))
    url = f'{BASE_URL}/globals/settings-{application_name}-site'
    return make_api_request(url, application_name, request.args)


@app.route('/api/cms/forms', methods=['GET'])
@api_error_handler
@arguments_required('form')
@handle_api_request
def api_fetch_forms():
    form = html.escape(request.args.get('form'))
    url = f'{BASE_URL}/globals/{form}-form'
    return make_api_request(url, params=request.args)
