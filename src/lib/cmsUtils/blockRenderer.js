import React from 'react';
import PropTypes from 'prop-types';
import PageHeader from '../../components/common/header/PageHeader';
import ResourceListSelector from '../../components/common/ResourceListSelector';

const blockRegistry = {
  'webtools-page-header': PageHeader,
  'webtools-resource-list': ResourceListSelector,
};


export const BlockRenderer = ({ block }) => {
  const BlockComponent = blockRegistry[block.blockType];
  if (!BlockComponent) {
    return null;
  }
  return <BlockComponent {...block} />;
};

BlockRenderer.propTypes = {
  block: PropTypes.object.isRequired,
};

export const parsePageContent = (data) => {
  const doc = data?.docs[0];
  return { fullTitle: doc?.fullTitle, slug: doc?.slug, blocks: doc?.blocks };
};
