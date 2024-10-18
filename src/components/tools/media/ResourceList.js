import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ResourceFeatureItem from '../../common/ResourceFeatureItem';
import { fetchCollection } from '../../../actions/cmsActions';
import serializeSlateToHtml from '../../../lib/cmsUtils/slateToHTMLSerializer';
import { APP_TOOLS } from '../../../config';


const ExplorerMarketingFeatureList = ({ getCollections, mediaData }) => {
  useEffect(() => {
    getCollections(APP_TOOLS, 'media-data');
  }, [getCollections]);

  let localMessages;

  if (mediaData && mediaData?.docs) {
    localMessages = mediaData.docs.map(resource => {
      const mediaDataId = `${resource.title.replace(/\s+/g, '')}:${resource.id}`;
      return {
        id: mediaDataId,
        title: { id: `${mediaDataId}.title`, defaultMessage: resource.title },
        description: { id: `${mediaDataId}.description`, defaultMessage: serializeSlateToHtml(resource.description) },
        imageURL: resource.mediaDataImage.url,
      };
    });
  }

  return (
    <div className="resources-feature-list">
      {
       localMessages
        && localMessages.map((localMessage, index) => (
          <ResourceFeatureItem
            key={localMessage.id}
            titleMsg={localMessage.title}
            contentMsg={localMessage.description}
            imageURL={localMessage.imageURL}
            imageOnLeft={index % 2 !== 0}
          />
        ))
      }
    </div>
  );
};

ExplorerMarketingFeatureList.propTypes = {
  getCollections: PropTypes.func,
  mediaData: PropTypes.any,
};

const mapStateToProps = (state) => ({
  mediaData: state.cms.collections.content['media-data'] || {},
});

const mapDispatchToProps = (dispatch) => ({
  getCollections: (appName, collectionName) => { dispatch(fetchCollection(appName, collectionName)); },
});

export default connect(mapStateToProps, mapDispatchToProps)(ExplorerMarketingFeatureList);
