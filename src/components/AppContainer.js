import PropTypes from "prop-types";
import React from "react";
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";
// import { hot } from 'react-hot-loader/root';
import Snackbar from "@material-ui/core/Snackbar";
import intl from "intl"; // eslint-disable-line
import intlEn from "intl/locale-data/jsonp/en.js"; // eslint-disable-line
import { Grid, Row, Col } from "react-flexbox-grid/lib";
import NavToolbar from "./common/header/NavToolbar";
import ErrorBoundary from "./common/ErrorBoundary";
import messages from "../resources/messages";
import { getVersion } from "../config";
import { ErrorNotice, WarningNotice } from "./common/Notice";
import { assetUrl } from "../lib/assetUtil";
import AppNoticesContainer from "./common/header/AppNoticesContainer";
import {
  Twitter,
  Facebook,
  Instagram,
  LinkedIn,
  GitHub,
} from "@material-ui/icons";

const localMessages = {
  privacyPolicy: {
    id: "app.privacyPolicy",
    defaultMessage: "Read our privacy policy.",
  },
  maintenance: {
    id: "app.maintenance",
    defaultMessage:
      "Sorry, we have taken our system down right now for maintenance",
  },
  license: {
    id: "app.footer.license",
    defaultMessage:
      "This site is an openAFRICA project of Code for Africa. All content is released under a Creative Commons 4 Attribution Licence. Reuse it to help empower your own community. The code is available on GitHub and data is available on openAFRICA.",
  },
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
              <br />
              <br />
              <FormattedMessage {...localMessages.maintenance} />
              <br />
              <br />
              <img
                alt="under-constrction"
                src={assetUrl("/static/img/under-construction.gif")}
              />
              <br />
              <br />
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
            {document.appConfig.systemWarning && (
              <div style={{ textAlign: "center" }}>
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
                    src={assetUrl("/static/img/cfa.svg")}
                    height={80}
                  />
                </a>
              </Col>
            </Row>
            <Row>
              <Col lg={8}>
                <p>
                  <span>
                    <a href={messages.cfa.url}>
                      <FormattedMessage {...messages.cfa} />{" "}
                    </a>
                     (CfA) is the continent’s largest network of indigenous
                    African <b>civic technology</b> and investigative 
                    <b>data journalism</b> laboratories that build 
                    <b>digital democracy</b> solutions that are intended to give
                    citizens unfettered access to <b>actionable information</b>
                     that empowers them to make <b>informed decisions</b> and
                    that strengthen <b>civic engagement</b> for improved public
                    governance and accountability.
                  </span>
                  <span>
                    CfA’s staff in 18 African countries serve as local 
                    <b>ecosystem catalysts</b>, seed-funding pioneering ideas
                    through our {" "}
                    <a href={messages.innovateAfrica.url}>
                      <FormattedMessage {...messages.innovateAfrica} />
                    </a>
                    , as well curating infrastructure such as the continent’s
                    largest open data portal, {" "}
                    <a href={messages.openAfrica.url}>
                      <FormattedMessage {...messages.openAfrica} />
                    </a>
                    , plus Africa’s largest open source civic software portal, {" "}
                    <a href={messages.commonsAfrica.url}>
                      <FormattedMessage {...messages.commonsAfrica} />
                    </a>
                    , and the continent’s largest repository of investigative
                    document-based evidence, 
                    <a href={messages.sourceAfrica.url}>
                      <FormattedMessage {...messages.sourceAfrica} />
                    </a>
                    , along with smaller resources such the 
                    <a href={messages.goToVote.url}>
                      <FormattedMessage {...messages.goToVote} />
                    </a>
                     election toolkit or 
                    <a href={messages.afriLeaks.url}>
                      <FormattedMessage {...messages.afriLeaks} />
                    </a>
                     encrypted whistleblower portal.
                  </span>
                  <span>
                    CfA’s labs also incubate or accelerate a series of
                    trail-blazing initiatives, including the {" "}
                    <a href={messages.pesaCheck.url}>
                      <FormattedMessage {...messages.pesaCheck} />
                    </a>
                     fact-checking initiative (which is now in 12 countries),
                    the continental {" "}
                    <a href={messages.africanDrone.url}>
                      <FormattedMessage {...messages.africanDrone} />
                    </a>
                     civic drone network, the
                    <a href={messages.sensorsAfrica.url}>
                      <FormattedMessage {...messages.sensorsAfrica} /> 
                    </a>
                    citizen science movement, and the 
                    <a href={messages.ancir.url}>
                      <FormattedMessage {...messages.ancir} />
                    </a>
                     (ANCIR) that spearheads forensic journalism across the
                    continent.
                  </span>
                  <span>
                    CfA is a <b>non-profit organisation</b>, registered as a
                    public benefit organisation in Kenya, Nigeria and South
                    Africa.
                  </span>
                </p>
              </Col>
            </Row>
          </Grid>
          <div className="secondary-footer">
            <Grid>
              <Row className="secondary-footer-row">
                
                <Col className="secondary-footer-col footer-social-col" lg={12}>
                  <a href="#">
                    <Twitter className="footer-social"></Twitter>
                  </a>
                  <a href="#">
                    <Instagram className="footer-social"></Instagram>
                  </a>
                  <a href="#">
                    <Facebook className="footer-social"></Facebook>{" "}
                  </a>
                  <a href="#">
                    <LinkedIn className="footer-social"></LinkedIn>{" "}
                  </a>
                  <a href="#">
                    <GitHub className="footer-social"></GitHub>
                  </a>
                </Col>
              </Row>
            </Grid>
          </div>
        </footer>
        <Snackbar
          className={feedback.classes ? feedback.classes : "info_notice"}
          open={this.state.open}
          onClose={this.handleClose}
          message={feedback.message}
          action={feedback.action}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
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

const mapStateToProps = (state) => ({
  feedback: state.app.feedback,
});

export default // hot(
injectIntl(connect(mapStateToProps)(AppContainer));
