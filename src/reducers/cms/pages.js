import { FETCH_PAGE_CONTENT } from '../../actions/cmsActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';
import parsePageContent from '../../lib/cmsUtils/cmsParser';

const pages = createAsyncReducer({
  initialState: {
    content: {},
  },
  action: FETCH_PAGE_CONTENT,
  handleSuccess: (payload, state, meta) => ({
    content: {
      ...state.content,
      [meta.args[1]]: parsePageContent(payload),
     },
  }),
});

export default pages;
