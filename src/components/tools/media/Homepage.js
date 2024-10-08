import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { BlockRenderer } from '../../../lib/cmsUtils/blockRenderer';
import { APP_TOOLS } from '../../../config';
import { fetchPageContent } from '../../../actions/cmsActions';
import CMSError from '../../common/CMSError';
import { addNotice } from '../../../actions/appActions';
import { LEVEL_ERROR } from '../../common/Notice';


const Homepage = (props) => {
  const { getPageContent, route, pageData, fetchStatus } = props;

  useEffect(() => {
    getPageContent(APP_TOOLS, route?.path);
  }, [getPageContent]);

  if (fetchStatus === 'FETCH_FAILED') {
    return (
      <CMSError message="Failed to fetch content, please refresh your page" />
    );
  }

  return (
    <div className="homepage">
      {
      pageData?.blocks && pageData?.blocks.map((block, index) => (
        <div key={index} className="mb-6">
          <BlockRenderer
            block={block}
          />
        </div>
    ))
    }
    </div>
  );
};

Homepage.propTypes = {
  intl: PropTypes.object.isRequired,
  // from context
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired, // params from router
  route: PropTypes.object.isRequired,
  getPageContent: PropTypes.func,
  // from state
  pageData: PropTypes.object,
  fetchStatus: PropTypes.string,
};

const mapStateToProps = (state) => ({
  pageData: state.cms.pages.content.media,
  fetchStatus: state.cms.pages.fetchStatus,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    getPageContent: (appName, pageName) => { dispatch(fetchPageContent(appName, pageName)); },
    displayErrorMessage: (message) => {
           dispatch(addNotice({ htmlMessage: ownProps.intl.formatMessage(message), level: LEVEL_ERROR }));
  },
});

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(Homepage)
);
