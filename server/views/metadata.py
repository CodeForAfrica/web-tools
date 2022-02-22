import logging
import flask_login
from flask import jsonify, request

from server import app
from server.auth import user_mediacloud_key
from server.cache import cache
from server.util.request import arguments_required, api_error_handler
from server.views.sources.apicache import tags_in_tag_set
from server.util.tags import TagSetDiscoverer

logger = logging.getLogger(__name__)

PUBLICATION_COUNTRY_DEFAULTS = [{'label':'Kenya', 'tags_id': 5936877, 'tag_sets_id': 15, 'tag_set_name': 'pub_country','tag_set_label':'Publication Country'}, ]
PUBLICATION_STATE_DEFAULTS = []
PRIMARY_LANGUAGE_DEFAULTS = [{'label': 'English', 'tags_id': 5890352, 'tag_sets_id': 6, 'tag_set_label':'Primary Language', 'tag_set_name': 'primary_language'}, {'label': 'Swahili', 'tags_id': 5890355, 'tag_sets_id': 6, 'tag_set_label':'Primary Language', 'tag_set_name': 'primary_language'}, {'label': 'French', 'tags_id': 5890354, 'tag_sets_id': 6, 'tag_set_label':'Primary Language', 'tag_set_name': 'primary_language'}, {'label': 'Spanish', 'tags_id': 5890467, 'tag_sets_id': 6, 'tag_set_label':'Primary Language', 'tag_set_name': 'primary_language'}, {'label': 'German', 'tags_id': 5890478, 'tag_sets_id': 6, 'tag_set_label':'Primary Language', 'tag_set_name': 'primary_language'}, {'label': 'Zuru', 'tags_id': 5890390, 'tag_sets_id': 6, 'tag_set_label':'Primary Language', 'tag_set_name': 'primary_language'}]
COUNTRY_OF_FOCUS_DEFAULTS = [{'label':'Kenya', 'tags_id': 5936877, 'tag_sets_id': 15, 'tag_set_name': 'pub_country','tag_set_label':'Publication Country'}]
MEDIA_TYPE_DEFAULTS = [{'label': 'Print Native', 'tags_id': 5933332, 'tag_sets_id': 8, 'tag_set_name': 'media_format', 'tag_set_label': 'Media Format'},]

@app.route('/api/metadata/<tag_sets_id>/values', methods=['GET'])
@flask_login.login_required
@api_error_handler
def api_metadata_values(tag_sets_id):
    """
    Source metadata is encoded in various tag sets - this returns the set and the list of
    available tags you can use
    """
    data = tags_in_tag_set(user_mediacloud_key(), tag_sets_id, False, True)  # use the file-based cache here
    data['short_list'] = get_metadata_defaults(tag_sets_id)
    return jsonify(data)


@app.route('/api/metadata/<tag_sets_id>/search', methods=['GET'])
@arguments_required("name")
@flask_login.login_required
@api_error_handler
def api_metadata_search(tag_sets_id):
    search_string = request.args['name']
    # search by ourselves in the file-based cache of all the tags (faster than asking the API to do it over and over)
    data = tags_in_tag_set(user_mediacloud_key(), tag_sets_id, False, True)
    matching_tags = [t for t in data['tags'] if search_string.lower() in t['label'].lower()]
    return jsonify(matching_tags)


@cache.cache_on_arguments()
def get_metadata_defaults(tag_sets_id):
    short_list = []
    if int(tag_sets_id) == TagSetDiscoverer().media_pub_country_set:
        short_list = PUBLICATION_COUNTRY_DEFAULTS
    if int(tag_sets_id) == TagSetDiscoverer().media_pub_state_set:
        short_list = PUBLICATION_STATE_DEFAULTS
    if int(tag_sets_id) == TagSetDiscoverer().media_primary_language_set:
        short_list = PRIMARY_LANGUAGE_DEFAULTS
    if int(tag_sets_id) == TagSetDiscoverer().media_subject_country_set:
        short_list = COUNTRY_OF_FOCUS_DEFAULTS
    if int(tag_sets_id) == TagSetDiscoverer().media_type_set:
        short_list = MEDIA_TYPE_DEFAULTS
    return short_list
