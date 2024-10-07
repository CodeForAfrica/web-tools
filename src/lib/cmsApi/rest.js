import { createApiPromise } from '../apiUtil';

const BASE_URL = process.env.PAYLOAD_API_URL;

export function fetchGlobals(applicationName) {
  return createApiPromise(
    `${BASE_URL}/globals/settings-${applicationName}-site`, { draft: false, depth: 1 }
  );
}

export function fetchPageContent(applicationName, pageName) {
  return createApiPromise(
    `${BASE_URL}/${applicationName}-pages`, { '[slug][equals]': pageName }
  );
}

export function fetchCollections(collectionName) {
  return createApiPromise(
    `${BASE_URL}/${collectionName}`
  );
}
