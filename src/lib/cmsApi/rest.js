import { createApiPromise } from '../apiUtil';

const BASE_URL = process.env.PAYLOAD_API_URL;
const AUTH_HEADER = { Authorization: `users API-Key ${process.env.PAYLOAD_API_KEY}` };
const CURRENT_APP_HEADER = 'CS-app';

export function fetchGlobals(applicationName) {
  return createApiPromise(
    `${BASE_URL}/globals/settings-${applicationName}-site`, { draft: false, depth: 1 },
    'get',
    { ...AUTH_HEADER, [CURRENT_APP_HEADER]: applicationName }
  );
}

export function fetchPageContent(applicationName, pageName) {
  return createApiPromise(
    `${BASE_URL}/${applicationName}-pages`, { 'where[slug][equals]': pageName },
    'get',
    { ...AUTH_HEADER, [CURRENT_APP_HEADER]: applicationName }
  );
}

export function fetchCollections(applicationName, collectionName) {
  return createApiPromise(
    `${BASE_URL}/${collectionName}`,
    null,
    'get',
    { ...AUTH_HEADER, [CURRENT_APP_HEADER]: applicationName }
  );
}
