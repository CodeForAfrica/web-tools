import React from 'react';
import Route from 'react-router/lib/Route';
import IndexRedirect from 'react-router/lib/IndexRedirect';
import Homepage from '../components/media/home/Homepage';
import About from '../components/media/About';
import MediaApp from '../components/media/MediaApp';
import systemRoutes from './systemRoutes';

const explorerRoutes = (
  <Route path="/" component={MediaApp}>
    <IndexRedirect to="/home" />
    <Route path="/about" component={About} />
    <Route path="/home" component={Homepage} />
    {systemRoutes}

  </Route>
);

export default explorerRoutes;
