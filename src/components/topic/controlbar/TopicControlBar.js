import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { FormattedMessage, injectIntl } from 'react-intl';
import LinkWithFilters from '../LinkWithFilters';
import { HomeButton, EditButton } from '../../common/IconButton';
import TabbedChip from '../../common/TabbedChip';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_TOPIC_WRITE, PERMISSION_TOPIC_ADMIN } from '../../../lib/auth';
import { TOPIC_SNAPSHOT_STATE_COMPLETED, TOPIC_SNAPSHOT_STATE_QUEUED, TOPIC_SNAPSHOT_STATE_RUNNING,
  TOPIC_SNAPSHOT_STATE_ERROR, TOPIC_SNAPSHOT_STATE_CREATED_NOT_QUEUED } from '../../../reducers/topics/selected/snapshots';

const localMessages = {
  permissions: { id: 'topic.changePermissions', defaultMessage: 'Permissions' },
  changePermissionsDetails: { id: 'topic.changePermissions.details', defaultMessage: 'Control who else can see and/or change this topic' },
  settings: { id: 'topic.changeSettings', defaultMessage: 'Settings' },
  changeSettingsDetails: { id: 'topic.changeSettings.details', defaultMessage: 'Edit this topic\'s configuration and visibility' },
  versionList: { id: 'topic.changeSettings', defaultMessage: 'Versions' },
  viewVersionLists: { id: 'topic.changeSettings', defaultMessage: 'View Versions' },
  filterTopic: { id: 'topic.filter', defaultMessage: 'Filter this Topic' },
  startedSpider: { id: 'topic.startedSpider', defaultMessage: 'Started a new spidering job for this topic' },
  summaryMessage: { id: 'snapshot.required', defaultMessage: 'You have made some changes that you can only see if you generate a new Snapshot. <a href="{url}">Generate one now</a>.' },
  topicHomepage: { id: 'topic.homepage', defaultMessage: 'Summary' },
  jumpToExplorer: { id: 'topic.controlBar.jumpToExplorer', defaultMessage: 'Query on Explorer' },

  latestNeedsAttention: { id: 'topic.version.latestNeedsAttention', defaultMessage: 'needs attention' },
  latestRunning: { id: 'topic.version.latestNeedsAttention', defaultMessage: 'running' },
  newerData: { id: 'topic.version.latestNeedsAttention', defaultMessage: 'newer data' },
};

const snapshotStateIs = (latestSnapshot, topic, states) => {
  if (latestSnapshot) {
    return states.includes(latestSnapshot.state);
  }
  return states.includes(topic.state);
};

const TopicControlBar = ({ sideBarContent, topic, setupJumpToExplorer, intl, selectedSnapshot, latestSnapshot }) => (
  <div className="controlbar controlbar-topic">
    <div className="main">
      <Grid>
        <Row>
          <Col lg={8} className="control-bar-settings left">
            <div className="controlbar-item">
              <LinkWithFilters to={`/topics/${topic.topics_id}/summary`}>
                <HomeButton />
                <b><FormattedMessage {...localMessages.topicHomepage} /></b>
              </LinkWithFilters>
            </div>
            <Permissioned onlyTopic={PERMISSION_TOPIC_WRITE}>
              <div className="controlbar-item">
                <LinkWithFilters to={`/topics/${topic.topics_id}/settings`}>
                  <EditButton
                    label={intl.formatMessage(localMessages.settings)}
                    description={intl.formatMessage(localMessages.changeSettingsDetails)}
                    id="modify-topic-settings"
                  />
                  <b><FormattedMessage {...localMessages.settings} /></b>
                </LinkWithFilters>
              </div>
            </Permissioned>
            <Permissioned onlyTopic={PERMISSION_TOPIC_ADMIN}>
              <div className="controlbar-item">
                <LinkWithFilters to={`/topics/${topic.topics_id}/permissions`} className="permissions">
                  <EditButton
                    label={intl.formatMessage(localMessages.permissions)}
                    description={intl.formatMessage(localMessages.changePermissionsDetails)}
                    id="modify-topic-permissions"
                  />
                  <b><FormattedMessage {...localMessages.permissions} /></b>
                </LinkWithFilters>
              </div>
            </Permissioned>
            <Permissioned onlyTopic={PERMISSION_TOPIC_ADMIN}>
              <div className="controlbar-item">
                <LinkWithFilters to={`/topics/${topic.topics_id}/versions`}>
                  <EditButton
                    label={intl.formatMessage(localMessages.versionList)}
                    description={intl.formatMessage(localMessages.viewVersionLists)}
                    id="modify-topic-permissions"
                  />
                  <b><FormattedMessage {...localMessages.versionList} /></b>
                  {snapshotStateIs(latestSnapshot, topic, [TOPIC_SNAPSHOT_STATE_ERROR, TOPIC_SNAPSHOT_STATE_CREATED_NOT_QUEUED]) && (
                    <TabbedChip error message={localMessages.latestNeedsAttention} />
                  )}
                  {snapshotStateIs(latestSnapshot, topic, [TOPIC_SNAPSHOT_STATE_QUEUED, TOPIC_SNAPSHOT_STATE_RUNNING]) && (
                    <TabbedChip message={localMessages.latestRunning} />
                  )}
                  {(selectedSnapshot)
                    && (selectedSnapshot.snapshots_id !== latestSnapshot.snapshots_id)
                    && snapshotStateIs(latestSnapshot, topic, [TOPIC_SNAPSHOT_STATE_COMPLETED])
                    && (<TabbedChip warning message={localMessages.newerData} />)
                  }
                </LinkWithFilters>
              </div>
            </Permissioned>
            { setupJumpToExplorer && <div className="controlbar-item">{setupJumpToExplorer}</div> }
          </Col>
          <Col lg={4}>
            {sideBarContent}
          </Col>
        </Row>
      </Grid>
    </div>
  </div>
);

TopicControlBar.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  location: PropTypes.object,
  // from parent
  sideBarContent: PropTypes.node,
  setupJumpToExplorer: PropTypes.func,
  // from state
  topic: PropTypes.object,
  filters: PropTypes.object.isRequired,
  selectedSnapshot: PropTypes.object,
  latestSnapshot: PropTypes.object,
};

const mapStateToProps = state => ({
  filters: state.topics.selected.filters,
  topic: state.topics.selected.info,
  latestSnapshot: state.topics.selected.snapshots.latest,
  selectedSnapshot: state.topics.selected.snapshots.selected,
});

export default
injectIntl(
  connect(mapStateToProps)(
    TopicControlBar
  )
);