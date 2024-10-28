import { createAsyncAction } from '../lib/reduxHelpers';
import * as api from '../lib/cmsApi/rest';

export const FETCH_PAGE_CONTENT = 'FETCH_PAGE_CONTENT';
export const FETCH_GLOBALS = 'FETCH_GLOBALS';
export const FETCH_COLLECTIONS = 'FETCH_COLLECTIONS';

export const fetchPageContent = createAsyncAction(FETCH_PAGE_CONTENT, api.fetchPageContent);
export const fetchGlobals = createAsyncAction(FETCH_GLOBALS, api.fetchGlobals);
export const fetchCollection = createAsyncAction(FETCH_COLLECTIONS, api.fetchCollections);
