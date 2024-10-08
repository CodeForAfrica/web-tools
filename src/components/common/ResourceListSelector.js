import React from 'react';
import PropTypes from 'prop-types';
import ResourceList from '../tools/media/ResourceList';

const resourceListRegistry = {
    media_data: ResourceList,
};

const ResourceListSelector = ({ resourceListType }) => {
    const SelectedResourceList = resourceListRegistry[resourceListType];
    if (!SelectedResourceList) {
        return null;
    }
    return <SelectedResourceList />;
};

ResourceListSelector.propTypes = {
    resourceListType: PropTypes.string.isRequired,
};

export default ResourceListSelector;
