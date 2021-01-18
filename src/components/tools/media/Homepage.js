import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import ResourceList from './ResourceList';

const localMessages = {
  title: { id: 'media.intro.title', defaultMessage: 'Media Data' },
  subtitle: {
    id: 'media.intro.subtitle',
    defaultMessage: 'What is Media Data?',
  },
  description: {
    id: 'media.intro.description',
    defaultMessage:
      'MediaData uses a combination of machine learning data platforms and human research to bring you data, reports and analyses related to African media ecosystems',
  },
  loginTitle: {
    id: 'media.intro.login.title',
    defaultMessage: 'Have an Account? Login Now',
  },
};

const Homepage = () => (
  <div className="homepage">
    <Grid>
      <Row className="media-hero">
        <Col lg={1} />
        <Col lg={12}>
          <h1>
            <FormattedMessage {...localMessages.subtitle} />
          </h1>
          <p className="intro">
            <FormattedMessage {...localMessages.description} />
          </p>
        </Col>
      </Row>
    </Grid>
    <ResourceList />
  </div>
);

Homepage.propTypes = {
  intl: PropTypes.object.isRequired,
  // from context
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired, // params from router
  // from state
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({});

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(Homepage)
);
