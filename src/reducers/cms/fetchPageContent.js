import { FETCH_PAGE_CONTENT } from '../../actions/cmsActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';

const pageContent = createAsyncReducer({
  initialState: {
    pages: {},
  },
  action: FETCH_PAGE_CONTENT,
  handleSuccess: (state, payload) => ({
    ...state,
    pages: {
      ...state.pages,
      [payload.pageId]: {
        content: payload.content,
        lastUpdated: new Date().toISOString(),
      },
    },
  }),
});

export default pageContent;
