// src/components/common/FormContentWrapper.js
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { fetchFormContent } from '../../../actions/cmsActions';

class FormContentWrapper extends React.Component {
  componentDidMount() {
    this.props.fetchContent();
  }

  render() {
    const { content, WrappedComponent, ...rest } = this.props;
    return content ? <WrappedComponent content={content} {...rest} /> : null;
  }
}

const makeMapStateToProps = (formKey) => (state) => ({
  content: state.cms.forms.content?.[formKey],
});

const makeMapDispatchToProps = (formKey) => (dispatch) => ({
  fetchContent: () => {
    dispatch(fetchFormContent(formKey));
  },
});

FormContentWrapper.propTypes = {
  fetchContent: PropTypes.func.isRequired,
  content: PropTypes.object,
  WrappedComponent: PropTypes.elementType.isRequired,
};

const createFormContentWrapper = (WrappedComponent, formKey) => injectIntl(
    connect(
      makeMapStateToProps(formKey),
      makeMapDispatchToProps(formKey)
    )(props => <FormContentWrapper {...props} WrappedComponent={WrappedComponent} />)
);

export default createFormContentWrapper;
