import { createApiPromise } from '../apiUtil';

const BASE_URL = process.env.PAYLOAD_API_URL;

export function getGlobals() {
  return true;
}

export function getPageContent(applicationName, pageName) {
  return createApiPromise(
    `${BASE_URL}/${applicationName}-pages`, { '[slug][equals]': pageName }
  );
}

export function getCollections(collectionName) {
  return createApiPromise(
    `${BASE_URL}/${collectionName}`
  );
}
