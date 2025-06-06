import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
// import { hot } from 'react-hot-loader/root';
import Snackbar from '@material-ui/core/Snackbar';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import {
  Twitter,
  Facebook,
  LinkedIn,
  GitHub,
} from '@material-ui/icons';
import NavToolbar from './common/header/NavToolbar';
import ErrorBoundary from './common/ErrorBoundary';
import messages from '../resources/messages';
import { ErrorNotice, WarningNotice } from './common/Notice';
import { assetUrl } from '../lib/assetUtil';
import AppNoticesContainer from './common/header/AppNoticesContainer';
import { fetchStaticTags } from '../actions/systemActions';
import withAsyncData from './common/hocs/AsyncDataContainer';

const localMessages = {
  privacyPolicy: { id: 'app.privacyPolicy', defaultMessage: 'Read our privacy policy.' },
  maintenance: { id: 'app.maintenance', defaultMessage: 'Sorry, we have taken our system down right now for maintenance' },
};

class AppContainer extends React.Component {
  state = {
    open: false,
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { feedback } = this.props;
    if (nextProps.feedback.message !== feedback.message) {
      this.setState({ open: true });
    }
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { children, feedback, name } = this.props;
    let content = children;
    if (document.appConfig.maintenanceMode === 1) {
      content = (
        <div className="maintenance">
          <Row center="lg">
            <ErrorNotice>
              <br /><br />
              <FormattedMessage {...localMessages.maintenance} />
              <br /><br />
              <img alt="under-constrction" src={assetUrl('/static/img/under-construction.gif')} />
              <br /><br />
            </ErrorNotice>
          </Row>
        </div>
      );
    }

    return (
      <div className={`app-container app-${name}`}>
        <AppNoticesContainer />
        <header>
          <NavToolbar />
        </header>
        <ErrorBoundary>
          <div id="content">
            { document.appConfig.systemWarning
              && (
              <div style={{ textAlign: 'center' }}>
                <WarningNotice>
                  {document.appConfig.systemWarning}
                </WarningNotice>
              </div>
)}
            {content}
          </div>
        </ErrorBoundary>
        <footer>
          <Grid className="primary-footer">
            <Row>
              <Col lg={8}>
                <a href={messages.cfa.url}>
                  <img
                    className="app-logo"
                    alt=""
                    src={assetUrl('/static/img/cfa.svg')}
                    height={80}
                  />
                </a>
              </Col>
            </Row>
            <Row>
              <Col lg={8}>
                <p>
                  <span>
                    CivicSignal is the research and analysis programme of{' '}
                    <a href={messages.cfa.url}>
                      <FormattedMessage {...messages.cfa} />
                    </a>,{' '}
                    the continent’s largest network of indigenous African
                    civic technology and investigative data journalism
                    laboratories.
                  </span>
                  <span>
                    CivicSignal’s data analysis is powered by MIT’s{' '}
                    <b>Media Cloud </b>platform, and research partners include
                    the <b> Reuters Institute for Journalism </b> and the{' '}
                    <b>Global Disinformation Index</b> .
                  </span>
                  <span>
                    <a target="_blank" rel="noopener noreferrer" href={messages.join.url}>
                      <FormattedMessage {...messages.join} />{' '}
                    </a><br />
                    {/* <NewsLetterForm></NewsLetterForm> */}
                  </span>
                  <span>
                    Read Code for Africa’s {' '}
                    <a href={messages.privacyPolicy.url}>
                      <FormattedMessage {...messages.privacyPolicy} />{' '}
                    </a>{' '}
                    and {' '}
                    <a href={messages.terms.url}>
                      <FormattedMessage {...messages.terms} />{' '}
                    </a>
                  </span>
                </p>
              </Col>
            </Row>
          </Grid>
          <div className="secondary-footer">
            <Grid>
              <Row className="secondary-footer-row">
                <Col className="secondary-footer-col footer-social-col" lg={12}>
                  <a href="https://twitter.com/Code4Africa">
                    <Twitter className="footer-social" />
                  </a>
                  <a href="https://www.facebook.com/CodeForAfrica">
                    <Facebook className="footer-social" />{' '}
                  </a>
                  <a href="https://www.linkedin.com/company/3480952/admin">
                    <LinkedIn className="footer-social" />{' '}
                  </a>
                  <a href="https://github.com/codeforafrica">
                    <GitHub className="footer-social" />
                  </a>
                </Col>
              </Row>
            </Grid>
          </div>
        </footer>

        <Snackbar
          className={feedback.classes ? feedback.classes : 'info_notice'}
          open={this.state.open}
          onClose={this.handleClose}
          message={feedback.message}
          action={feedback.action}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={5000}
        />
      </div>
    );
  }
}

AppContainer.propTypes = {
  children: PropTypes.node,
  handleTouchTapLeftIconButton: PropTypes.func,
  intl: PropTypes.object.isRequired,
  // from state
  feedback: PropTypes.object.isRequired,
  // from parent
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  showLoginButton: PropTypes.bool,
};

AppContainer.contextTypes = {
  router: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.staticTags.fetchStatus,
  feedback: state.app.feedback,
});

const fetchAsyncData = (dispatch) => {
  dispatch(fetchStaticTags());
};

export default
// hot(
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData)(
      AppContainer
    )
  )
);
