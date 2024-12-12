import { FETCH_FORMS } from '../../actions/cmsActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';


const forms = createAsyncReducer({
  initialState: {
    content: {},
  },
  action: FETCH_FORMS,
  handleSuccess: (payload, state, meta) => ({
    content: {
      ...state.content,
      [meta.args[0]]: payload,
    },
  }),
});

export default forms;
