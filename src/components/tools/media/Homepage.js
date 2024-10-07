import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import ResourceList from './ResourceList';
import { BlockRenderer } from '../../../lib/cmsUtils/blockRenderer';
import { APP_TOOLS } from '../../../config';
import { fetchPageContent } from '../../../actions/cmsActions';


const Homepage = ({ pageReducer }) => {
  const pageData = {};
  /* const { route } = props;
  console.log(route.path); */
  useEffect(() => {
    pageReducer(APP_TOOLS, 'media-data');
  }, [pageReducer]);


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
  pageReducer: PropTypes.func,
};

const mapStateToProps = (state) => ({
 //  pages: state.cms.pageReducer.pages,
});

const mapDispatchToProps = (dispatch) => ({
    pageReducer: (appName, pageName) => { dispatch(fetchPageContent(appName, pageName)); },
});

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(Homepage)
);
