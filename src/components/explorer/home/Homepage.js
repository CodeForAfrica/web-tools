import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { schemeCategory10 } from 'd3';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import DataCard from '../../common/DataCard';
import LoginForm from '../../user/LoginForm';
import SearchForm from './SearchForm';
import { getDateRange, solrFormat, PAST_MONTH } from '../../../lib/dateUtil';
import { autoMagicQueryLabel, serializeQueriesForUrl } from '../../../lib/explorerUtil';
import { emptyString } from '../../../lib/formValidators';
import ExplorerMarketingFeatureList from './ExplorerMarketingFeatureList';
import SystemStatsContainer from '../../common/statbar/SystemStatsContainer';
import messages from '../../../resources/messages';
import Masthead from '../../common/header/Masthead';
import { PERMISSION_LOGGED_IN } from '../../../lib/auth';
import Permissioned from '../../common/Permissioned';

const localMessages = {
  title: { id: 'explorer.intro.title', defaultMessage: 'Explorer' },
  subtitle: { id: 'explorer.intro.subtitle', defaultMessage: 'Explore Online News with Media Cloud' },
  description: { id: 'explorer.intro.description', defaultMessage: 'Use the MediaCloud Explorer to search half a billion stories from more than 50,000 sources including online news and blogs. MediaCloud can help you track shifts in media attention, identify competing media narratives, compare coverage in different media sectors and much more.' },
  loginTitle: { id: 'explorer.intro.login.title', defaultMessage: 'Have an Account? Login Now' },
};

const Homepage = ({ isLoggedIn, onKeywordSearch, storyCount, defaultCollectionTag }) => (
  <div className="homepage">
    <Masthead
      nameMsg={messages.explorerToolName}
      descriptionMsg={messages.explorerToolDescription}
      link="https://docs.google.com/forms/d/e/1FAIpQLSdkfLU2yi2S1_7D27Z0I1TumkWy5brlam809Od9cc6CnXGA-A/viewform"
    />
    <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
      <div className="search-section">
        <Grid>
          <Row>
            <Col lg={12}>
              <SearchForm onSearch={val => onKeywordSearch(val, defaultCollectionTag)} storyCount={storyCount} />
            </Col>
          </Row>
        </Grid>
      </div>
    </Permissioned>
    { !isLoggedIn && (
      <Grid>
        <Row>
          <Col lg={1} />
          <Col lg={5}>
            <h1><FormattedMessage {...localMessages.subtitle} /></h1>
            <p><FormattedMessage {...localMessages.description} /></p>
          </Col>
          <Col lg={1} />
          <Col lg={4}>
            <DataCard leftBorder>
              <h2><FormattedMessage {...localMessages.loginTitle} /></h2>
              <LoginForm />
            </DataCard>
          </Col>
        </Row>
      </Grid>
    )}
    <ExplorerMarketingFeatureList />
    <Grid>
      <SystemStatsContainer />
    </Grid>
  </div>
);

Homepage.propTypes = {
  intl: PropTypes.object.isRequired,
  // from context
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired, // params from router
  onKeywordSearch: PropTypes.func.isRequired,
  // from state
  isLoggedIn: PropTypes.bool.isRequired,
  storyCount: PropTypes.number,
  defaultCollectionTag: PropTypes.number.isRequired,
};

const mapStateToProps = state => ({
  isLoggedIn: state.user.isLoggedIn,
  storyCount: state.system.stats.stats.total_stories,
  defaultCollectionTag: state.system.staticTags.tags.defaultCollectionTag,
});

const mapDispatchToProps = dispatch => ({
  onKeywordSearch: (values, defaultCollectionTag) => {
    const keyword = emptyString(values.keyword) ? '' : values.keyword;
    const defaultDates = getDateRange(PAST_MONTH);
    const queries = [{
      q: keyword,
      startDate: solrFormat(defaultDates.start),
      endDate: solrFormat(defaultDates.end),
      color: schemeCategory10[0],
      collections: [defaultCollectionTag],
      sources: [],
    }];
    queries[0].label = autoMagicQueryLabel(queries[0]);
    dispatch(push(`/queries/search?qs=${serializeQueriesForUrl(queries)}&auto=true`));
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    Homepage
  )
);
