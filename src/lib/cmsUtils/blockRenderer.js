import React from 'react';
import PropTypes from 'prop-types';
import PageHeader from '../../components/common/header/PageHeader';

const blockRegistry = {
  'webtools-page-header': PageHeader,
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
