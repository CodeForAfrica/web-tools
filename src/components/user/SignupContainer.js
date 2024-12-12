import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { replace } from 'react-router-redux';
import { signupUser } from '../../actions/userActions';
// import { updateFeedback } from '../../actions/appActions';
import AppButton from '../common/AppButton';
import Captcha from '../common/form/Captcha';
import messages from '../../resources/messages';
import { emptyString, invalidEmail, passwordTooShort, stringsDoNotMatch } from '../../lib/formValidators';
import withIntlForm from '../common/hocs/IntlForm';
import { addNotice } from '../../actions/appActions';
import { LEVEL_ERROR } from '../common/Notice';
import PageTitle from '../common/PageTitle';
import serializeSlateToHtml from '../../lib/cmsUtils/slateToHTMLSerializer';


class SignupContainer extends React.Component {
  state = {
    passedCaptcha: false,
  }

  passedCaptcha() {
    this.setState({ passedCaptcha: true });
  }

  render() {
    const { handleSubmit, handleSignupSubmission, pristine, submitting, renderTextField, renderCheckbox, content } = this.props;
    const { formatMessage } = this.props.intl;
    const localMessages = content?.title ? {
      title: { id: 'user.signup.title', defaultMessage: content.title },
      intro: { id: 'user.signup.intro', defaultMessage: content.description },
      userEmail: { id: 'email.label', defaultMessage: content.emailLabel },
      userFullName: { id: 'user.fullName.label', defaultMessage: content.fullNameLabel },
      userPassword: { id: 'user.password.label', defaultMessage: content.passwordLabel },
      userConfirmPassword: { id: 'user.confirm.password.label', defaultMessage: content.confirmPasswordLabel },
      userNotes: { id: 'user.notes.label', defaultMessage: content.notesLabel },
      notesHint: { id: 'notes.hint.label', defaultMessage: content.notesHint },
      userSignup: { id: 'user.signup.label', defaultMessage: content.signUpButton },
      userConsent: { id: 'user.consent.label', defaultMessage: serializeSlateToHtml(content.consentLabel) },

    } : null;

    return (localMessages ? (
      <Grid>
        <PageTitle value={messages.userSignup} />
        <form onSubmit={handleSubmit(handleSignupSubmission.bind(this))} className="app-form signup-form">
          <Row>
            <Col lg={12}>
              <h1><FormattedMessage {...localMessages.title} /></h1>
              <p><FormattedMessage {...localMessages.intro} /></p>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <Field
                name="email"
                fullWidth
                component={renderTextField}
                label={localMessages.userEmail}
              />
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <Field
                name="fullName"
                type="text"
                fullWidth
                component={renderTextField}
                label={localMessages.userFullName}
              />
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <Field
                name="password"
                type="password"
                fullWidth
                component={renderTextField}
                label={localMessages.userPassword}
              />
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <Field
                name="confirmPassword"
                type="password"
                fullWidth
                component={renderTextField}
                label={localMessages.userConfirmPassword}
              />
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <Field
                name="notes"
                multiline
                fullWidth
                rows={2}
                rowsMax={4}
                component={renderTextField}
                placeholder={formatMessage(localMessages.notesHint)}
                label={localMessages.userNotes}
              />
            </Col>
          </Row>
          <Row>
            <Col lg={8}>
              <Field
                name="has_consented"
                component={renderCheckbox}
                fullWidth
                label={localMessages.userConsent}
              />
            </Col>
          </Row>
          <Row>
            <Captcha onChange={() => this.passedCaptcha()} />
          </Row>
          <Row>
            <Col lg={12}>
              <AppButton
                type="submit"
                label={formatMessage(localMessages.userSignup)}
                primary
                disabled={!this.state.passedCaptcha || pristine || submitting}
              />
            </Col>
          </Row>
        </form>
      </Grid>
    ) : null);
  }
}

SignupContainer.propTypes = {
  // from composition
  intl: PropTypes.object.isRequired,
  location: PropTypes.object,
  redirect: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderCheckbox: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  // from dispatch
  handleSignupSubmission: PropTypes.func.isRequired,
  content: PropTypes.object,
};

const mapStateToProps = state => ({
  fetchStatus: state.user.fetchStatus,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleSignupSubmission: values => dispatch(signupUser(values))
    .then((response) => {
      if (response.success !== 1) {
        if (response.message.includes('already exists')) {
          dispatch(addNotice({ level: LEVEL_ERROR, htmlMessage: serializeSlateToHtml(ownProps.content?.userAlreadyExists) }));
        } else {
          dispatch(addNotice({ level: LEVEL_ERROR, message: response.message }));
        }
      } else {
        dispatch(replace('/user/signup-success'));
      }
    }),
});

// in-browser validation callback
function validate(values, props) {
  const errors = {};
  if (invalidEmail(values.email)) {
    errors.email = props.content?.emailErrorMessage;
  }
  if (emptyString(values.fullName)) {
    errors.fullName = props.content?.fullNameErrorMessage;
  }
  if (emptyString(values.password)) {
    errors.password = props.content?.passwordErrorMessage;
  }
  if (passwordTooShort(values.password)) {
    errors.password = props.content?.passwordTooShort;
  }
  if (passwordTooShort(values.confirmPassword)) {
    errors.confirmPassword = props.content?.passwordTooShort;
  }
  if (stringsDoNotMatch(values.password, values.confirmPassword)) {
    errors.password = props.content?.passwordsMismatch;
  }
  if (!values.has_consented) {
    errors.has_consented = props.content?.consentError;
  }
  if (emptyString(values.notes)) {
    errors.notes = props.content?.notesErrorMessage;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'signup',
  validate,
};

export default
withIntlForm(
  reduxForm(reduxFormConfig)(
    connect(mapStateToProps, mapDispatchToProps)(
      SignupContainer
    )
  )
);
