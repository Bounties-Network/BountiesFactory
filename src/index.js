import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import App from './App';
import BountyPage from './components/BountyPage/BountyPage';
import NewBounty from './components/NewBounty/NewBounty';
import AllBountiesPage from './components/AllBountiesPage/AllBountiesPage';


import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import './index.css'

  ReactDOM.render((
    <MuiThemeProvider>
      <Router history={browserHistory}>
        <Route path="/" component={App} />
        <Route path="/bounty/:id" component={BountyPage} />
        <Route path="/newbounty/" component={NewBounty} />
        <Route path="/allBounties/" component={AllBountiesPage} />

      </Router>
    </MuiThemeProvider>
), document.getElementById('root'));
