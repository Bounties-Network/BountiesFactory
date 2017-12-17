import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import App from './App';
import BountyPage from './components/BountyPage/BountyPage';
import NewBounty from './components/NewBounty/NewBounty';
import AllBountiesPage from './components/AllBountiesPage/AllBountiesPage';
import UserPage from './components/UserPage/UserPage';
import PrivacyPolicy from './components/PrivacyPolicy/PrivacyPolicy';
import TermsOfService from './components/TermsOfService/TermsOfService';



import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import './index.css'

  ReactDOM.render((
    <MuiThemeProvider>
      <Router history={browserHistory}>
        <Route path="/" component={App} />
        <Route path="/bounty/:version/:id" component={BountyPage} />
        <Route path="/user/:address" component={UserPage} />
        <Route path="/allBounties/" component={AllBountiesPage} />
        <Route path="/privacyPolicy/" component={PrivacyPolicy} />
        <Route path="/terms/" component={TermsOfService} />
        <Route path="/newBounty/" component={NewBounty} />



      </Router>
    </MuiThemeProvider>
), document.getElementById('root'));
