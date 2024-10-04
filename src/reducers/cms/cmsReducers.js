import { combineReducers } from 'redux';
import fetchPageContent from './fetchPageContent';


const cmsReducer = combineReducers({ fetchPageContent });

export default cmsReducer;
