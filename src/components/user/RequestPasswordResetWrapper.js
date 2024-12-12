import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { fetchFormContent } from '../../actions/cmsActions';
import RequestPasswordReset from './RequestPasswordReset';

class RequestPasswordResetWrapper extends React.Component {
  componentDidMount() {
    this.props.fetchContent();
  }

  render() {
    const { content } = this.props;
    return (
      content ? (<RequestPasswordReset content={content} />
      ) : null
    );
  }
}
const mapStateToProps = state => ({
  content: state.cms.forms.content?.['reset-password'],
});

const mapDispatchToProps = (dispatch) => ({
  fetchContent: () => {
    dispatch(fetchFormContent('reset-password'));
  },
});

RequestPasswordResetWrapper.propTypes = {
  fetchContent: PropTypes.func,
  content: PropTypes.object,
};

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    RequestPasswordResetWrapper
  )
);
