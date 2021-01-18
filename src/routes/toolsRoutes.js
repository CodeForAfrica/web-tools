import React from 'react';
import Route from 'react-router/lib/Route';
import IndexRedirect from 'react-router/lib/IndexRedirect';
import ToolsApp from '../components/tools/ToolsApp';
import ToolsHomeContainer from '../components/tools/ToolsHomeContainer';
import systemRoutes from './systemRoutes';

import MediaPage from '../components/tools/media/Homepage';
import PrivacyPolicyContainer from '../components/tools/policy/Homepage';
import TermsOfUseContainer from '../components/tools/terms/Homepage';

const toolsRoutes = (
  <Route path="/" component={ToolsApp}>

    <IndexRedirect to="/home" />

    <Route path="home" component={ToolsHomeContainer} />
    <Route path="media" component={MediaPage} />
    <Route path="privacy" component={PrivacyPolicyContainer} />
    <Route path="terms" component={TermsOfUseContainer} />

    {systemRoutes}

  </Route>
);

export default toolsRoutes;
