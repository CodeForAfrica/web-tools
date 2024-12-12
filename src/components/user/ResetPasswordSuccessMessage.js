import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { FormattedMessage, injectIntl } from 'react-intl';
import { fetchFormContent } from '../../actions/cmsActions';


const ResetPasswordSuccessMessage = ({ fetchContent, content }) => {
  useEffect(() => {
    if (!content) {
      fetchContent();
    }
  }, [fetchContent]);

  const localMessages = content ? {
    title: { id: 'success.email', defaultMessage: content.passwordResetSuccessTitle },
    intro: { id: 'success.emailInfo', defaultMessage: content.passwordResetSuccessDescription },
  } : null;

  return (localMessages ? (
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
  ) : null);
};

ResetPasswordSuccessMessage.propTypes = {
  intl: PropTypes.object.isRequired,
  content: PropTypes.object,
  fetchContent: PropTypes.func,
};

const mapStateToProps = state => ({
  content: state.cms.forms.content?.['reset-password'],
});

const mapDispatchToProps = (dispatch) => ({
  fetchContent: () => {
    dispatch(fetchFormContent('reset-password'));
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    ResetPasswordSuccessMessage
  )
);
