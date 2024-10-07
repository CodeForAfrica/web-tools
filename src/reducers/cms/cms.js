import { combineReducers } from 'redux';
import pages from './pages';
import collections from './collections';

const cms = combineReducers({ pages, collections });

export default cms;
