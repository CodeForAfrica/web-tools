import { FETCH_FORMS } from '../../actions/cmsActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';


const forms = createAsyncReducer({
  initialState: {
    content: {},
  },
  action: FETCH_FORMS,
  handleSuccess: (payload, state) => ({
    content: {
      ...state.content,
      labels: payload,
    },
  }),
});

export default forms;
