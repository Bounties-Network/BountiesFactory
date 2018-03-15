import React, { Component } from 'react'
import './UserPage.css'


const json = require('../../../contracts.json');

const networkId = json.networkId;

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));

const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const BN = require(`bn.js`);

const utf8 = require('utf8');

import logo from '../AppContainer/images/logo.svg';
import darkMoon from '../AppContainer/images/DarkMoon.png';
import lightMoon from '../AppContainer/images/LightMoon.png';


import BountiesFacts from 'components/BountiesFacts/BountiesFacts';

import ActivateForm from 'components/ActivateForm/ActivateForm';
import ChangeDeadlineForm from 'components/ChangeDeadlineForm/ChangeDeadlineForm';
import TransferOwnershipForm from 'components/TransferOwnershipForm/TransferOwnershipForm';
import ExtendDeadlineForm from 'components/ExtendDeadlineForm/ExtendDeadlineForm';
import KillBountyForm from 'components/KillBountyForm/KillBountyForm';
import IncreasePayoutForm from 'components/IncreasePayoutForm/IncreasePayoutForm';
import SvgArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right';

import FlatButton from 'material-ui/FlatButton';
import Chip from 'material-ui/Chip';
import SvgBug from 'material-ui/svg-icons/action/bug-report';
import SvgCode from 'material-ui/svg-icons/action/code';
import SvgGraphic from 'material-ui/svg-icons/image/brush';
import SvgContent from 'material-ui/svg-icons/editor/format-indent-increase';
import SvgTranslations from 'material-ui/svg-icons/action/language';
import SvgSocial from 'material-ui/svg-icons/social/share';
import SvgQuestion from 'material-ui/svg-icons/action/question-answer';
import SvgSurvey from 'material-ui/svg-icons/editor/drag-handle';
import SvgEdit from 'material-ui/svg-icons/editor/mode-edit';

import Dialog from 'material-ui/Dialog';

import Avatar from 'material-ui/Avatar';
import Text from 'react-format-text';

import Halogen from 'halogen';

import Blockies from 'react-blockies';

const ipfsAPI = require('ipfs-api');




class UserPage extends Component {
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
    this.state = {
      modalError: "",
      balance: 0,
      loadingInitial: true,
      loadingStats: true,
      loadingBounties: true,
      loadingFulfillments: true,
      accounts: [],
      contracts: [],
      fulfillments: [],
      bounties: [],
      bountiesv0: [],
      total: 0,
      totalMe: 0,
      loading: true,
      modalOpen: false,
      commentsAbout: [],
      userAddress: this.props.params.address,
      commentError: "",
      noWeb3Error: false,
      requiredNetwork: requiredNetwork,
      networkName: networkName,
      standardBountiesAddress: standardBountiesAddress,
      userCommentsAddress: userCommentsAddress,
      StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(standardBountiesAddress),
      StandardBountiesv0 : web3.eth.contract(json.interfaces.StandardBounties).at(standardBountiesAddress),
      UserComments : web3.eth.contract(json.interfaces.UserComments).at(userCommentsAddress),
      baseURL: "http://a2e716ea2144911e898ed02122fce8e2-236283655.us-east-1.elb.amazonaws.com:83"
    }
    this.ipfsApi = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: "https"});

    this.getInitialData = this.getInitialData.bind(this);

    this.handleComment = this.handleComment.bind(this);
    this.handleCloseNoWeb3 = this.handleCloseNoWeb3.bind(this);

    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleChangeNetwork = this.handleChangeNetwork.bind(this);
    this.handleToggleLightMode = this.handleToggleLightMode.bind(this);

    this.getBounties = this.getBounties.bind(this);


  }

  dateToString(date){
    var givenDate = date;

    var oneMillenium = 31556952000000;
    var oneCentury = 3155695200000;
    var oneDecade = 315569520000;
    var oneYear = 31556952000;
    var oneMonth = 2592000000;
    var oneWeek = 604800000;
    var oneDay = 86400000;
    var oneHour = 3600000;
    var oneMinute = 60000;
    var oneSecond = 1000;
    var difference = givenDate - Date.now();
    if (difference > 0){
      if (difference >= oneMillenium){
        var num = parseInt(difference/oneMillenium);
        var time = (num === 1? "millennium" : "millennia");
        return ("ends in " + num + " "+time);
      }
      if (difference >= oneCentury){
        var num = parseInt(difference/oneCentury);
        var time = (num === 1? "century" : "centuries");
        return ("ends in " + num + " "+time);
      }
      if (difference >= oneDecade){
        var num = parseInt(difference/oneDecade);
        var time = (num === 1? "decade" : "decades");
        return ("ends in " + num + " "+time);
      }
      if (difference >= oneYear){
        var num = parseInt(difference/oneYear);
        var time = (num === 1? "year" : "years");
        return ("ends in " + num + " "+time);
      }
      if (difference >= oneMonth){
        var num = parseInt(difference/oneMonth);
        var time = (num === 1? "month" : "months");
        return ("ends in " + num + " "+time);
      }
      if (difference >= oneWeek){
        var num = parseInt(difference/oneWeek);
        var time = (num === 1? "week" : "weeks");
        return ("ends in " + num + " "+time);
      }
      if (difference >= oneDay){
        var num = parseInt(difference/oneDay);
        var time = (num === 1? "day" : "days");
        return ("ends in " + num + " "+time);
      }
      if (difference >= oneHour){
        var num = parseInt(difference/oneHour);
        var time = (num === 1? "hour" : "hours");
        return ("ends in " + num + " "+time);
      }
      if (difference >= oneMinute){
        var num = parseInt(difference/oneMinute);
        var time = (num === 1? "minute" : "minutes");
        return ("ends in " + num + " "+time);
      }
      if (difference >= oneSecond){
        var num = parseInt(difference/oneSecond);
        var time = (num === 1? "second" : "seconds");
        return ("ends in " + num + " "+time);
      }

    } else if (difference < 0){
      difference = difference * -1;

      if (difference >= oneMillenium){
        var num = parseInt(difference/oneMillenium);
        var time = (num === 1? "millennium" : "millennia");
        return (num + " "+time+" ago");
      }
      if (difference >= oneCentury){
        var num = parseInt(difference/oneCentury);
        var time = (num === 1? "century" : "centuries");
        return (num + " "+time+" ago");
      }
      if (difference >= oneDecade){
        var num = parseInt(difference/oneDecade);
        var time = (num === 1? "decade" : "decades");
        return (num + " "+time+" ago");
      }
      if (difference >= oneYear){
        var num = parseInt(difference/oneYear);
        var time = (num === 1? "year" : "years");
        return (num + " "+time+" ago");
      }
      if (difference >= oneMonth){
        var num = parseInt(difference/oneMonth);
        var time = (num === 1? "month" : "months");
        return (num + " "+time+" ago");
      }
      if (difference >= oneWeek){
        var num = parseInt(difference/oneWeek);
        var time = (num === 1? "week" : "weeks");
        return (num + " "+time+" ago");
      }
      if (difference >= oneDay){
        var num = parseInt(difference/oneDay);
        var time = (num === 1? "day" : "days");
        return (num + " "+time+" ago");
      }
      if (difference >= oneHour){
        var num = parseInt(difference/oneHour);
        var time = (num === 1? "hour" : "hours");
        return (num + " "+time+" ago");
      }
      if (difference >= oneMinute){
        var num = parseInt(difference/oneMinute);
        var time = (num === 1? "minute" : "minutes");
        return (num + " "+time+" ago");
      }
      if (difference >= oneSecond){
        var num = parseInt(difference/oneSecond);
        var time = (num === 1? "second" : "seconds");
        return (num + " "+time+" ago");
      }

    } else {
      return "now";
    }
  }
  componentDidMount() {
    if (window.loaded){
      this.getInitialData();
    } else {
      window.addEventListener('load', this.getInitialData);
    }
  }

  toUTF8(hex) {
      var str = "";
      var i = 0, l = hex.length;
      if (hex.substring(0, 2) === '0x') {
          i = 2;
      }
      for (; i < l; i+=2) {
          var code = parseInt(hex.substr(i, 2), 16);
          if (code === 0)
              break;
          str += String.fromCharCode(code);
      }

      return utf8.decode(str);
  }


  getBountyComments(){

      this.state.UserCommentsContract.numComments((err, succ)=> {
        var total = parseInt(succ, 10);
        var comments = [];
        var commentsAbout = [];


        for (var i = 0; i < total; i++){
          this.state.UserCommentsContract.getComment( i, (err, succ)=> {
            var from = succ[1];
            var to = succ[2];
            var aboutBounty = succ[3];
            var bountyId = succ[4];
            var date = new Date(parseInt(succ[5], 10)*1000);
            var intDate = parseInt(succ[5], 10);
            var newDate;
            var dateString;
            var max = new BN(8640000000000000);
            if ((succ[5].times(1000)).greaterThan(max)){
              newDate = new Date(parseInt(max, 10));
              dateString = this.dateToString(8640000000000000);
            } else {
              newDate = new Date(parseInt(succ[5], 10)*1000);
              dateString = this.dateToString(parseInt(succ[5], 10)*1000);
            }

            ipfs.catJSON(succ[0], (err, result)=> {
              if (to == this.state.userAddress){
                commentsAbout.push({title: result.title,
                              from: from,
                              to: to,
                              aboutBounty: aboutBounty,
                              bountyId: parseInt(bountyId, 10),
                              description: result.description,
                              date: newDate.toUTCString(),
                              dateString: dateString,
                              aboutFulfillment: result.aboutFulfillment,
                              fulfillmentId: result.fulfillmentId});
              }
              comments.push({title: result.title,
                            from: from,
                            to: to,
                            aboutBounty: aboutBounty,
                            bountyId: parseInt(bountyId, 10),
                            description: result.description,
                            date: newDate.toUTCString(),
                            dateString: dateString,
                            aboutFulfillment: result.aboutFulfillment,
                            fulfillmentId: result.fulfillmentId});

              if (comments.length === total){
                this.setState({commentsAbout: commentsAbout});
              }
            });
          });
        }
      });


  }


  getBounties(){
    fetch(this.state.baseURL+"/bounty/?limit=1000&issuer="+this.state.userAddress)
      .then(function(response) {
        return response.json();

      }.bind(this)).then(function(json) {
        console.log('parsed json', json);

        this.setState({bounties: json.results, loadingBounties: false});



      }.bind(this)).catch(function(ex) {
        console.log('parsing failed', ex)
      });

      fetch(this.state.baseURL+"/stats/profile/"+this.state.userAddress+"/")
        .then(function(response) {
          return response.json();

        }.bind(this)).then(function(json) {
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
      fetch(this.state.baseURL+"/fulfillment/?limit=1000&fulfiller="+this.state.userAddress)
        .then(function(response) {
          return response.json();

        }.bind(this)).then(function(json) {
          console.log('parsed json ful', json);

          this.setState({fulfillments: json.results, loadingFulfillments: false});



        }.bind(this)).catch(function(ex) {
          console.log('parsing failed', ex)
        });
  }

  getInitialData(){
    if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
      // Use Mist/MetaMask's provider
      web3.setProvider(window.web3.currentProvider);
      web3.version.getNetwork((err, netId) => {


        if (parseInt(netId, 10) > 10000){
          this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.localhost.standardBountiesAddress.v1),
                         StandardBountiesv0 : web3.eth.contract(json.interfaces.StandardBounties).at(json.localhost.standardBountiesAddress.v0),
                         UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.localhost.userCommentsAddress),
                         selectedNetwork: netId});
        }if (netId === "1"){
          this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v1),
                         StandardBountiesv0 : web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v0),
                         UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.mainNet.userCommentsAddress),
                         selectedNetwork: netId});
        } else if (netId === "4"){
          this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v1),
                         StandardBountiesv0 : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v0),
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


      /*
      this.setState({modalError: "You must use MetaMask if you would like to use the Bounties.network dapp", modalOpen: true});
      setInterval(function() {
        if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
          this.getInitialData();
        } else {
          console.log("window", window.web3);
        }
      }, 100);
      */
    }

  }
  handleComment(evt){
    evt.preventDefault();
    if (this.state.accounts.length === 0){
      this.setState({noWeb3Error: true});
    } else {
    var title = evt.target.comment_title.value;
    var description = evt.target.comment_description.value;

    if (title === "" || description === ""){
      this.setState({commentError: "All comment fields are required!"});
    } else {
      this.setState({commentError: ""});
      ipfs.addJSON({title: title, description: description}, (err, succ)=> {
        console.log("about to add", succ, this.state.userAddress, false, 0);

        this.state.UserCommentsContract.addComment(succ, this.state.userAddress, false, 0, {from: this.state.accounts[0]}, (cerr, succ)=> {

          window.location.reload();
        });
      })
    }
}
  }


handleOpen () {
  this.setState({modalOpen: true});
}
handleChangeNetwork(evt){
  evt.preventDefault();

  var requiredNetwork = evt.target.value;
  var standardBountiesAddress = "";
  var userCommentsAddress = "";
  var networkName = "";
  var providerLink = "";

  if (parseInt(requiredNetwork) === parseInt(1)){
    providerLink = "https://mainnet.infura.io";
    standardBountiesAddress = json.mainNet.standardBountiesAddress;
    userCommentsAddress = json.mainNet.userCommentsAddress;
    networkName = "Main Network";
    localStorage.setItem('ethereumNetwork', "MainNet");



  } else if (parseInt(requiredNetwork) === parseInt(4)){
    providerLink = "https://rinkeby.infura.io";
    standardBountiesAddress = json.rinkeby.standardBountiesAddress;
    userCommentsAddress = json.rinkeby.userCommentsAddress;
    networkName = "Rinkeby Network";
    localStorage.setItem('ethereumNetwork', "Rinkeby");

  }

  this.setState({requiredNetwork: requiredNetwork,
                providerLink: providerLink,
                standardBountiesAddress: standardBountiesAddress,
                userCommentsAddress: userCommentsAddress,
                networkName: networkName,
                web3: new Web3(new Web3.providers.HttpProvider(providerLink)),
                StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(standardBountiesAddress),
                UserComments : web3.eth.contract(json.interfaces.UserComments).at(userCommentsAddress)
                });

  this.getInitialData();
}

handleClose(){
  this.setState({modalOpen: false});
  this.getInitialData();
}

onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
handleCloseNoWeb3(){
  this.setState({noWeb3Error: false});

}
handleToggleLightMode(){
  var lightMode = !this.state.lightMode;
  this.setState({lightMode: lightMode});
  localStorage.setItem('lightMode', lightMode);

}

  render() {
    document.title = "Bounties Explorer | User " + this.state.userAddress;


    var totalBounties = this.state.bounties;

    const modalActions = [
    <FlatButton
      label="Retry"
      primary={true}
      onClick={this.handleClose}
    />
  ];
  var commentsArray = [];
  var comments;
  for (var i = 0; i < this.state.commentsAbout.length; i++){
    commentsArray.push(
      <div style={{display: "block", borderBottom: "0px solid #16e5cd", marginBottom: "15px", overflow: "hidden"}} key={"comment: "+i}>
        <div style={{backgroundColor: "rgb(249,249,249)", display: "block", overflow: "hidden", padding: "15px", color: "rgb(25, 55, 83)"}}>
            <h5 style={{margin: "5px 0px", color :"rgb(25, 55, 83)"}}><b style={{fontSize: "16px"}}>{this.state.commentsAbout[i].title}</b></h5>
            <Text style={{ fontSize: "14px", width: "100%", margin: "0px 10px 10px 0px", color: "#FFDE46", textDecoration: "none", display: "block", overflow: "hidden"}}>{this.state.commentsAbout[i].description}</Text>

            <p style={{ fontSize: "12px", margin: "4px  10px 2.5px 0px", display: "inline-block", float: "left"}}><b style={{color: "#FFDE46"}}>By: </b></p>
            <Blockies
            seed={this.state.commentsAbout[i].from}
            size={9}
            scale={2.5}
            style={{borderRadius: "10px", display: "inline-block", float: "left"}}
            />
            <p style={{ fontSize: "12px", margin: "4px  0px 4px 10px", display: "inline-block", float: "left"}}><a style={{color: "#16e5cd"}} target={"_blank"} href={"/user/"+ this.state.commentsAbout[i].from}>{this.state.commentsAbout[i].from}</a></p>
            <p style={{ fontSize: "12px", margin: "4px  0px 4px 10px", display: "inline-block", float: "left", color: "rgb(208, 208, 208)"}}>{this.state.commentsAbout[i].dateString}</p>
        </div>
      </div>

    );
  }
  comments = (
    <div style={{paddingTop: "30px", display: "block"}}>
      <h3 style={{fontFamily: "Open Sans", marginTop: "30px", margin: "0 auto", marginBottom: "15px", textAlign: "center", color: "rgb(25, 55, 83)"}}>{this.state.commentsAbout.length} Comment{this.state.commentsAbout.length !== 1? "s" : ""}</h3>
      {commentsArray}
    </div>
  );

var contactString = "";
var myCategories = [];
var myBounties = [];
var myFul = [];
var numAccepted = 0;
var myNumKilled = 0;
var mine = false;
var myNumAccepted = 0;
var myIssued = 0;
var mySubs = 0;
var myContactInfo = [];

var fulfillmentsList = [];
for (i = 0; i < this.state.fulfillments.length && i < 5; i++){
  var url = ("/bounty/v1/"+ this.state.fulfillments[i].bounty);

  var rewardAmount;

  var decimals = parseInt(this.state.fulfillments[i].bounty_data.tokenDecimals, 10);
  var newAmount = new BN(this.state.fulfillments[i].bounty_data.fulfillmentAmount, 10);
  var decimalToMult = new BN(10, 10);
  var decimalUnits = new BN(decimals, 10);
  decimalToMult = decimalToMult.pow(decimalUnits);
  newAmount = newAmount.div(decimalToMult);
  rewardAmount = newAmount.toString();

  fulfillmentsList.push(
    <a key={"fulList"+i} style={{}} href={url}>
    <div style={{backgroundColor: "rgba(1, 1, 1, 0.05)", borderLeft: "1px solid rgb(25, 55, 83)", padding: "10px", marginBottom: (i === (this.state.fulfillments.length - 1) || i == 4)? "0px":"15px", marginTop: "0px", color: "rgb(25, 55, 83)", overflow: "hidden"}} >
      <div style={{width: "390px", display: "block", float: "left", overflow: "hidden"}}>
      <h4 style={{margin: "0px", fontSize: "16px", fontWeight: "600"}}>{this.state.fulfillments[i].bounty_data.title}</h4>
      <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", fontWeight: "700"}}><b style={{color: "rgb(255, 184, 21)", fontWeight: "500"}}>Reward: </b>{rewardAmount + " " + this.state.fulfillments[i].bounty_data.tokenSymbol} | <b style={{color: "rgb(255, 184, 21)", fontWeight: "500"}}>{this.state.fulfillments[i].accepted? "Accepted" : "Not Accepted"}</b></p>

      </div>
      <SvgArrow style={{color: "rgb(25, 55, 83)", fontSize: "44px", marginTop: "10px", color: "#16e5cd", textAlign: "right", display: "block"}}/>

    </div>
    </a>
  );
}

var bountiesList = [];
for (i = 0; i < this.state.bounties.length && i < 5; i++){
  var url = ("/bounty/v1/"+ this.state.bounties[i].bounty_id);
  bountiesList.push(
    <a key={"bountiesList"+i} style={{}} href={url}>
    <div  style={{backgroundColor: "rgba(1, 1, 1, 0.05)", borderLeft: "1px solid rgb(25, 55, 83)", padding: "10px", marginBottom: (i === (this.state.bounties.length - 1) || i == 4)? "0px":"15px", marginTop: "0px", color: "rgb(25, 55, 83)", overflow: "hidden"}} >
      <div style={{width: "390px", display: "block", float: "left", overflow: "hidden"}}>
      <h4 style={{margin: "0px", fontSize: "16px", fontWeight: "600"}}>{this.state.bounties[i].title}</h4>
      <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", fontWeight: "700"}}> <b style={{color: "rgb(255, 184, 21)"}}>{this.state.bounties[i].stage}</b>| {this.state.bounties[i].fulfillment_count}<b style={{color: "rgb(255, 184, 21)", fontWeight: "500"}}> total submissions</b></p>
      </div>
      <SvgArrow style={{color: "rgb(25, 55, 83)", fontSize: "44px", marginTop: "10px", color: "#16e5cd", textAlign: "right", display: "block"}}/>
    </div>
    </a>
  );
}
var fulUI  = (
  <div>
    <h3 style={{margin: "0px", width: "100%", fontSize: "18px", textAlign: "center",  fontWeight: "600", color: "rgb(25, 55, 83)"}}>Bounty Submissions</h3>
    <div style={{paddingBottom: "15px", borderBottom: "1px solid #16e5cd", display: "inline-block", width: "442px",  marginBottom: "12px", color: "rgb(25, 55, 83)" }}>
      <div style={{width: "33%", display: "inline-block", float: "left"}}>
        <h3 style={{textAlign: "center", fontSize: "48px", borderRight: "1px solid #16e5cd", margin: "15px 0px"}}>{this.state.submissionsTotal}</h3>
        <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: "rgb(255, 184, 21)"}}>SUBMISSIONS</p>
      </div>

      <div style={{width: "33%", display: "inline-block", float: "left"}}>
        <h3 style={{textAlign: "center", fontSize: "48px", borderRight: "1px solid #16e5cd", margin: "15px 0px"}}>{this.state.submissionsAccepted}</h3>
        <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: "rgb(255, 184, 21)"}}>ACCEPTED</p>
      </div>
      <div style={{width: "33%", display: "inline-block", float: "left"}}>
        <h3 style={{textAlign: "center", fontSize: "48px", margin: "15px 0px"}}>{parseInt(100*this.state.submissionsRate)}<b style={{fontSize: "18px"}}>%</b></h3>
        <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: "rgb(255, 184, 21)"}}>ACCEPTANCE RATE</p>
      </div>
    </div>
    {fulfillmentsList}
  </div>
);
var bountiesUI = (
  <div>

    <h3 style={{margin: "0px", width: "100%", fontSize: "18px", textAlign: "center",  fontWeight: "600", color: "rgb(25, 55, 83)"}}>Bounties Posted</h3>
    <div style={{paddingBottom: "15px", borderBottom: "1px solid #16e5cd", display: "inline-block", width: "442px", marginBottom: "12px", color: "rgb(25, 55, 83)" }}>
      <div style={{width: "33%", display: "inline-block", float: "left"}}>
        <h3 style={{textAlign: "center", fontSize: "48px", borderRight: "1px solid #16e5cd", margin: "15px 0px"}}> {this.state.bountiesTotal} </h3>
        <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: "rgb(255, 184, 21)"}}>BOUNTIES</p>
      </div>
      <div style={{width: "33%", display: "inline-block", float: "left"}}>
        <h3 style={{textAlign: "center", fontSize: "48px", borderRight: "1px solid #16e5cd", margin: "15px 0px"}}>{this.state.bountiesAccepted}</h3>
        <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: "rgb(255, 184, 21)"}}>ACCEPTED</p>
      </div>
      <div style={{width: "33%", display: "inline-block", float: "left"}}>
      <h3 style={{textAlign: "center", fontSize: "48px", margin: "15px 0px"}}>{parseInt(100*this.state.bountiesRate)}<b style={{fontSize: "18px"}}>%</b></h3>
        <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: "rgb(255, 184, 21)"}}>ACCEPTANCE RATE</p>
      </div>
    </div>
    {bountiesList}
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
          <p style={{fontSize: "18px", textAlign: "center"}}>To perform this action, you need to use a web3 enabled browser. We suggest using the <a href="https://metamask.io" target="_blank" style={{textDecoration: "none", color: "#16e5cd"}}> Metamask </a> browser extension.</p>
            </div>
        </Dialog>
        <div id={"colourBodyLight"} style={{minHeight: "100vh", position: "relative", overflow: "hidden"}}>
        <div style={{position: "fixed", bottom: "15px", left: "15px", display: "block", overflow: "hidden", width: "100px"}} className="CornerEmoji">
        </div>
        <div style={{overflow: "hidden"}} className="navBar">
          <a href="/" style={{width: "276px", overflow: "hidden", display: "block", padding: "1em 0em 1em 0em", margin: "0 auto"}}>
            <div style={{backgroundImage:  `url(${logo})`, height: "3em", width: "14em", backgroundSize: "contain", backgroundRepeat: "no-repeat", display: "block", float: "left", marginLeft: "57px"}}>
            </div>
          </a>
          <span style={{backgroundSize: 'cover', backgroundRepeat: 'no-repeat', borderRadius: '50%', boxShadow: 'inset rgba(255, 255, 255, 0.6) 0 2px 2px, inset rgba(0, 0, 0, 0.3) 0 -2px 6px'}} />
<FlatButton href="/newBounty/" style={{backgroundColor: "rgba(0,0,0,0)", border: "1px solid #16e5cd", color: "#16e5cd", width: "150px", float: "right", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "30px"}} > New Bounty </FlatButton>
        </div>
        {(this.state.loadingBounties || this.state.loadingFulfillments || this.state.loadingStats) &&
          <div style={{width: "100%", marginTop: "60px"}}>
            <div style={{margin: "0 auto", width: "42px", overflow: "hidden", }}>
            <Halogen.ScaleLoader color={"#16e5cd"} />
            </div>
          </div>
        }
        {
          !(this.state.loadingBounties || this.state.loadingFulfillments || this.state.loadingStats) &&
          <div style={{ display: "block", overflow: "hidden", width: "1050px", margin: "0 auto", paddingBottom: "160px"}}>


            <div style={{float: "left", margin: "15px 15px 15px 15px", width: "960px", display: "inline-block", backgroundColor: "rgb(249, 249, 249)" , padding: "30px", color: "rgb(25, 55, 83)"}}>

                <div style={{float: "left", display: "inline-block", width: "72px"}}>
                  <Blockies
                    seed={this.state.userAddress}
                    size={9}
                    scale={8}
                    style={{borderRadius: "100px", display: "inline-block", float: "left"}}
                    className={"identicon"}
                  />
                </div>
                <div style={{float: "left", display: "inline-block", paddingLeft: "30px", width: "600px"}}>
                <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px"}}><b style={{color:"rgb(255, 184, 21)", fontWeight: "500"}}>User Address:</b></p>
                  <h3 style={{margin: "0px", width: "100%", display: "inline", fontWeight: "500", marginTop: "30px"}}>
                    <a style={{color: "#16e5cd"}} target={"_blank"} href={"https://etherscan.io/address/"+ this.state.userAddress}>{this.state.userAddress}</a>
                  </h3>
                  <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px"}}><b style={{color: "rgb(255, 184, 21)", fontWeight: "500"}}>Contact user:</b> { contactString}</p>
                  {myCategories.length > 0 && <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px"}}><b style={{color:  "rgb(255, 184, 21)", fontWeight: "500"}}>Skills:</b></p>}


                </div>

              </div>
              <div style={{float: "left", margin: "0 15px 15px 15px", width: "442px", display: "inline-block", backgroundColor: "rgb(249, 249, 249)" , padding: "30px"}}>
                {bountiesUI}

              </div>
              <div style={{float: "left", margin: "0 15px 15px 0px", width: "442px", display: "inline-block", backgroundColor: "rgb(249, 249, 249)" , padding: "30px"}}>
                {fulUI}

              </div>
              <div style={{float: "left", display: "block", margin: "0 15px", width: "1000px"}}>
              {this.state.accounts.length === 0 ||
                (this.state.userAddress.toLowerCase() !== this.state.accounts[0].toLowerCase() && !this.state.loading)
                &&
                <form className='Contribute' onSubmit={this.handleComment} style={{width: "960px", display: "inline-block", backgroundColor: "rgb(249, 249, 249)", padding: "30px", color: "rgb(25, 55, 83)"}}>
                  <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center",  fontWeight: "600", color: "rgb(25, 55, 83)"}}>Comment on User</h4>
                  <label htmlFor='comment_title' style={{fontSize: "12px", display: "block"}}>Title</label>
                  <input id='comment_title' className='SendAmount' type='text' style={{width: "940px", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}/>
                  <label htmlFor='comment_description' style={{fontSize: "12px", display: "block", marginTop: "15px"}}>Description</label>
                  <textarea id='comment_description' cols="60" rows="3" className='ContractCode' type='text' style={{width: "940px", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}></textarea>
                  {this.state.commentError &&
                    <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "10px", textAlign: "center"}}>{this.state.commentError}</p>}
                  <button type='submit'  className='AddBtn' style={{backgroundColor: "rgb(25, 55, 83)", border:"0px", color: "white",  display: "block", padding: "16px", margin: "0 auto", marginTop: "15px", fontSize: "1em", width: "200px"}}>Comment</button>
                </form>
              }
              {comments}
              </div>
            </div>
        }

          <p style={{textAlign: "center", display: "block", fontSize: "10px", padding: "15px 0px", color: "rgb(25, 55, 83)", width: "100%", position: "absolute", bottom: "0px"}}>&copy; Bounties Network, a <a href="https://ConsenSys.net" target="_blank" style={{textDecoration: "none", color: "rgb(25, 55, 83)"}}>ConsenSys</a> Formation <br/>
           <a href="/privacyPolicy/" target="_blank" style={{color: "rgb(25, 55, 83)"}}>Privacy Policy</a>{" | "}<a href="/terms/" target="_blank" style={{color: "rgb(25, 55, 83)"}}>Terms of Service</a>
           </p>
        </div>
      </div>
    )
  }
}

export default UserPage
