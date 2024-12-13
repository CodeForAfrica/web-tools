import { combineReducers } from 'redux';
import pages from './pages';
import collections from './collections';
import forms from './forms';

const cms = combineReducers({ pages, collections, forms });

export default cms;
