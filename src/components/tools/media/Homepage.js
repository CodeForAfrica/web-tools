import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import ResourceList from './ResourceList';
import { getPageContent } from '../../../lib/cmsApi/rest';
import { parsePageContent, BlockRenderer } from '../../../lib/cmsUtils/blockRenderer';
import { APP_TOOLS } from '../../../config';


const Homepage = () => {
  const [pageData, setPageData] = useState({});

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const content = await getPageContent(APP_TOOLS, 'media-data');
        setPageData(parsePageContent(content));
      } catch (err) {
        console.error(err);
      }
    };

    fetchContent();
  }, []);


  return (
    <div className="homepage">
      {
      pageData.blocks && pageData.blocks.map((block, index) => (
        <div key={index} className="mb-6">
          <BlockRenderer
            block={block}
          />
        </div>
    ))
    }
      <ResourceList />
    </div>
  );
};

Homepage.propTypes = {
  intl: PropTypes.object.isRequired,
  // from context
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired, // params from router
  // from state
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(Homepage)
);
