import { FETCH_COLLECTIONS } from '../../actions/cmsActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';


const collections = createAsyncReducer({
  initialState: {
    content: {},
  },
  action: FETCH_COLLECTIONS,
  handleSuccess: (payload, state, meta) => ({
    content: {
      ...state.content,
      [meta.args[1]]: payload,
     },
  }),
});

export default collections;
