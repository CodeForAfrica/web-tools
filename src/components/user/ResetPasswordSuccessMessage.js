import PropTypes from 'prop-types';
import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { FormattedMessage, injectIntl } from 'react-intl';
import createFormContentWrapper from '../common/hocs/FormContentWrapper';

const ResetPasswordSuccessMessage = ({ content }) => {
  const localMessages = {
    title: { id: 'success.email', defaultMessage: content.passwordResetSuccessTitle },
    intro: { id: 'success.emailInfo', defaultMessage: content.passwordResetSuccessDescription },
  };

  return (
    <div className="change-password-success">
      <Grid>
        <Row>
          <Col lg={12}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
            <p><FormattedMessage {...localMessages.intro} /></p>
          </Col>
        </Row>
      </Grid>
    </div>
  );
};

ResetPasswordSuccessMessage.propTypes = {
  intl: PropTypes.object.isRequired,
  content: PropTypes.object.isRequired,
};

export default createFormContentWrapper(
  injectIntl(ResetPasswordSuccessMessage),
  'reset-password'
);
