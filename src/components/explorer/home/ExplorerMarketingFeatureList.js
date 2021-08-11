import React from 'react';
import MarketingFeatureItem from '../../common/MarketingFeatureItem';

const localMessages = {

  globalCollectionsTitle: { id: 'marketing.globalCollections.title', defaultMessage: 'Search with Global Coverage' },
  globalCollectionsDescription: { id: 'marketing.globalCollections.description', defaultMessage: '<p>You can search our growing list of individual or collections of top media sources in Africa with CivicSignal MediaCloud. Our search function offers various levels of support for English, French and Arabic. Get an overview of what content we have in our database with our <a href="https://sources.civicsignal.africa/">Source Manager tool</a></p>' },

  attentionTitle: { id: 'marketing.attention.title', defaultMessage: 'Track Attention Over Time' },
  attentionDescription: { id: 'marketing.attention.description', defaultMessage: '<p>MediaCloud shows you attention to an issue over time to help you understand how much it is covered. Our data can reveal key events that cause spikes in coverage and conversation. Plateaus can reveal stable, "normal", levels of attention to compare against. You can download all our charts and the underlying aggregated data.</p>' },

  framingTitle: { id: 'marketing.framing.title', defaultMessage: 'Identify How an Issue is Talked About' },
  framingDescription: { id: 'marketing.framing.description', defaultMessage: '<p>Which words do people use to talk about an issue? Media Cloud can help you to pinpoint differing media narratives using word clouds, word counts, bri-grams, word trees, word embeddings, and more.</p>' },

  mapTitle: { id: 'marketing.map.title', defaultMessage: 'Map Geographic Coverage' },
  mapDescription: { id: 'marketing.map.description', defaultMessage: '<p>We geocode all our stories to identify the countries and states they are about. Media Cloud\'s maps can help you narrow in on the places that talk about your issue the most, or identify issue "deserts" where it isn\'t talked about at all.</p>' },

};

const ExplorerMarketingFeatureList = () => (
  <div className="marketing-feature-list">
    <MarketingFeatureItem
      titleMsg={localMessages.globalCollectionsTitle}
      contentMsg={localMessages.globalCollectionsDescription}
      imageName="global-collections-2x.png"
      imageOnLeft
    />
    <MarketingFeatureItem
      titleMsg={localMessages.attentionTitle}
      contentMsg={localMessages.attentionDescription}
      imageName="attention-2x.png"
    />
    <MarketingFeatureItem
      titleMsg={localMessages.framingTitle}
      contentMsg={localMessages.framingDescription}
      imageName="framing-2x.png"
      imageOnLeft
    />
    <MarketingFeatureItem
      titleMsg={localMessages.mapTitle}
      contentMsg={localMessages.mapDescription}
      imageName="mapping-2x.png"
    />
  </div>
);

export default ExplorerMarketingFeatureList;
