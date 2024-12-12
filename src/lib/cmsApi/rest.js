import { createApiPromise } from '../apiUtil';

const CURRENT_APP_HEADER = 'cs-app';

export function fetchGlobals(applicationName) {
  return createApiPromise(
    '/api/cms/globals', { draft: false, depth: 1, [CURRENT_APP_HEADER]: applicationName },
    'get',
  );
}

export function fetchPageContent(applicationName, pageName) {
  return createApiPromise(
    '/api/cms/pages', { 'where[slug][equals]': pageName, [CURRENT_APP_HEADER]: applicationName },
    'get',
  );
}

export function fetchCollections(applicationName, collectionName) {
  return createApiPromise(
    '/api/cms/collections',
    { collection: collectionName, [CURRENT_APP_HEADER]: applicationName },
    'get',
  );
}

export function fetchFormContent(form) {
  return createApiPromise(
    '/api/cms/forms', { form }, 'get',
  );
}
