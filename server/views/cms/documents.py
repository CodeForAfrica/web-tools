"""
This module contains methods that directly return responses from another API (Payload CMS).
While this approach is generally discouraged due to potential security risks,
it is considered acceptable in this case because the Payload CMS backend is trusted.
"""
import logging
from flask import jsonify, request
import requests
import html

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

@app.route('/api/cms/pages', methods=['GET'])
@api_error_handler
@arguments_required('cs-app')
def api_fetch_page_content():
    application_name = html.escape(request.args.get('cs-app'))
    url = f"{BASE_URL}/{application_name}-pages"
    headers = dict(request.headers)
    headers['Authorization'] = f'users API-Key {API_KEY}'
    headers['Cs-App'] = application_name
    try:
        escaped_args = {k: html.escape(v) for k, v in request.args.items()}
        response = requests.get(url, escaped_args, headers=headers)
        return response.json(), response.status_code
    except:
        error_message = {'message': 'Received an invalid or malformed response'}
        logger.error(error_message)
        return jsonify(error_message), 500


@app.route('/api/cms/collections', methods=['GET'])
@api_error_handler
@arguments_required('collection')
def api_fetch_collections():
    collection = html.escape(request.args.get('collection'))
    url = f'{BASE_URL}/{collection}'
    headers = dict(request.headers)
    headers['Authorization'] = f'users API-Key {API_KEY}'

    try:
        escaped_args = {k: html.escape(v) for k, v in request.args.items()}
        response = requests.get(url, escaped_args, headers=headers)
        return response.json(), response.status_code
    except:
        error_message = {'message': 'Received an invalid or malformed response'}
        logger.error(error_message)
        return jsonify(error_message), 500


@app.route('/api/cms/globals', methods=['GET'])
@api_error_handler
@arguments_required('cs-app')
def api_fetch_globals():
    application_name = html.escape(request.args.get('cs-app'))
    url = f'{BASE_URL}/globals/settings-{application_name}-site'
    headers = dict(request.headers)
    headers['Authorization'] = f'users API-Key {API_KEY}'
    
    try:
        escaped_args = {k: html.escape(v) for k, v in request.args.items()}
        response = requests.get(url, escaped_args, headers=headers)
        return response.json(), response.status_code
    except:
        error_message = {'message': 'Received an invalid or malformed response'}
        logger.error(error_message)
        return jsonify(error_message), 500


@app.route('/api/cms/forms', methods=['GET'])
@api_error_handler
def api_fetch_forms():
    form =  html.escape(request.args.get('form'))
    if not form:
        error_message = 'Missing required parameter (form) in the request.'
        logger.error(error_message)
        raise RuntimeError(error_message)

    url = f'{BASE_URL}/globals/{form}-form'
    headers = dict(request.headers)
    headers['Authorization'] = f'users API-Key {API_KEY}'
    
    try:
        escaped_args = {k: html.escape(v) for k, v in request.args.items()}
        response = requests.get(url, escaped_args, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            return response.json(), response.status_code
    except:
        error_message = {'message': 'Received an invalid or malformed response'}
        logger.error(error_message)
        return jsonify(error_message), 500
