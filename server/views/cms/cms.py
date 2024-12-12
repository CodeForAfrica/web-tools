import logging
from flask import jsonify, request
import requests
import html

from server import app
from server.util.request import api_error_handler

logger = logging.getLogger(__name__)
BASE_URL = app.config['PAYLOAD_API_URL']
API_KEY = app.config['PAYLOAD_API_KEY']

if not BASE_URL:
    logger.error("Missing PAYLOAD_API_URL")

if not API_KEY:
    logger.error("Missing PAYLOAD_API_KEY")

@app.route('/api/cms/pages', methods=['GET'])
@api_error_handler
def api_fetch_page_content():
    application_name = html.escape(request.headers.get('cs-app') or '')
    url = f"{BASE_URL}/{application_name}-pages"
    headers = dict(request.headers)
    headers['Authorization'] = f"users API-Key {API_KEY}"
    try:
        escaped_args = {k: html.escape(v) for k, v in request.args.items()}
        response = requests.get(url, escaped_args, headers=headers)
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify(response.json()), response.status_code
    except:
        return jsonify({'message': 'Received an invalid or malformed response'}), 500


@app.route('/api/cms/collections', methods=['GET'])
@api_error_handler
def api_fetch_collections():
    collection = html.escape(request.args.get('collection'))
    url = f"{BASE_URL}/{collection}"
    headers = dict(request.headers)
    headers['Authorization'] = f"users API-Key {API_KEY}"

    try:
        escaped_args = {k: html.escape(v) for k, v in request.args.items()}
        response = requests.get(url, escaped_args, headers=headers)
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify(response.json()), response.status_code
    except:
        return jsonify({'message': 'Received an invalid or malformed response'}), 500


@app.route('/api/cms/globals', methods=['GET'])
@api_error_handler
def api_fetch_globals():
    application_name = html.escape(request.headers.get('cs-app'))
    url = f"{BASE_URL}/globals/settings-{application_name}-site"
    headers = dict(request.headers)
    headers['Authorization'] = f"users API-Key {API_KEY}"
    
    try:
        escaped_args = {k: html.escape(v) for k, v in request.args.items()}
        response = requests.get(url, escaped_args, headers=headers)
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify(response.json()), response.status_code
    except:
        return jsonify({'message': 'Received an invalid or malformed response'}), 500
