import React, { Component } from 'react'
import './Leaderboard.css'

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));
import { Link } from 'react-router';

const json = require('../../../contracts.json');
const networkId = json.networkId;

const Buffer = require('buffer/').Buffer;

const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const ipfsAPI = require('ipfs-api');
const BigNumber = require('bignumber.js');

var ipfsNew = ipfsAPI({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});



import ipfsFiles from "browser-ipfs";

import { browserHistory } from 'react-router';

import logo from '../AppContainer/images/logo.svg';
import logoBounties from '../AppContainer/images/logo-bounties.svg';

import darkMoon from '../AppContainer/images/DarkMoon.png';
import lightMoon from '../AppContainer/images/LightMoon.png';

import FlatButton from 'material-ui/FlatButton';

import BountiesFacts from 'components/BountiesFacts/BountiesFacts';
import SvgCheck from 'material-ui/svg-icons/action/check-circle';

import Select from 'react-select';
import Dialog from 'material-ui/Dialog';
import LinearProgress from 'material-ui/LinearProgress';

import Blockies from 'react-blockies';

import Halogen from 'halogen';


class Leaderboard extends Component {
  constructor(props) {
    super(props)
    var requiredNetwork = 0;
    var standardBountiesAddress = "";
    var userCommentsAddress = "";
    var networkName = "";
    var providerLink = "";
    var stored = localStorage.getItem('ethereumNetwork');

    if (!stored){
      providerLink = "https://mainnet.infura.io";
      requiredNetwork = 1;
      standardBountiesAddress = json.mainNet.standardBountiesAddress.v1;
      userCommentsAddress = json.mainNet.userCommentsAddress;
      networkName = "Main Network";
      localStorage.setItem('ethereumNetwork', "MainNet");
    } else {
      if (stored === "MainNet"){
        providerLink = "https://mainnet.infura.io";
        requiredNetwork = 1;
        standardBountiesAddress = json.mainNet.standardBountiesAddress.v1;
        userCommentsAddress = json.mainNet.userCommentsAddress;
        networkName = "Main Network";


      } else if (stored === "Rinkeby"){
        providerLink = "https://rinkeby.infura.io";
        requiredNetwork = 4;
        standardBountiesAddress = json.rinkeby.standardBountiesAddress.v1;
        userCommentsAddress = json.rinkeby.userCommentsAddress;
        networkName = "Rinkeby Network";
      }

    }
    web3.setProvider(new Web3.providers.HttpProvider(providerLink));
    console.log("json.rinkeby.standardBountiesAddress.v1", json.rinkeby.standardBountiesAddress.v1);

    this.state = {
      numUpdated: 0,
      modalError: "",
      modalOpen: false,
      loading: true,
      accounts: [],
      leaderboard: [],
      requiredNetwork: requiredNetwork,
      networkName: networkName,
      standardBountiesAddress: standardBountiesAddress,
      userCommentsAddress: userCommentsAddress,
      StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(standardBountiesAddress),
      UserComments : web3.eth.contract(json.interfaces.UserComments).at(userCommentsAddress),
      baseURL: "http://a2e716ea2144911e898ed02122fce8e2-236283655.us-east-1.elb.amazonaws.com:83"

    }
    this.ipfsApi = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: "https"});
    ipfsFiles.setProvider({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});


    this.getInitialData = this.getInitialData.bind(this);

    this.getLeaderboard = this.getLeaderboard.bind(this);

  }
  componentDidMount() {
    //  this.getContractData();
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

        if (parseInt(netId, 10) > 10000){
          this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.localhost.standardBountiesAddress.v1),
                         StandardBountiesv0 : web3.eth.contract(json.interfaces.StandardBounties).at(json.localhost.standardBountiesAddress.v0),
                         UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.localhost.userCommentsAddress),
                         selectedNetwork: netId});
        } else if (netId === "1"){
          this.setState({modalError: ("Please change your Ethereum network to the Rinkeby network"), modalOpen: true});
        } else if (netId ===  "4"){
          this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v1),
                         UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.rinkeby.userCommentsAddress),
                         selectedNetwork: netId,
                       baseURL: "http://afb256214274611e898ed02122fce8e2-504516521.us-east-1.elb.amazonaws.com:83"});
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
              var account = web3.eth.accounts[0];
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
      var reward;


      var decimals = parseInt(this.state.leaderboard[i].decimals, 10);
      var newAmount = new BigNumber(this.state.leaderboard[i].total, 10);
      var decimalToMult = new BigNumber(10, 10);
      var decimalUnits = new BigNumber(decimals, 10);
      decimalToMult = decimalToMult.pow(decimalUnits);
      newAmount = newAmount.div(decimalToMult).toNumber();
      reward = newAmount.toFixed(4);

      console.log("rewardAmount", reward);


      leaderboard.push(
        <div style={{padding: "15px", borderBottom: "1px solid rgba(25, 55, 83,0.1)", display: "block", height: "50px"}} key={i}>
          <div style={{display: "inline-block", float: "left", marginRight: "50px"}}>
          <h3 style={{color: "rgb(25, 55, 83)", fontSize: "42px", margin: "0", width: "40px", textAlign: "center"}}>{1+i}</h3>
          </div>
          <div style={{marginTop: "8px", display: "block", overflow: "hidden", float: "left", marginRight: "50px"}}>
          <Blockies
            seed={this.state.leaderboard[i].address}
            size={9}
            scale={4}
            style={{borderRadius: "100px", display: "inline-block", float: "left"}}
            className={"identicon"}
          />
          </div>
          <p style={{color: "rgb(25, 55, 83)", fontSize: "20px", margin: "16px", display: "inline-block", marginRight: "70px", width: "200px"}}>
          {this.state.leaderboard[i].name? this.state.leaderboard[i].name: "—"}
          </p>
          <Link style={{color: "#f52a34", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", width: "100px"}}
              to={"/user/"+ this.state.leaderboard[i].address}>
                { this.state.leaderboard[i].address.substring(0,6)+"..."+this.state.leaderboard[i].address.substring(this.state.leaderboard[i].address.length-4,this.state.leaderboard[i].address.length)}
          </Link>
          <p style={{color: "rgb(25, 55, 83)", fontSize: "20px", margin: "16px", display: "inline-block", width: "70px", textAlign: "right", float: "right"}}>
          {reward+this.state.leaderboard[i].symbol}
          </p>
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

          <div style={{overflow: "hidden"}} className="navBar">
          <Link to="/" style={{width: "18em", overflow: "hidden", float: "left",  position: "absolute", top: "15px", left: "30px"}}>
            <div style={{backgroundImage:  `url(${logoBounties})`, height: "3em", width: "18em", backgroundSize: "contain", backgroundRepeat: "no-repeat", display: "block", float: "left"}}>
            </div>
          </Link>
          <Link to="/" style={{width: "18em", overflow: "hidden", display: "block", padding: "1em 0em 1em 0em", margin: "0 auto"}}>
            <div style={{backgroundImage:  `url(${logo})`, height: "3em", width: "18em", backgroundSize: "contain", backgroundRepeat: "no-repeat", display: "block", float: "left"}}>
            </div>
          </Link>
            <span style={{backgroundSize: 'cover', backgroundRepeat: 'no-repeat', borderRadius: '50%', boxShadow: 'inset rgba(255, 255, 255, 0.6) 0 2px 2px, inset rgba(0, 0, 0, 0.3) 0 -2px 6px'}} />
            <FlatButton style={{backgroundColor: "rgba(0,0,0,0)", border: "0px solid white", color: "white", width: "150px", float: "left", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "180px"}} > <Link to="/leaderboard/" className={"buttonGlow"} style={{textDecoration: "none"}}> LeaderBoard </Link></FlatButton>
            <FlatButton style={{backgroundColor: "rgba(0,0,0,0)", border: "0px solid white", color: "white", width: "150px", float: "right", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "30px"}} > <Link to="/newBounty/" className={"buttonGlow"} style={{textDecoration: "none"}}> New Bounty </Link></FlatButton>
          </div>
            <div style={{display: "block", width: "850px", padding: "15px", margin: "0 auto", marginBottom: "75px", marginTop: "15px", backgroundColor: "rgb(249,249,249)", border: "0px", borderBottom: "0px solid #f52a34", color:"rgb(25, 55, 83)", paddingLeft: "100px", paddingRight: "100px"}} className="ContractCard">
              <h3 style={{fontFamily: "Open Sans", margin: "15px", textAlign: "Center",width: "800px", fontWeight: "600", fontSize: "28px"}}>Leaderboard</h3>
              {this.state.loading  &&

                <div style={{marginLeft: "405px", marginTop: "60px", overflow: "hidden", marginBottom: "60px"}}>
                <Halogen.ScaleLoader color={"#f52a34"} />
                </div>
              }
              {leaderboard}

            </div>
            <p style={{textAlign: "center", display: "block", fontSize: "10px", padding: "15px 0px", color: "rgb(25, 55, 83)", width: "100%", position: "absolute", bottom: "0px"}}>&copy; Bounties Network, a <a href="https://ConsenSys.net" target="_blank" style={{textDecoration: "none", color: "rgb(25, 55, 83)"}}>ConsenSys</a> Formation <br/>
             <a href="/privacyPolicy/" target="_blank" style={{color: "rgb(25, 55, 83)"}}>Privacy Policy</a>{" | "}<a href="/terms/" target="_blank" style={{color: "rgb(25, 55, 83)"}}>Terms of Service</a>
             </p>
        </div>

      </div>
    )
  }
}

export default Leaderboard
