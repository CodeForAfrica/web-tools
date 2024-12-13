import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Row, Col } from 'react-flexbox-grid/lib';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';
import { loginWithPassword } from '../../actions/userActions';
import AppButton from '../common/AppButton';
import * as fetchConstants from '../../lib/fetchConstants';
import { emptyString, invalidEmail } from '../../lib/formValidators';
import withIntlForm from '../common/hocs/IntlForm';
import { addNotice, updateFeedback } from '../../actions/appActions';
import { LEVEL_ERROR } from '../common/Notice';
import serializeSlateToHtml from '../../lib/cmsUtils/slateToHTMLSerializer';
import createFormContentWrapper from '../common/hocs/FormContentWrapper';


const LoginForm = (props) => {
  const { handleSubmit, onSubmitLoginForm, fetchStatus, renderTextField, content } = props;
  const { formatMessage } = props.intl;

  const messages = content
  ? {
      userEmail: {
        id: 'user.email',
        defaultMessage: content.emailLabel,
      },
      userPassword: {
        id: 'user.password',
        defaultMessage: content.passwordLabel,
      },
      missingEmail: {
        id: 'user.missingEmail',
        defaultMessage: content.emailErrorMessage,
      },
      missingPassword: {
        id: 'user.missingPassword',
        defaultMessage: content.passwordErrorMessage,
      },
      loginFailed: {
        id: 'user.loginFailed',
        defaultMessage: content.loginFailed,
      },
      loginSucceeded: {
        id: 'user.loginSucceeded',
        defaultMessage: content.loginSucceeded,
      },
      signUpNow: {
        id: 'user.signUpNow',
        defaultMessage: content.registrationButton,
      },
      login: {
        id: 'user.login',
        defaultMessage: content.loginButton,
      },
      forgotPassword: {
        id: 'user.forgotPassword',
        defaultMessage: content.forgotPasswordButton,
      },
      needsToActivate: {
        id: 'user.needsToActivate',
        defaultMessage: serializeSlateToHtml(content.needsToActivate),
      },
    }
  : null;

  return (
    messages ? (
      <form onSubmit={handleSubmit(onSubmitLoginForm.bind(this))} className="app-form login-form">
        <Row>
          <Col lg={12}>
            <Field
              name="email"
              component={renderTextField}
              label={messages.userEmail}
              fullWidth
            />
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <Field
              name="password"
              type="password"
              component={renderTextField}
              label={messages.userPassword}
              fullWidth
            />
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <AppButton
              type="submit"
              label={formatMessage(messages.login)}
              primary
              disabled={fetchStatus === fetchConstants.FETCH_ONGOING}
            />
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <Link to="/user/signup">
              <AppButton label={formatMessage(messages.signUpNow)} />
            </Link>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <Link to="/user/request-password-reset">
              <AppButton label={formatMessage(messages.forgotPassword)} />
            </Link>
          </Col>
        </Row>
      </form>
    ) : null
  );
};

LoginForm.propTypes = {
  // from composition
  intl: PropTypes.object.isRequired,
  location: PropTypes.object,
  redirect: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  renderTextField: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  // from dispatch
  onSubmitLoginForm: PropTypes.func.isRequired,
  content: PropTypes.object,
};

const mapStateToProps = state => ({
  fetchStatus: state.user.fetchStatus,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmitLoginForm: (values) => {
    dispatch(loginWithPassword(values.email, values.password))
      .then((response) => {
        if (response.profile && response.profile.has_consented === false) {
          dispatch(push('/user/consent'));
        }
        if (response.profile && response.profile.api_key) {
          // redirect to destination if there is one
          const loc = ownProps.location;
          let redirectTo;
          if (ownProps.redirect) {
            const { redirect } = ownProps.redirect;
            redirectTo = redirect;
          } else {
            redirectTo = (loc && loc.state && loc.state.nextPathname) ? loc.state.nextPathname : '';
          }
          if (redirectTo) {
            dispatch(push(redirectTo));
          }
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.content.loginSucceeded }));
        } else if ((response.message) && (response.message.includes('is not active'))) {
          // user has signed up, but not activated their account
          dispatch(addNotice({ htmlMessage: serializeSlateToHtml(ownProps.content.needsToActivate), level: LEVEL_ERROR }));
        } else if (response.statusCode) {
          dispatch(addNotice({ message: ownProps.content.loginFailed, level: LEVEL_ERROR }));
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
  if (emptyString(values.password)) {
    errors.password = props.content?.passwordErrorMessage;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'login',
  validate,
};

export default createFormContentWrapper(
withIntlForm(
  reduxForm(reduxFormConfig)(
    connect(mapStateToProps, mapDispatchToProps)(
      LoginForm
    )
  )
),
'login'
);
