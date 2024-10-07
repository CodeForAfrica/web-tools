import React, { useState, useEffect } from 'react';
import ResourceFeatureItem from '../../common/ResourceFeatureItem';
import { fetchCollections } from '../../../lib/cmsApi/rest';

const ExplorerMarketingFeatureList = () => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const content = await fetchCollections('media-data');
        setResources(content?.docs);
      } catch (err) {
        console.error(err);
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="resources-feature-list">
      {
      resources && resources.map((resource) => (
        <ResourceFeatureItem
          key={resource.id}
          hasRichText
          titleMsg={{ id: resource.id, defaultMessage: resource.title }}
          contentMsg={resource.description}
          imageName={resource.mediaDataImage?.src}
        />
    ))
    }
    </div>
);
};

export default ExplorerMarketingFeatureList;
