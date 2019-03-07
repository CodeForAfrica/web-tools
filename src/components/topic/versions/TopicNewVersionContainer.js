import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import PageTitle from '../../common/PageTitle';
import AppButton from '../../common/AppButton';
import BackLinkingControlBar from '../BackLinkingControlBar';
import { filteredLinkTo } from '../../util/location';
import messages from '../../../resources/messages';

const localMessages = {
  description: { id: 'topics.adminList.title', defaultMessage: 'To make changes to a Topic, you must create a new version. Pick what kind of change you want to make and then follows prompts to build a new version.' },
  createNewVersion: { id: 'topics.createNewVersion', defaultMessage: 'Change Seed Query' },
  createNewVersionDesc: { id: 'topics.createNewVersion.desc', defaultMessage: 'Change the search terms, dates, or media sources and collections. Once you save your changes, we start building a new version with stories that match your new seed query and follow new links to discover more stories.' },
  addNewSubtopics: { id: 'topics.addNewSubtopics', defaultMessage: 'Add New Subtopics' },
  addNewSubtopicsDesc: { id: 'topics.addNewSubtopics.desc', defaultMessage: 'Slice and dice your topic into subtopics to support comparative analysis. You can create subtopics with a growing list of techniques; allowing you to group stories by simple boolean queries, the country of focus, the themes included, and more.' },
};

const TopicNewVersionContainer = props => (
  <div className="topic-container">
    <BackLinkingControlBar message={messages.backToTopic} linkTo={`/topics/${props.topicId}/summary`} />
    <Grid>
      <PageTitle value={localMessages.title} />
      <FormattedMessage {...localMessages.description} />
      <Row>
        <Col lg={6}>
          <h2><FormattedMessage {...localMessages.createNewVersion} /></h2>
          <FormattedMessage {...localMessages.createNewVersionDesc} />
          <AppButton
            label={props.intl.formatMessage(localMessages.createNewVersion)}
            onClick={() => props.goToUrl(`/topics/${props.topicId}/update`, props.filters)}
            primary
          />
        </Col>
        <Col lg={6}>
          <h2><FormattedMessage {...localMessages.addNewSubtopics} /></h2>
          <FormattedMessage {...localMessages.addNewSubtopicsDesc} />
          <AppButton
            label={props.intl.formatMessage(localMessages.addNewSubtopics)}
            onClick={() => props.goToUrl(`/topics/${props.topicId}/snapshot/foci`, props.filters)}
            primary
          />
        </Col>
      </Row>
    </Grid>
  </div>
);

TopicNewVersionContainer.propTypes = {
  // from state
  filters: PropTypes.object,
  topicId: PropTypes.number,
  formatMessage: PropTypes.object,
  // from context
  intl: PropTypes.object.isRequired,
  goToUrl: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  filters: state.topics.selected.filters,
  topicInfo: state.topics.selected.info,
  topicId: parseInt(ownProps.params.topicId, 10),
});

const mapDispatchToProps = dispatch => ({
  goToUrl: (url, filters) => {
    dispatch(push(filteredLinkTo(url, filters)));
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    TopicNewVersionContainer
  )
);