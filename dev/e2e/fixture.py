#!/usr/bin/env python3
"""Run inside the local backend API; export only disposable fixture credentials."""
import json
import os
import uuid
from mediawords.db import connect_to_db
from webapp.auth.user import NewUser
from webapp.auth.register import add_user
from webapp.auth.info import user_info

db = connect_to_db()
assert db.query('SELECT current_database() AS name').hash()['name'] == 'civicsignal_e2e', 'Refusing non-fixture database'
# The frontend discovers standard tag sets by name; provide local empty sets.
for name in ('nyt_labels', 'nyt_labels_version', 'geocoder_version', 'cliff_geonames',
             'cliff_people', 'cliff_organizations', 'pub_country', 'pub_state',
             'primary_language', 'subject_country', 'media_format', 'collection',
             'geographic_collection', 'twitter_partisanship', 'retweet_partisanship_2016_count_10',
             'extractor_version', 'date_guess_method'):
    if not db.query('SELECT tag_sets_id FROM tag_sets WHERE name = %(name)s', {'name': name}).hash():
        db.create('tag_sets', {'name': name, 'label': name, 'description': 'Local frontend fixture'})
label = 'frontend-e2e-' + uuid.uuid4().hex[:12]
password = 'LocalTest-' + uuid.uuid4().hex
email = label + '@example.invalid'
role = db.query("SELECT auth_roles_id FROM auth_roles WHERE role='admin'").hash()['auth_roles_id']
add_user(db, NewUser(email=email, full_name=label, notes='', active=True, has_consented=True,
                     password=password, password_repeat=password, role_ids=[role]))
with open('/tmp/civicsignal-e2e-story.json') as source:
    fixture = json.load(source)
fixture.update(email=email, password=password, api_key=user_info(db, email).global_api_key(), secret=uuid.uuid4().hex)
path = '/tmp/civicsignal-frontend-fixture.json'
fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
with os.fdopen(fd, 'w') as output:
    json.dump(fixture, output)
print('PASS created isolated frontend test account')
