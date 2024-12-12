import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import SignupContainer from './SignupContainer';
import { fetchFormContent } from '../../actions/cmsActions';

class SignupContainerWrapper extends React.Component {
  componentDidMount() {
    this.props.fetchContent();
  }

  render() {
    const { content } = this.props;
    return (
      content ? (<SignupContainer content={content} />
      ) : null
    );
  }
}
const mapStateToProps = state => ({
  content: state.cms.forms.content?.registration,
});

const mapDispatchToProps = (dispatch) => ({
  fetchContent: () => {
    dispatch(fetchFormContent('registration'));
  },
});

SignupContainerWrapper.propTypes = {
  fetchContent: PropTypes.func,
  content: PropTypes.object,
};

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    SignupContainerWrapper
  )
);
