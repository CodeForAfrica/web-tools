import React from 'react';
import Route from 'react-router/lib/Route';
import IndexRedirect from 'react-router/lib/IndexRedirect';
import ToolsApp from '../components/tools/ToolsApp';
import ToolsHomeContainer from '../components/tools/ToolsHomeContainer';
import MediaPage from '../components/tools/media/Homepage';
import systemRoutes from './systemRoutes';

const toolsRoutes = (
  <Route path="/" component={ToolsApp}>

    <IndexRedirect to="/home" />

    <Route path="home" component={ToolsHomeContainer} />
    <Route path="media" component={MediaPage} />

    {systemRoutes}

  </Route>
);

export default toolsRoutes;
