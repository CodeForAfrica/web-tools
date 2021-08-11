import React from 'react';
import MarketingFeatureItem from '../../common/MarketingFeatureItem';

const localMessages = {

  globalCollectionsTitle: { id: 'marketing.globalCollections.title', defaultMessage: 'Global Coverage' },
  globalCollectionsDescription: { id: 'marketing.globalCollections.description', defaultMessage: '<p>CivicSignal MediaCloud includes a database of media sources from over 21 African countries, and growing. We have included various levels of support for English, French and Arabic. Use the Source Manager to explore our collections.</p>' },

  liveSourcesTitle: { id: 'marketing.liveSources.title', defaultMessage: 'Updating Data from Sources' },
  liveSourcesDescription: { id: 'marketing.liveSources.description', defaultMessage: '<p>MediaCloud imports stories from many of our sources daily (via their RSS feeds). Stories are processed into sentences and words, to discover countries they discuss, and extract people and places they mention. You can download all of this metadata for any story.</p>' },

  metadataTitle: { id: 'marketing.metadata.title', defaultMessage: 'Rich Information About Sources' },
  metadataDescription: { id: 'marketing.metadata.description', defaultMessage: '<p>MediaCloud supports grouping media sources by information about them. Sources can be categorised by the country and state of publication, type, language, or the country they write about most.</p>' },

};

const SourcesMarketingFeatureList = () => (
  <div className="marketing-feature-list">
    <MarketingFeatureItem
      titleMsg={localMessages.globalCollectionsTitle}
      contentMsg={localMessages.globalCollectionsDescription}
      imageName="global-collections-2x.png"
      imageOnLeft
    />
    <MarketingFeatureItem
      titleMsg={localMessages.liveSourcesTitle}
      contentMsg={localMessages.liveSourcesDescription}
    />
    <MarketingFeatureItem
      titleMsg={localMessages.metadataTitle}
      contentMsg={localMessages.metadataDescription}
      imageName="metadata-2x.png"
      imageOnLeft
    />
  </div>
);

export default SourcesMarketingFeatureList;
