import { createApiPromise } from '../apiUtil';

const AUTH_HEADER = { Authorization: `users API-Key ${process.env.PAYLOAD_API_KEY}` };
const CURRENT_APP_HEADER = 'CS-app';

export function fetchGlobals(applicationName) {
  return createApiPromise(
    `/api/cms/globals/settings-${applicationName}-site`, { draft: false, depth: 1 },
    'get',
    { ...AUTH_HEADER, [CURRENT_APP_HEADER]: applicationName }
  );
}

export function fetchPageContent(applicationName, pageName) {
  return createApiPromise(
    '/api/cms/fetch-page-content', { 'where[slug][equals]': pageName },
    'get',
    { ...AUTH_HEADER, [CURRENT_APP_HEADER]: applicationName }
  );
}

export function fetchCollections(applicationName, collectionName) {
  return createApiPromise(
    '/api/cms/fetch-collections',
    { collection: collectionName },
    'get',
    { ...AUTH_HEADER, [CURRENT_APP_HEADER]: applicationName }
  );
}
