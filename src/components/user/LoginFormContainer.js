import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { FormattedMessage, injectIntl } from 'react-intl';
import LoginForm from './LoginForm';
import PageTitle from '../common/PageTitle';
import { fetchFormContent } from '../../actions/cmsActions';


class LoginContainer extends React.Component {
  componentDidMount() {
    this.props.fetchContent();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isLoggedIn) {
      this.context.router.push('/home');
    }
  }

  render() {
    const { isLoggedIn } = this.props.intl;
    const { content } = this.props;
    const localMessages = content?.title
    ? { loginTitle: { id: 'login.title', defaultMessage: content.title } }
    : null;
    const className = `logged-in-${isLoggedIn}`;
    return (localMessages ? (
      <>
        <Grid>
          <PageTitle value={localMessages.loginTitle} />
          <Row>
            <Col lg={12} className={className}>
              <h2><FormattedMessage {...localMessages.loginTitle} /></h2>
            </Col>
          </Row>
          <Row>
            <Col lg={4} className={className}>
              <LoginForm
                location={this.props.location}
                content={content}
              />
            </Col>
          </Row>
        </Grid>
      </>
    ) : null);
  }
}

LoginContainer.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
  location: PropTypes.object,
  fetchContent: PropTypes.func,
  content: PropTypes.object,
};

LoginContainer.contextTypes = {
  router: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  isLoggedIn: state.user.isLoggedIn,
  content: state.cms.forms.content?.login,
});

const mapDispatchToProps = (dispatch) => ({
  fetchContent: () => {
    dispatch(fetchFormContent('login'));
  },
});


export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    LoginContainer
  )
);
