import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { push } from 'react-router-redux';
import { LEVEL_ERROR } from '../common/Notice';
import { sendRecoverPasswordRequest, userReset, logout } from '../../actions/userActions';
import { addNotice } from '../../actions/appActions';
import AppButton from '../common/AppButton';
import messages from '../../resources/messages';
import { invalidEmail } from '../../lib/formValidators';
import withIntlForm from '../common/hocs/IntlForm';
import PageTitle from '../common/PageTitle';
import withAsyncData from '../common/hocs/AsyncDataContainer';
import createFormContentWrapper from '../common/hocs/FormContentWrapper';


const RequestPasswordReset = (props) => {
  const { handleSubmit, onSubmitRecovery, pristine, renderTextField, content } = props;
  const { formatMessage } = props.intl;
  const localMessages = content?.title ? {
    title: { id: 'user.forgotPassword.title', defaultMessage: content.title },
    intro: { id: 'user.forgotPassword.intro', defaultMessage: content.description },
    userEmail: { id: 'email.label', defaultMessage: content.emailLabel },
    mailMeALink: { id: 'user.forgotPassword.mailMeALink', defaultMessage: content.passwordResetButton },
  } : null;

  return (
    <Grid>
      <PageTitle value={localMessages.title} />
      <form onSubmit={handleSubmit(onSubmitRecovery.bind(this))} className="app-form request-password-reset-form">
        <Row>
          <Col lg={12}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
            <p><FormattedMessage {...localMessages.intro} /></p>
          </Col>
        </Row>
        <Row>
          <Col lg={8} xs={12}>
            <Field
              fullWidth
              name="email"
              component={renderTextField}
              label={messages.userEmail}
            />
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <AppButton
              type="submit"
              label={formatMessage(localMessages.mailMeALink)}
              primary
              disabled={pristine}
            />
          </Col>
        </Row>
      </form>
    </Grid>
  );
};

RequestPasswordReset.propTypes = {
  // from composition
  intl: PropTypes.object.isRequired,
  location: PropTypes.object,
  redirect: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  renderTextField: PropTypes.func.isRequired,
  // from state
  errorMessage: PropTypes.string,
  pristine: PropTypes.bool.isRequired,
  // from dispatch
  onSubmitRecovery: PropTypes.func.isRequired,
  content: PropTypes.object,
};

const mapStateToProps = state => ({
  fetchStatus: state.user.fetchStatus,
  errorMessage: state.user.errorMessage,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmitRecovery: (values) => {
    dispatch(sendRecoverPasswordRequest(values))
      .then((response) => {
        if (response.success) {
          if (response.success === 1) {
            dispatch(push('/user/request-password-reset-success'));
          } else {
            dispatch(addNotice({ message: ownProps.content?.passwordResetFailed, level: LEVEL_ERROR }));
          }
        }
      });
  },
});

// in-browser validation callback
function validate(values, props) {
  const errors = {};
  if (invalidEmail(values.email)) {
    errors.email = props.content?.emailErrorMessage;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'requestPasswordReset',
  validate,
};

const fetchAsyncData = (dispatch) => {
  dispatch(userReset);
  return dispatch(logout);
};

export default createFormContentWrapper(
injectIntl(
  withIntlForm(
    reduxForm(reduxFormConfig)(
      connect(mapStateToProps, mapDispatchToProps)(
        withAsyncData(fetchAsyncData)(
          RequestPasswordReset
        )
      )
    )
  ),
),
  'reset-password'
);
