import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { APP_TOOLS } from '../../../config';
import { fetchPageContent } from '../../../actions/cmsActions';
import serializeSlateToHtml from '../../../lib/cmsUtils/slateToHTMLSerializer';
import ResourceList from './ResourceList';

const Homepage = (props) => {
  const { getPageContent, route, pageData } = props;

  useEffect(() => {
    getPageContent(APP_TOOLS, route?.path);
  }, [getPageContent, route?.path]);

  let localMessages;
  if (pageData && pageData?.blocks.hasOwnProperty('page-header')) {
   localMessages = {
      title: { id: 'media.intro.title', defaultMessage: pageData.fullTitle },
      subtitle: {
        id: 'media.intro.subtitle',
        defaultMessage: pageData.blocks['page-header'].title,
      },
      description: {
        id: 'media.intro.description',
        defaultMessage: serializeSlateToHtml(pageData.blocks['page-header'].subtitle, { class: 'intro' }),
      },
      loginTitle: {
        id: 'media.intro.login.title',
        defaultMessage: 'Have an Account? Login Now',
      },
    };
  }

  return (
    localMessages ? (
      <div className="homepage">
        <Grid>
          <Row className="media-hero">
            <Col lg={1} />
            <Col lg={12}>
              <h1>
                <FormattedMessage {...localMessages.subtitle} />
              </h1>
              <div className="intro">
                <FormattedHTMLMessage {...localMessages.description} />
              </div>
            </Col>
          </Row>
        </Grid>
        <ResourceList />
      </div>
    ) : null
  );
};

Homepage.propTypes = {
  intl: PropTypes.object.isRequired,
  // from context
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired, // params from router
  route: PropTypes.object.isRequired,
  getPageContent: PropTypes.func,
  // from state
  pageData: PropTypes.object,
};

const mapStateToProps = (state) => ({
  pageData: state.cms.pages.content.media,
});

const mapDispatchToProps = (dispatch) => ({
    getPageContent: (appName, pageName) => { dispatch(fetchPageContent(appName, pageName)); },
});

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(Homepage)
);
