import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ResourceFeatureItem from '../../common/ResourceFeatureItem';
import { fetchCollection } from '../../../actions/cmsActions';

const ExplorerMarketingFeatureList = ({ getCollections, resources }) => {
  useEffect(() => {
    getCollections('media-data');
  }, [getCollections]);

  const docs = resources?.docs || []; // Fallback to an empty array if resources or docs are undefined
  return (
    <div className="resources-feature-list">
      {docs.length > 0 ? (
        docs.map((resource, index) => (
          <ResourceFeatureItem
            key={resource.id}
            hasRichText
            titleMsg={{ id: resource.id, defaultMessage: resource.title }}
            contentMsg={resource.description}
            imageName={resource.mediaDataImage?.src}
            imageOnLeft={index % 2 !== 0}
          />
        ))
      )
        : null}
    </div>
  );
};

ExplorerMarketingFeatureList.propTypes = {
  getCollections: PropTypes.func,
  resources: PropTypes.any,
};

const mapStateToProps = (state) => ({
  resources: state.cms.collections.content['media-data'] || {},
});

const mapDispatchToProps = (dispatch) => ({
  getCollections: (collectionName) => { dispatch(fetchCollection(collectionName)); },
});

export default connect(mapStateToProps, mapDispatchToProps)(ExplorerMarketingFeatureList);
