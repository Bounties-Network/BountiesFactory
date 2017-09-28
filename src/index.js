import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, browserHistory } from 'react-router'
import App from './App'
import BountyPage from './components/BountyPage/BountyPage'
import NewBounty from './components/NewBounty/NewBounty'
import TokenBrowser from './components/TokenBrowser/TokenBrowser'


import Web3 from 'web3'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import './index.css'

import truffleConfig from '../truffle.js'

var web3Location = `http://${truffleConfig.rpc.host}:${truffleConfig.rpc.port}`

window.addEventListener('load', function() {
  var web3Provided;
  // Supports Metamask and Mist, and other wallets that provide 'web3'.
  if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet provider.
    // eslint-disable-next-line
    web3Provided = new Web3(web3.currentProvider);
  } else {
    web3Provided = new Web3(new Web3.providers.HttpProvider(web3Location))
  }
//<Route path="*" component={}/>
  ReactDOM.render((
    <MuiThemeProvider>
      <Router history={browserHistory}>
        <Route path="/" component={App} web3={web3Provided}/>
        <Route path="/bounty/:id" component={BountyPage} web3={web3Provided}/>
        <Route path="/newbounty/" component={NewBounty} web3={web3Provided}/>
        <Route path="/tokens/" component={TokenBrowser} web3={web3Provided}/>

      </Router>
    </MuiThemeProvider>
), document.getElementById('root'))
});
