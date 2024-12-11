import { createApiPromise } from '../apiUtil';

const CURRENT_APP_HEADER = 'CS-app';

export function fetchGlobals(applicationName) {
  return createApiPromise(
    `/api/cms/globals/settings-${applicationName}-site`, { draft: false, depth: 1 },
    'get',
    { [CURRENT_APP_HEADER]: applicationName }
  );
}

export function fetchFormContent(form) {
  return createApiPromise(
    '/api/cms/forms', { form }, 'get',
  );
}

export function fetchPageContent(applicationName, pageName) {
  return createApiPromise(
    '/api/cms/fetch-page-content', { 'where[slug][equals]': pageName },
    'get',
    { [CURRENT_APP_HEADER]: applicationName }
  );
}

export function fetchCollections(applicationName, collectionName) {
  return createApiPromise(
    '/api/cms/fetch-collections',
    { collection: collectionName },
    'get',
    { [CURRENT_APP_HEADER]: applicationName }
  );
}
