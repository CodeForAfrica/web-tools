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


def fetch_cms_content(url, application_name=None, params=None):
    """Helper function to make API requests with consistent headers"""
    headers = dict(request.headers)
    headers.pop('Host', None)
    headers['Authorization'] = f'users API-Key {API_KEY}'
    if application_name:
       headers['Cs-App'] = application_name
    try:
        escaped_args = {k: html.escape(v) for k, v in (params or {}).items()}
        response = requests.get(url, params=escaped_args, headers=headers)
        return response.json(), response.status_code
    except requests.RequestException:
        logger.exception('Request failed')
    except ValueError:
        logger.exception('Invalid JSON response')    
    except Exception:
        logger.exception('Unexpected error')
    return jsonify({'message': 'An internal error has occurred.'}), 500


@app.route('/api/cms/pages', methods=['GET'])
@api_error_handler
@arguments_required('cs-app')
def api_fetch_page_content():
    application_name = html.escape(request.args.get('cs-app'))
    url = f"{BASE_URL}/{application_name}-pages"
    return fetch_cms_content(url, application_name, request.args)
  

@app.route('/api/cms/collections', methods=['GET'])
@api_error_handler
@arguments_required('collection')
def api_fetch_collections():
    collection = html.escape(request.args.get('collection'))
    url = f'{BASE_URL}/{collection}'
    return fetch_cms_content(url, params=request.args)


@app.route('/api/cms/globals', methods=['GET'])
@api_error_handler
@arguments_required('cs-app')
def api_fetch_globals():
    application_name = html.escape(request.args.get('cs-app'))
    url = f'{BASE_URL}/globals/settings-{application_name}-site'
    return fetch_cms_content(url, application_name, request.args)


@app.route('/api/cms/forms', methods=['GET'])
@api_error_handler
@arguments_required('form')
def api_fetch_forms():
    form = html.escape(request.args.get('form'))
    url = f'{BASE_URL}/globals/{form}-form'
    return fetch_cms_content(url, params=request.args)
