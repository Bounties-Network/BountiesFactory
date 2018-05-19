import React, { Component } from 'react'
import './Leaderboard.css'

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));

const json = require('../../../contracts.json');

const BigNumber = require('bignumber.js');

import { Link } from 'react-router';

import logo from '../AppContainer/images/logo.svg';
import logoBounties from '../AppContainer/images/logo-bounties.svg';
import Navigation from 'components/Navigation/Navigation';

import FlatButton from 'material-ui/FlatButton';

import Dialog from 'material-ui/Dialog';

import Blockies from 'react-blockies';

import Halogen from 'halogen';

class Leaderboard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      numUpdated: 0,
      modalError: "",
      modalOpen: false,
      loading: true,
      accounts: [],
      leaderboard: [],
      StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v1),
      UserComments : web3.eth.contract(json.interfaces.UserComments).at(json.mainNet.userCommentsAddress),
      baseURL: json.url.rinkeby
    }
    this.getInitialData = this.getInitialData.bind(this);

    this.getLeaderboard = this.getLeaderboard.bind(this);

  }
  componentDidMount() {
    if (window.loaded){
      this.getInitialData();
    } else {
      window.addEventListener('load', this.getInitialData);
    }
  }
  handleOpen () {
    this.setState({modalOpen: true});
  }

  handleClose(){
    this.setState({modalOpen: false});
    this.getInitialData();
  }

  getLeaderboard(){
    fetch(this.state.baseURL+"/leaderboard/?limit=1000")
      .then(function(response) {
        return response.json();

      }.bind(this)).then(function(json) {
        console.log('parsed json ldr', json);

        this.setState({leaderboard: json, loading: false});

      }.bind(this)).catch(function(ex) {
        console.log('parsing failed', ex)
      });
  }

  getInitialData(){
    window.loaded = true;
    if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
      // Use Mist/MetaMask's provider
      console.log("Successfully connected to MetaMask")

      web3.setProvider(window.web3.currentProvider);

      console.log("this.state.web3", web3.currentProvider);

      web3.version.getNetwork((err, netId) => {

        if (netId === "1"){
            this.setState({modalError: ("Please change your Ethereum network to the Rinkeby network"), modalOpen: true});

            /*this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v0),
                           UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.mainNet.userCommentsAddress),
                           selectedNetwork: netId,
                          baseURL: json.url.mainNet});*/
        } else if (netId ===  "4"){
          this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v1),
                         UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.rinkeby.userCommentsAddress),
                         selectedNetwork: netId,
                       baseURL: json.url.rinkeby});
        } else {
          this.setState({modalError: ("Please change your Ethereum network to the Main Ethereum network or the Rinkeby network"), modalOpen: true});
        }

        setInterval(function() {
          web3.version.getNetwork(function(err, newNetId){
            if (netId !== newNetId) {
              window.location.reload();
            }
          });
        }, 2000);
        web3.eth.getAccounts(function(err, accs){
          if (err){
            console.log ('error fetching accounts', err);
          } else {
            if (accs.length === 0){
              this.setState({modalError: "Please unlock your MetaMask Accounts", modalOpen: true});

            } else {
              var account = accs[0];
              setInterval(function() {
                web3.eth.getAccounts(function(err, accs){
                  if (accs[0] !== account) {
                    account = web3.eth.accounts[0];
                    window.location.reload();
                  }
                });
              }, 2000);
              this.setState({accounts: accs});

              this.getLeaderboard();

            }
          }
        }.bind(this));

    });
    } else {
      this.getLeaderboard();
    }

  }

  render() {
    const modalActions = [
      <FlatButton
      label="Retry"
      primary={true}
      onClick={this.handleClose}
      />
    ];
    document.title = "Bounties Explorer | New Bounty";

    var leaderboard = [];

    for (var i = 0; i < this.state.leaderboard.length; i++){
      var reward = 0;
      var decimals = parseInt('18', 10);
       var newAmount = new BigNumber(this.state.leaderboard[i].total, 10);
       var decimalToMult = new BigNumber(10, 10);
       var decimalUnits = new BigNumber(decimals, 10);
       decimalToMult = decimalToMult.pow(decimalUnits);
       newAmount = newAmount.div(decimalToMult).toNumber();
      reward = newAmount;

      leaderboard.push(
        <div className="leaderWrapper" style={{padding: "15px", borderBottom: "1px solid rgba(25, 55, 83,0.1)", display: "block", height: "50px"}} key={i}>
          <div className="leaderboardBlockies" style={{display: "inline-block", float: "left", marginRight: "50px"}}>
          <h3 style={{color: "#2D0874", fontSize: "42px", margin: "0", width: "40px", textAlign: "center"}}>{1+i}</h3>
          </div>
          <div className="leaderboardBlockies" style={{marginTop: "8px", display: "block", overflow: "hidden", float: "left", marginRight: "50px"}}>
          <Blockies
            seed={this.state.leaderboard[i].address}
            size={9}
            scale={4}
            style={{borderRadius: "100px", display: "inline-block", float: "left"}}
            className={"identicon"}
          />
          </div>
          <span className="leaderboardName" style={{color: "#2D0874", fontSize: "20px", margin: "16px", display: "inline-block", width: "calc(100% - 490px)", whiteSpace: "nowrap", textOverflow: "ellipsis"}}>
          {this.state.leaderboard[i].name? this.state.leaderboard[i].name: "—"}
          </span>
          <p style={{color: "#2D0874", fontSize: "18px", margin: "16px", display: "inline-block", width: "80px", textAlign: "left", float: "right", textOverflow: "ellipsis"}}>
          {reward+" TACO"}
          </p>
          <span className="leaderboardUserLink" style={{width: "100px", display: "inline-block", float: "right", margin: "18px 15px", textOverflow: "ellipsis", color: "#4A79FA"}}>
            <Link style={{color: "#4a79fa", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", width: "100px"}}
                to={"/user/"+ this.state.leaderboard[i].address}>
                  { this.state.leaderboard[i].address.substring(0,6)+"..."+this.state.leaderboard[i].address.substring(this.state.leaderboard[i].address.length-4,this.state.leaderboard[i].address.length)}
            </Link>
          </span>

        </div>
      );
    }

    return (
      <div style={{position: "relative"}}>
        <Dialog
        title=""
        actions={modalActions}
        modal={false}
        open={this.state.modalOpen}
        onRequestClose={this.handleClose}
        >
          {this.state.modalError}
        </Dialog>
        <div id={"colourBodyLight"} style={{minHeight: "100vh", position: "relative", overflow: "hidden"}}>
          <Navigation userAddress={this.state.accounts[0] || ""}/>
          <div style={{display: "block", width: "100%", maxWidth: "1050px", margin: "0 auto", marginBottom: "75px", marginTop: "15px"}}>
            <div className={"ContractCard leaderboard"} style={{display: "block", width: "calc(100% - 230px)", padding: "15px", margin: "0 auto", backgroundColor: "rgb(249,249,249)", border: "0px", borderBottom: "0px solid #4a79fa", color:"#2D0874", paddingLeft: "100px", paddingRight: "100px", margin: "15px"}}>
              <h2 style={{fontFamily: "Open Sans", margin: "15px", textAlign: "Center", fontWeight: "600", fontSize: "28px"}}>Leaderboard</h2>
              {this.state.loading  &&

                <div style={{width: "40px", margin: "0 auto", marginTop: "60px", overflow: "hidden", marginBottom: "60px"}}>
                <Halogen.ScaleLoader color={"#fe923b"} />
                </div>
              }
              {leaderboard}
            </div>
          </div>
          <p style={{textAlign: "center", display: "block", fontSize: "10px", padding: "15px 0px", color: "#2D0874", width: "100%", position: "absolute", bottom: "0px"}}>&copy; Bounties Network, a <a href="https://ConsenSys.net" target="_blank" style={{textDecoration: "none", color: "#2D0874"}}>ConsenSys</a> Formation <br/>
            <a href="/privacyPolicy/" target="_blank" style={{color: "#2D0874"}}>Privacy Policy</a>{" | "}<a href="/terms/" target="_blank" style={{color: "#2D0874"}}>Terms of Service</a>
           </p>

        </div>
      </div>
    )
  }
}

export default Leaderboard
