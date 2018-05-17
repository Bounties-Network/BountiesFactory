import React, { Component } from 'react'
import './UserPage.css'

const json = require('../../../contracts.json');

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));

const BigNumber = require('bignumber.js');

import logo from '../AppContainer/images/logo.svg';
import logoBounties from '../AppContainer/images/logo-bounties.svg';
import Navigation from 'components/Navigation/Navigation';

import { Link } from 'react-router';

import SvgArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right';

import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';

import Halogen from 'halogen';

import Blockies from 'react-blockies';

class UserPage extends Component {
  constructor(props) {
    super(props)

    web3.setProvider(new Web3.providers.HttpProvider("https://mainnet.infura.io"));
    this.state = {
      modalError: "",
      balance: 0,
      loadingStats: true,
      loadingBounties: true,
      loadingFulfillments: true,
      accounts: [],
      fulfillments: [],
      bounties: [],
      modalOpen: false,
      userAddress: this.props.params.address,
      noWeb3Error: false,
      StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v1),
      UserComments : web3.eth.contract(json.interfaces.UserComments).at(json.mainNet.userCommentsAddress),
      baseURL: json.url.mainNet
    }

    this.getInitialData = this.getInitialData.bind(this);

    this.handleCloseNoWeb3 = this.handleCloseNoWeb3.bind(this);

    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);

    this.getBounties = this.getBounties.bind(this);
    this.getMoreBounties = this.getMoreBounties.bind(this);
    this.getMoreFulfillments = this.getMoreFulfillments.bind(this);


  }

  componentDidMount() {
    if (window.loaded){
      this.getInitialData();
    } else {
      window.addEventListener('load', this.getInitialData);
    }
  }

  getMoreBounties(){
    this.setState({loadingMoreBounties: true});

    fetch(this.state.nextBountiesUrl)
      .then(function(response) {
        return response.json();

      }.bind(this)).then(function(json) {
        console.log('parsed json', json)
        var bounties = this.state.bounties;

        Array.prototype.push.apply(bounties,json.results);
        this.setState({bounties: bounties, loadingMoreBounties: false, nextBountiesUrl: json.next});



      }.bind(this)).catch(function(ex) {
        console.log('parsing failed', ex)
      });

  }

  getMoreFulfillments(){
    this.setState({loadingMoreFulfillments: true});

    fetch(this.state.nextFulfillmentsUrl)
      .then(function(response) {
        return response.json();

      }.bind(this)).then(function(json) {
        console.log('parsed json', json)
        var fulfillments = this.state.fulfillments;

        Array.prototype.push.apply(fulfillments,json.results);
        this.setState({fulfillments: fulfillments, loadingMoreFulfillments: false, nextFulfillmentsUrl: json.next});



      }.bind(this)).catch(function(ex) {
        console.log('parsing failed', ex)
      });

  }

  getBounties(){
    fetch(this.state.baseURL+"/bounty/?limit=5&issuer="+this.state.userAddress + "&platform__in=" + json.platform)
      .then(function(response) {
        return response.json();

      }).then(function(json) {
        console.log('parsed json', json);

        this.setState({bounties: json.results, loadingBounties: false, nextBountiesUrl: json.next});
      }.bind(this)).catch(function(ex) {
        console.log('parsing failed', ex)
      });

      fetch(this.state.baseURL+"/stats/"+this.state.userAddress + "/?platform__in=" + json.platform)
        .then(function(response) {
          return response.json();

        }).then(function(json) {
          console.log('parsed stats', json);

          this.setState({bountiesTotal: json.bounties,
                        bountiesAccepted: json.bounties_accepted,
                        bountiesRate: json.bounties_acceptance_rate,
                        submissionsTotal: json.submissions,
                        submissionsAccepted: json.submissions_accepted_count,
                        submissionsRate: json.submissions_acceptance_rate,
                        loadingStats: false});

        }.bind(this)).catch(function(ex) {
          console.log('parsing failed', ex)
        });
      fetch(this.state.baseURL+"/fulfillment/?limit=5&fulfiller="+this.state.userAddress + "&platform__in=" + json.platform)
        .then(function(response) {
          return response.json();

        }).then(function(json) {
          console.log('parsed json ful', json);

          this.setState({fulfillments: json.results, loadingFulfillments: false, nextFulfillmentsUrl: json.next});

        }.bind(this)).catch(function(ex) {
          console.log('parsing failed', ex)
        });
  }

  getInitialData(){
    if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
      // Use Mist/MetaMask's provider
      web3.setProvider(window.web3.currentProvider);
      web3.version.getNetwork((err, netId) => {
        if (netId === "1"){
          this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v1),
                         UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.mainNet.userCommentsAddress),
                         selectedNetwork: netId,
                        baseURL: json.url.mainNet});
        } else if (netId === "4"){
          this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v1),
                         StandardBountiesv0 : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v0),
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
            this.getBounties();

            web3.eth.getBalance(this.state.userAddress, (err, succ)=> {
              var balance = parseFloat(web3.fromWei(parseInt(succ, 10), "ether")).toFixed(2);
              this.setState({balance: balance});
            });
          }
        }
      }.bind(this));
    });
  } else {

    this.getBounties();
  }
}

handleOpen () {
  this.setState({modalOpen: true});
}

handleClose(){
  this.setState({modalOpen: false});
  this.getInitialData();
}

handleCloseNoWeb3(){
  this.setState({noWeb3Error: false});

}

  render() {
    document.title = "Bounties Explorer | User " + this.state.userAddress;

    const modalActions = [
        <FlatButton
          label="Retry"
          primary={true}
          onClick={this.handleClose}
        />
      ];

var contactString = "";
var myCategories = [];

var fulfillmentsList = [];
for (var i = 0; i < this.state.fulfillments.length; i++){
  var url = ("/bounty/v1/"+ this.state.fulfillments[i].bounty);
  var rewardAmount;
  var decimals = parseInt(this.state.fulfillments[i].bounty_data.tokenDecimals, 10);
  var newAmount = new BigNumber(this.state.fulfillments[i].bounty_data.fulfillmentAmount, 10);
  var decimalToMult = new BigNumber(10, 10);
  var decimalUnits = new BigNumber(decimals, 10);
  decimalToMult = decimalToMult.pow(decimalUnits);
  newAmount = newAmount.div(decimalToMult);
  rewardAmount = newAmount.toString();

  fulfillmentsList.push(
    <Link key={"fulList"+i} style={{}} to={url}>
    <div style={{backgroundColor: "rgba(1, 1, 1, 0.05)", borderLeft: "1px solid #2D0874", padding: "10px", marginBottom: (i === (this.state.fulfillments.length - 1))? "0px":"15px", marginTop: "0px", color: "#2D0874", overflow: "hidden"}} >
      <div style={{width: "calc(100% - 24px)", display: "block", float: "left", overflow: "hidden"}}>
      <h4 style={{margin: "0px", fontSize: "16px", fontWeight: "600"}}>{this.state.fulfillments[i].bounty_data.title}</h4>
      <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", fontWeight: "700"}}><b style={{color: "#fe923b", fontWeight: "600"}}>Reward: </b>{rewardAmount + " " + this.state.fulfillments[i].bounty_data.tokenSymbol} | <b style={{color: "#fe923b", fontWeight: "600"}}>{this.state.fulfillments[i].accepted? "Accepted" : "Not Accepted"}</b></p>

      </div>
      <SvgArrow style={{fontSize: "44px", marginTop: "10px", color: "#4a79fa", textAlign: "right", display: "block"}}/>

    </div>
    </Link>
  );
}

var bountiesList = [];
for (i = 0; i < this.state.bounties.length; i++){
  url = ("/bounty/v1/"+ this.state.bounties[i].bounty_id);
  var rewardAmount;
  var decimals = parseInt(this.state.bounties[i].tokenDecimals, 10);
  var newAmount = new BigNumber(this.state.bounties[i].fulfillmentAmount, 10);
  var decimalToMult = new BigNumber(10, 10);
  var decimalUnits = new BigNumber(decimals, 10);
  decimalToMult = decimalToMult.pow(decimalUnits);
  newAmount = newAmount.div(decimalToMult);
  rewardAmount = newAmount.toString();
  bountiesList.push(
    <Link key={"bountiesList"+i} style={{}} to={url}>
    <div  style={{backgroundColor: "rgba(1, 1, 1, 0.05)", borderLeft: "1px solid #2D0874", padding: "10px", marginBottom: (i === (this.state.bounties.length - 1))? "0px":"15px", marginTop: "0px", color: "#2D0874", overflow: "hidden"}} >
      <div style={{width: "calc(100% - 24px)", display: "block", float: "left", overflow: "hidden"}}>
      <h4 style={{margin: "0px", fontSize: "16px", fontWeight: "600"}}>{this.state.bounties[i].title}</h4>
      <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", fontWeight: "700"}}> <b style={{color: "#fe923b", fontWeight: "600"}}>Reward: </b>{rewardAmount + this.state.bounties[i].tokenSymbol} | {this.state.bounties[i].fulfillment_count}<b style={{color: "#fe923b", fontWeight: "600"}}> TOTAL SUBMISSIONS</b></p>
      </div>
      <SvgArrow style={{ fontSize: "44px", marginTop: "10px", color: "#4a79fa", textAlign: "right", display: "block"}}/>
    </div>
    </Link>
  );
}
var fulUI  = (
  <div>
    <h3 style={{margin: "0px", width: "100%", fontSize: "18px", textAlign: "center",  fontWeight: "600", color: "#1D1749"}}>Bounty Submissions</h3>
    <div style={{paddingBottom: "15px", borderBottom: "1px solid #4a79fa", display: "inline-block", width: "100%",  marginBottom: "12px", color: "#1D1749" }}>
      <div style={{width: "33%", display: "inline-block", float: "left"}}>
        <h3 style={{textAlign: "center", fontSize: "48px", borderRight: "1px solid #4a79fa", margin: "15px 0px"}}>{this.state.submissionsTotal}</h3>
        <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: "#fe923b"}}>SUBMISSIONS</p>
      </div>

      <div style={{width: "33%", display: "inline-block", float: "left"}}>
        <h3 style={{textAlign: "center", fontSize: "48px", borderRight: "1px solid #4a79fa", margin: "15px 0px"}}>{this.state.submissionsAccepted}</h3>
        <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: "#fe923b"}}>ACCEPTED</p>
      </div>
      <div style={{width: "33%", display: "inline-block", float: "left"}}>
        <h3 style={{textAlign: "center", fontSize: "48px", margin: "15px 0px"}}>{parseInt(100*this.state.submissionsRate, 10)}<b style={{fontSize: "18px"}}>%</b></h3>
        <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: "#fe923b"}}>ACCEPTANCE RATE</p>
      </div>
    </div>
    {fulfillmentsList}
    {!(this.state.loadingBounties || this.state.loadingFulfillments || this.state.loadingStats) && !this.state.loadingMoreFulfillments && this.state.nextFulfillmentsUrl &&

      <a onClick={this.getMoreFulfillments} style={{color: "#2D0874", margin: "0 auto", cursor: "pointer", fontWeight: "600", display: "block", width: "91px", marginTop: "15px"}}> SEE MORE...</a>
    }
    {this.state.loadingMoreFulfillments &&
      <div style={{width: "100%", marginTop: "15px"}}>
        <div style={{width: "40px", margin: "0 auto", overflow: "hidden", }}>
        <Halogen.ScaleLoader color={"#fe923b"} />
        </div>
      </div>
    }
  </div>
);
var bountiesUI = (
  <div>

    <h3 style={{margin: "0px", width: "100%", fontSize: "18px", textAlign: "center",  fontWeight: "600", color: "#1D1749"}}>Bounties Posted</h3>
    <div style={{paddingBottom: "15px", borderBottom: "1px solid #4a79fa", display: "inline-block", width: "100%", marginBottom: "12px", color: "#1D1749" }}>
      <div style={{width: "33%", display: "inline-block", float: "left"}}>
        <h3 style={{textAlign: "center", fontSize: "48px", borderRight: "1px solid #4a79fa", margin: "15px 0px"}}> {this.state.bountiesTotal} </h3>
        <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: "#fe923b"}}>BOUNTIES</p>
      </div>
      <div style={{width: "33%", display: "inline-block", float: "left"}}>
        <h3 style={{textAlign: "center", fontSize: "48px", borderRight: "1px solid #4a79fa", margin: "15px 0px"}}>{this.state.bountiesAccepted}</h3>
        <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: "#fe923b"}}>ACCEPTED</p>
      </div>
      <div style={{width: "33%", display: "inline-block", float: "left"}}>
      <h3 style={{textAlign: "center", fontSize: "48px", margin: "15px 0px"}}>{parseInt(100*this.state.bountiesRate, 10)}<b style={{fontSize: "18px"}}>%</b></h3>
        <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: "#fe923b"}}>ACCEPTANCE RATE</p>
      </div>
    </div>
    {bountiesList}
    {!(this.state.loadingBounties || this.state.loadingFulfillments || this.state.loadingStats) && !this.state.loadingMoreBounties && this.state.nextBountiesUrl &&

      <a onClick={this.getMoreBounties} style={{color: "#2D0874", margin: "0 auto", cursor: "pointer", fontWeight: "600", display: "block", width: "91px", marginTop: "15px"}}> SEE MORE...</a>
    }
    {this.state.loadingMoreBounties &&
      <div style={{width: "100%", marginTop: "15px"}}>
        <div style={{width: "40px", margin: "0 auto", overflow: "hidden", }}>
        <Halogen.ScaleLoader color={"#fe923b"} />
        </div>
      </div>
    }
  </div>
);
  const modalActions3 = [
  <FlatButton
    label="Close"
    primary={true}
    onClick={this.handleCloseNoWeb3}
  />
  ];
    return (
      <div>
      <Dialog
         title=""
         actions={modalActions}
         modal={false}
         open={this.state.modalOpen}
         onRequestClose={this.handleClose}
       >
         {this.state.modalError}
       </Dialog>
       <Dialog
          title=""
          actions={modalActions3}
          modal={false}
          open={this.state.noWeb3Error}
          onRequestClose={this.handleCloseNoWeb3}
        >
          <div style={{width: "75%", display: "block", margin: "0 auto", marginTop: "30px"}}>
          <p style={{fontSize: "18px", textAlign: "center"}}>To perform this action, you need to use a web3 enabled browser. We suggest using the <a href="https://metamask.io" target="_blank" style={{textDecoration: "none", color: "#4a79fa"}}> Metamask </a> browser extension.</p>
            </div>
        </Dialog>
        <div id={"colourBodyLight"} style={{minHeight: "100vh", position: "relative", overflow: "hidden"}}>
        <Navigation userAddress={this.state.accounts[0] || ""}/>
        {(this.state.loadingBounties || this.state.loadingFulfillments || this.state.loadingStats) &&
          <div style={{width: "100%", marginTop: "60px"}}>
            <div style={{margin: "0 auto", width: "42px", overflow: "hidden", }}>
            <Halogen.ScaleLoader color={"rgb(254, 146, 59)"} />
            </div>
          </div>}
        {!(this.state.loadingBounties || this.state.loadingFulfillments || this.state.loadingStats) &&
          <div style={{ display: "block", overflow: "hidden", maxWidth: "1050px", width: "100%", margin: "0 auto", paddingBottom: "160px"}}>
            <div style={{float: "left", margin: "15px 15px 15px 15px", width: "calc(100% - 89px)", display: "inline-block", backgroundColor: "rgb(249, 249, 249)" , padding: "30px", color: "rgb(25, 55, 83)", overflow: "hidden", textOverflow: "ellipsis"}}>
                <div style={{float: "left", display: "inline-block", width: "72px"}}>
                  <Blockies
                    seed={this.state.userAddress}
                    size={9}
                    scale={8}
                    style={{borderRadius: "100px", display: "inline-block", float: "left"}}
                    className={"identicon"}
                  />
                </div>
                <div style={{float: "left", display: "inline-block", paddingLeft: "30px", width: "calc(100% - 102px)"}}>
                <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px"}}><b style={{color:"#fe923b", fontWeight: "600"}}>User Address:</b></p>
                  <h3 style={{margin: "0px", width: "100%", display: "inline", fontWeight: "500", marginTop: "30px"}}>
                    <a style={{color: "#4a79fa"}} target={"_blank"} href={"https://etherscan.io/address/"+ this.state.userAddress}>{this.state.userAddress}</a>
                  </h3>
                  {myCategories.length > 0 && <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px"}}><b style={{color:  "#fe923b", fontWeight: "500"}}>Skills:</b></p>}
                </div>
              </div>
              <div className="fullWidthMobile" style={{float: "left", margin: "0 15px 15px 15px", width: "calc(50% - 83px)", display: "inline-block", backgroundColor: "rgb(249, 249, 249)" , padding: "30px"}}>
                {bountiesUI}
              </div>
              <div className="fullWidthMobile" style={{float: "right", margin: "0 15px 15px 0px", width: "calc(50% - 82px)", display: "inline-block", backgroundColor: "rgb(249, 249, 249)" , padding: "30px"}}>
                {fulUI}
              </div>
            </div>}
            <p style={{textAlign: "center", display: "block", fontSize: "10px", padding: "15px 0px", color: "#2D0874", width: "100%", position: "absolute", bottom: "0px"}}>&copy; Bounties Network, a <a href="https://ConsenSys.net" target="_blank" style={{textDecoration: "none", color: "#2D0874"}}>ConsenSys</a> Formation <br/>
              <a href="/privacyPolicy/" target="_blank" style={{color: "#2D0874"}}>Privacy Policy</a>{" | "}<a href="/terms/" target="_blank" style={{color: "#2D0874"}}>Terms of Service</a>
             </p>
        </div>
      </div>
    )
  }
}

export default UserPage
