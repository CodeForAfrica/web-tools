import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { FormattedMessage, injectIntl } from 'react-intl';
import messages from '../../resources/messages';
import { urlToExplorer, urlToTopicMapper, urlToSourceManager, urlToMediaData } from '../../lib/urlUtil';
import ToolDescription from './ToolDescription';
import Faq from './faq/ToolsFaq';
import LoginForm from '../user/LoginForm';
import DataCard from '../common/DataCard';
import { assetUrl } from '../../lib/assetUtil';
import PageTitle from '../common/PageTitle';

const localMessages = {
  title: { id: 'tools.civic.title', defaultMessage: 'Understanding Africa\'s' },
  intro: { id: 'tools.civic.subtitle', defaultMessage: 'Digital Democracies' },
  subtitle: { id: 'tools.civic.subtitle', defaultMessage: 'Digital Democracies' },
  loginTitle: { id: 'tools.home.login.title', defaultMessage: 'Login or Signup Now' },
};

const ToolsHomeContainer = (props) => {
  const { isLoggedIn } = props;
  const notLoggedInContent = (
    <Row>
      <Col lg={8}>
        <Faq />
      </Col>
      <Col lg={4}>
        <DataCard>
          <h2><FormattedMessage {...localMessages.loginTitle} /></h2>
          <LoginForm redirect="/" />
        </DataCard>
      </Col>
    </Row>
  );
  const loggedInContent = (
    <Row>
      <Col lg={12}>
        <Faq />
      </Col>
    </Row>
  );
  const content = (isLoggedIn) ? loggedInContent : notLoggedInContent;
  return (
    <div className="tools-home about-page">
      <PageTitle />
      <Grid>
        <Row className="tools-hero">
          <Col lg={12}>
            <h1><FormattedMessage {...localMessages.title} /> <br /> <FormattedMessage {...localMessages.subtitle} /></h1>
            <p className="intro">
              We give you <b>actionable insights</b> to help you navigate Africa’s <b>media ecosystem </b>and emerging <b>civic technology</b> sector. Our insights are based on analysis by human experts, using machine learning tools and ‘big data’ resources.
            </p>

          </Col>

        </Row>
        <Row>
          <Col lg={6}>
            <ToolDescription
              name={messages.explorerToolName}
              className="tool-explorer tools-card"
              description={messages.explorerToolDescription}
              screenshotUrl={assetUrl('/static/img/preview-explorer.png')}
              url={urlToExplorer('home')}
              buttonLabel={messages.learnMoreButton}
            />
          </Col>
          <Col lg={6}>
            <ToolDescription
              name={messages.topicsToolName}
              className="tool-topics tools-card"
              description={messages.topicsToolDescription}
              screenshotUrl={assetUrl('/static/img/preview-topics.png')}
              url={urlToTopicMapper('home')}
              buttonLabel={messages.learnMoreButton}
            />
          </Col>
          <Col lg={6}>
            <ToolDescription
              name={messages.sourcesToolName}
              className="tool-sources tools-card"
              description={messages.sourcesToolDescription}
              screenshotUrl={assetUrl('/static/img/preview-sources.png')}
              url={urlToSourceManager('home')}
              buttonLabel={messages.learnMoreButton}
            />
          </Col>
          <Col lg={6}>
            <ToolDescription
              name={messages.mediaDataToolName}
              className="media-data tools-card"
              description={messages.mediaDataToolDescription}
              screenshotUrl={assetUrl('/static/img/preview-sources.png')}
              url={urlToMediaData('media')}
              buttonLabel={messages.learnMoreButton}
            />
          </Col>
        </Row>
        { content }
      </Grid>
    </div>
 );
};

ToolsHomeContainer.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  isLoggedIn: state.user.isLoggedIn,
});

export default
injectIntl(
  connect(mapStateToProps)(
    ToolsHomeContainer
  )
);
