import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import Link from 'react-router/lib/Link';
import { push } from 'react-router-redux';
import { fetchSourceFeeds, scrapeSourceFeeds, fetchSourceDetails } from '../../../actions/sourceActions';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import MediaSourceIcon from '../../common/icons/MediaSourceIcon';
import SourceFeedTable from '../SourceFeedTable';
import messages from '../../../resources/messages';
import { DownloadButton, AddButton } from '../../common/IconButton';
import AppButton from '../../common/AppButton';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_MEDIA_EDIT } from '../../../lib/auth';
import { updateFeedback } from '../../../actions/appActions';
import { SOURCE_SCRAPE_STATE_QUEUED, SOURCE_SCRAPE_STATE_RUNNING } from '../../../reducers/sources/sources/selected/sourceDetails';
import PageTitle from '../../common/PageTitle';

const localMessages = {
  pageTitle: { id: 'source.feeds.pageTitle', defaultMessage: 'Feeds' },
  title: { id: 'source.feeds.title', defaultMessage: '{name} | Source Feeds | CivicSignal' },
  sourceFeedsTitle: { id: 'source.details.feeds.title', defaultMessage: '{name}: Feeds' },
  add: { id: 'source.deatils.feeds.add', defaultMessage: 'Add A Feed' },
};

class SourceFeedContainer extends React.Component {
  downloadCsv = () => {
    const { sourceId } = this.props;
    const url = `/api/sources/${sourceId}/feeds/feeds.csv`;
    window.location = url;
  }

  render() {
    const { sourceId, sourceName, feeds, scrapeFeeds, pushToUrl } = this.props;
    const { formatMessage } = this.props.intl;
    const content = null;
    if (feeds === undefined) {
      return (
        <div>
          { content }
        </div>
      );
    }
    return (
      <Grid className="details source-details">
        <PageTitle value={[localMessages.pageTitle, sourceName]} />
        <Row>
          <Col lg={11} xs={11}>
            <h1>
              <MediaSourceIcon height={32} />
              <Link to={`/sources/${sourceId}`}>
                <FormattedMessage {...localMessages.sourceFeedsTitle} values={{ name: sourceName }} />
              </Link>
            </h1>
            <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
              <AppButton
                className="source-scrape-feeds-button"
                label={formatMessage(messages.scrapeForFeeds)}
                color="primary"
                onClick={scrapeFeeds}
              />
            </Permissioned>
          </Col>
          <Col lg={1} xs={1}>
            <div className="actions" style={{ marginTop: 40 }}>
              <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
                <AddButton
                  tooltip={formatMessage(localMessages.add)}
                  onClick={() => { pushToUrl(`/sources/${sourceId}/feeds/create`); }}
                />
              </Permissioned>
              <DownloadButton tooltip={formatMessage(messages.download)} onClick={this.downloadCsv} />
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <SourceFeedTable feeds={feeds} />
          </Col>
        </Row>
      </Grid>
    );
  }
}

SourceFeedContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from dispatch
  scrapeFeeds: PropTypes.func.isRequired,
  pushToUrl: PropTypes.func.isRequired,
  // from context
  params: PropTypes.object.isRequired, // params from router
  // from state
  fetchStatus: PropTypes.string.isRequired,
  sourceId: PropTypes.number.isRequired,
  sourceName: PropTypes.string.isRequired,
  feeds: PropTypes.array,
  feedcount: PropTypes.number,
};

const mapStateToProps = (state, ownProps) => ({
  sourceId: parseInt(ownProps.params.sourceId, 10),
  sourceName: state.sources.sources.selected.sourceDetails.name,
  fetchStatus: state.sources.sources.selected.feed.feeds.fetchStatus,
  feeds: state.sources.sources.selected.feed.feeds.list,
  feedcount: state.sources.sources.selected.feed.feeds.count,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  pushToUrl: url => dispatch(push(url)),
  scrapeFeeds: () => {
    dispatch(scrapeSourceFeeds(ownProps.params.sourceId))
      .then((results) => {
        if ((results.job_state.state === SOURCE_SCRAPE_STATE_QUEUED)
          || (results.job_state.state === SOURCE_SCRAPE_STATE_RUNNING)) {
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(messages.sourceScraping) }));
          // update the source so the user sees the new scrape status
          dispatch(fetchSourceDetails(ownProps.params.sourceId))
            .then(() => dispatch(push(`/sources/${ownProps.params.sourceId}`)));
        } else {
          dispatch(updateFeedback({ classes: 'error-notice', open: true, message: ownProps.intl.formatMessage(messages.sourceScrapeFailed) }));
        }
      });
  },
});

const fetchAsyncData = (dispatch, { sourceId }) => dispatch(fetchSourceFeeds(sourceId));

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData, ['sourceId'])(
      SourceFeedContainer
    )
  )
);
