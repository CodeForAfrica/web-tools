import { FETCH_PAGE_CONTENT } from '../../actions/cmsActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';
import { parsePageContent } from '../../lib/cmsUtils/blockRenderer';

const pageContent = createAsyncReducer({
  initialState: {
    pages: {},
  },
  action: FETCH_PAGE_CONTENT,
  handleSuccess: (payload, state) => ({
    pages: {
      ...state.pages,
      'media-data': parsePageContent(payload),
     },
  }),
});

export default pageContent;
