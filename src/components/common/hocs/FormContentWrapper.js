import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { fetchFormContent } from '../../../actions/cmsActions';

const FormContentWrapper = ({ content, fetchContent, WrappedComponent, ...props }) => {
  useEffect(() => {
    if (!content) {
      fetchContent();
    }
  }, [content, fetchContent]);

  return content ? <WrappedComponent content={content} {...props} /> : null;
};

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
  )((props) => <FormContentWrapper {...props} WrappedComponent={WrappedComponent} />)
);

export default createFormContentWrapper;
