import React, { Component } from 'react'
import './BountyPage.css'


const json = require('../../../contracts.json');

import { Link } from 'react-router';



const networkId = json.networkId;

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));

const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const BigNumber = require('bignumber.js');

const utf8 = require('utf8');

const moment = require('moment');

import logo from '../AppContainer/images/logo.svg';
import logoBounties from '../AppContainer/images/logo-bounties.svg';

import darkMoon from '../AppContainer/images/DarkMoon.png';
import lightMoon from '../AppContainer/images/LightMoon.png';


import hexagonImage from './images/hexagon.svg';

import BountiesFacts from 'components/BountiesFacts/BountiesFacts';

import LinearProgress from 'material-ui/LinearProgress';

import ActivateForm from 'components/ActivateForm/ActivateForm';
import EditForm from 'components/EditForm/EditForm';
import ChangeDeadlineForm from 'components/ChangeDeadlineForm/ChangeDeadlineForm';
import TransferOwnershipForm from 'components/TransferOwnershipForm/TransferOwnershipForm';
import ExtendDeadlineForm from 'components/ExtendDeadlineForm/ExtendDeadlineForm';
import KillBountyForm from 'components/KillBountyForm/KillBountyForm';
import IncreasePayoutForm from 'components/IncreasePayoutForm/IncreasePayoutForm';
import ChangePayoutForm from 'components/ChangePayoutForm/ChangePayoutForm';


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
import SvgDown from 'material-ui/svg-icons/content/add';
import SvgUp from 'material-ui/svg-icons/content/remove';
import SvgTwitter from 'material-ui-community-icons/icons/twitter';
import SvgFacebook from 'material-ui-community-icons/icons/facebook';
import SvgReddit from 'material-ui-community-icons/icons/reddit';
import SvgCheck from 'material-ui/svg-icons/action/check-circle';


import DocumentMeta from 'react-document-meta';

import {Helmet} from "react-helmet";


import Dialog from 'material-ui/Dialog';

import {Tabs, Tab} from 'material-ui/Tabs';

import Avatar from 'material-ui/Avatar';

import Halogen from 'halogen';

import Blockies from 'react-blockies';

import Text from 'react-format-text';

const ipfsAPI = require('ipfs-api');

var ipfsNew = ipfsAPI({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

class TabTemplate extends Component {
    render() {
        if (!this.props.selected) {
            return null;
        }

        return this.props.children;
    }
}


class BountyPage extends Component {
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
      if (this.props.version === "v0"){
        standardBountiesAddress = json.mainNet.standardBountiesAddress.v0;
      } else {
        standardBountiesAddress = json.mainNet.standardBountiesAddress.v1;
      }
      userCommentsAddress = json.mainNet.userCommentsAddress;
      networkName = "Main Network";
      localStorage.setItem('ethereumNetwork', "MainNet");
    } else {
      if (stored === "MainNet"){
        providerLink = "https://mainnet.infura.io";
        requiredNetwork = 1;
        if (this.props.version === "v0"){
          standardBountiesAddress = json.mainNet.standardBountiesAddress.v0;
        } else {
          standardBountiesAddress = json.mainNet.standardBountiesAddress.v1;
        }
        userCommentsAddress = json.mainNet.userCommentsAddress;
        networkName = "Main Network";


      } else if (stored === "Rinkeby"){
        providerLink = "https://rinkeby.infura.io";
        requiredNetwork = 4;
        if (this.props.version === "v0"){
          standardBountiesAddress = json.rinkeby.standardBountiesAddress.v0;
        } else {
          standardBountiesAddress = json.rinkeby.standardBountiesAddress.v1;
        }
        userCommentsAddress = json.rinkeby.userCommentsAddress;
        networkName = "Rinkeby Network";
      }

    }
    web3.setProvider(new Web3.providers.HttpProvider(providerLink));

    this.state = {
      modalError: "",
      loadingInitial: true,
      accounts: [],
      contracts: [],
      fulfillments: [],
      bounties: [],
      total: 0,
      totalMe: 0,
      loadingBounty: true,
      loadingFulfillments: true,
      modalOpen: false,
      comments: [],
      sourceFileName: "",
      sourceFileHash: "",
      sourceDirectoryHash: "",
      bountyAddr: this.props.params.id,
      bountyData: {
        title: "",
        sourceFileName: "",
        sourceFileHash: "",
        description: "",
        categories: []},
      contractAddr: "0x0",
      issuerContact: "0x0",
      shouldOpen: false,
      value: 0,
      stage: "",
      mine: false,
      issuer: "0x0",
      fulfillments: [],
      numMilestones: 0,
      balance: 0,
      bountyBroken: "false",
        prices: {},
        bountyId: this.props.params.id,
        myComments: [],
        commentError: "",
        contributionError: "",
        fulfillmentError: "",
        transferError: "",
        deadlineError: "",
        increasePayoutError: "",
        changePayoutError: "",
        descriptionError: "",
        editDescription: false,
        titleError: "",
        editTitle: false,
        tabValue: 0,
        mainTabValue: 0,
        txModalOpen: false,
        txLoadingAmount: 0,
        txLoadingMessage: "",
        editSourceFileName: "",
        editSourceFileHash: "",
        editSourceDirectoryHash: "",
        noWeb3Error: false,
        fulfillmentOpen: false,
        commentOnBountyOpen: false,
        containsCode: false,
        requiredNetwork: requiredNetwork,
        networkName: networkName,
        standardBountiesAddress: standardBountiesAddress,
        userCommentsAddress: userCommentsAddress,
        StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(standardBountiesAddress),
        UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(userCommentsAddress),
        version: this.props.params.version,
        baseURL: "http://a2e716ea2144911e898ed02122fce8e2-236283655.us-east-1.elb.amazonaws.com:83"

    }
    this.ipfsApi = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: "https"});

    this.getInitialData = this.getInitialData.bind(this);
    this.getComments = this.getComments.bind(this);

    this.handleFulfill = this.handleFulfill.bind(this);
    this.handleActivate = this.handleActivate.bind(this);
    this.handleContribute = this.handleContribute.bind(this);
    this.handleAccept = this.handleAccept.bind(this);
    this.handleDeadline = this.handleDeadline.bind(this);
    this.handleKill = this.handleKill.bind(this);
    this.handleMilestoneChange = this.handleMilestoneChange.bind(this);
    this.handleTransfer = this.handleTransfer.bind(this);
    this.handleComment = this.handleComment.bind(this);
    this.handleCommentOnFulfillment = this.handleCommentOnFulfillment.bind(this);
    this.handleToggleFulfillment = this.handleToggleFulfillment.bind(this);
    this.handleToggleComment = this.handleToggleComment.bind(this);


    this.handleIncreasePayout = this.handleIncreasePayout.bind(this);
    this.handleChangePayout = this.handleChangePayout.bind(this);
    this.handlecaptureFile = this.handlecaptureFile.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleTabsChange = this.handleTabsChange.bind(this);
    this.handleMainTabsChange = this.handleMainTabsChange.bind(this);
    this.handleCloseTxLoading = this.handleCloseTxLoading.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleCaptureEditFile = this.handleCaptureEditFile.bind(this);
    this.saveToIpfsEdit = this.saveToIpfsEdit.bind(this);
    this.handleCloseNoWeb3 = this.handleCloseNoWeb3.bind(this);
    this.handleExpandComment = this.handleExpandComment.bind(this);

    this.handleChangeNetwork = this.handleChangeNetwork.bind(this);

    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);

    this.getPrices = this.getPrices.bind(this);

    this.getBounty = this.getBounty.bind(this);
    this.getCategories = this.getCategories.bind(this);
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
  getPrices(){

    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://api.coinmarketcap.com/v1/ticker/?convert=USD&limit=100", false);
    //xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    var response = JSON.parse(xhttp.responseText);
    var prices = {};
    for (var i = 0; i < response.length; i++){
      prices[response[i].symbol] = response[i].price_usd;
    }
    this.setState({prices: prices});


  }

  handleTabsChange(value){
    this.setState({
      tabValue: value,
    });
  }
  handleMainTabsChange(value){
    this.setState({
      mainTabValue: value,
    });
  }
  handleCaptureEditFile (event) {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
    this.setState({editSourceFileName: file.name, editDidUploadFile: true});


    let reader = new window.FileReader()
    reader.onloadend = () => this.saveToIpfsEdit(reader)
    reader.readAsArrayBuffer(file)
  }
  saveToIpfsEdit (reader) {
    let ipfsId

    const buffer = Buffer.from(reader.result);
    console.log("about to save...", buffer, reader);

    ipfsNew.add([{path: "/bounties/" + this.state.editSourceFileName, content: buffer}], (err, response)=> {
      console.log("response", response);
      this.setState({editSourceDirectoryHash: response[1].hash, editFileUploadFinished: true});
    });


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

  getInitialData(){
    window.loaded = true;

    if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
      // Use Mist/MetaMask's provider
      web3.setProvider(window.web3.currentProvider);

      web3.version.getNetwork((err, netId) => {
        if (parseInt(netId, 10) > 10000){
          if (this.state.version === "v0"){
            this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.localhost.standardBountiesAddress.v0),
                           UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.localhost.userCommentsAddress),
                           selectedNetwork: netId});
          } else if (this.state.version === "v1"){
            this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.localhost.standardBountiesAddress.v1),
                           UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.localhost.userCommentsAddress),
                           selectedNetwork: netId});
          }

        } else if (netId === "1"){
          this.setState({modalError: ("Please change your Ethereum network to the Rinkeby network"), modalOpen: true});


        } else if (netId === "4"){
          if (this.state.version == "v0"){
            this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v0),
                           UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.rinkeby.userCommentsAddress),
                           selectedNetwork: netId,
                          baseURL: "https://staging.api.bounties.network"});
          } else if (this.state.version == "v1"){
            this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v1),
                           UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.rinkeby.userCommentsAddress),
                           selectedNetwork: netId,
                          baseURL: "https://staging.api.bounties.network"});
          }

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


            this.getBounty();
            this.getCategories();

          }
        }
          }.bind(this));

      });

    } else {
      this.getBounty();
      this.getCategories();
    }

  }
  getCategories(){
    fetch(this.state.baseURL+"/category/?limit=1000")
      .then(function(response) {
        return response.json();

      }.bind(this)).then(function(json) {
        console.log('parsed json', json);
        var categories = [];

        for (var i = 0; i < json.results.length; i++){
          categories.push({label: json.results[i].name, value: json.results[i].normalized_name});
        }

        this.setState({categoryOptions: categories});



      }.bind(this)).catch(function(ex) {
        console.log('parsing failed', ex)
      });
  }
  getBounty(){
    fetch(this.state.baseURL+"/bounty/?limit=1&bounty_id="+this.state.bountyId)
      .then(function(response) {
        return response.json();

      }.bind(this)).then(function(json) {
        console.log('parsed json', json);
        var newBounty = json.results[0];
        var deadlineString = moment(newBounty.deadline, 'YYYY-MM-DDThh:mm:ssZ').fromNow();
        console.log("deadline", deadlineString);
        var valueTokens = 0;
        var balanceTokens = 0;
        if (newBounty.tokenSymbol == "ETH"){
          valueTokens = web3.fromWei(parseInt(newBounty.fulfillmentAmount, 10), 'ether');
          balanceTokens = web3.fromWei(parseInt(newBounty.balance, 10), 'ether');
        } else {
          var decimals = parseInt(newBounty.tokenDecimals, 10);
          var fulAmount = new BigNumber(newBounty.fulfillmentAmount, 10);
          var balAmount = new BigNumber(newBounty.balance, 10);
          var decimalToMult = new BigNumber(10, 10);
          var decimalUnits = new BigNumber(decimals, 10);
          decimalToMult = decimalToMult.pow(decimalUnits);
          fulAmount = fulAmount.div(decimalToMult);
          balAmount = balAmount.div(decimalToMult);
          valueTokens = fulAmount.toString();
          balanceTokens = balAmount.toString();
        }
        var bountyStage = "Draft";

        if (newBounty.bountyStage == "1"){
          bountyStage = "Active";
        } else if (newBounty.bountyStage == "2"){
          bountyStage = "Completed";
        } else if (newBounty.bountyStage == "3"){
          bountyStage = "Expired";
        } else if (newBounty.bountyStage == "4"){
          bountyStage = "Dead";
        }
        this.setState({issuer: newBounty.issuer,
                      deadline: newBounty.deadline,
                      deadlineString: deadlineString,
                      value: valueTokens,
                      balance: balanceTokens,
                      paysTokens: newBounty.paysTokens,
                      stage: bountyStage,
                      title: newBounty.title,
                      description: newBounty.description,
                      sourceFileName: newBounty.sourceFileName,
                      sourceDirectoryHash: newBounty.sourceDirectoryHash,
                      contact: newBounty.issuer_email,
                      categories: newBounty.data_categories,
                      symbol: newBounty.tokenSymbol,
                      mine: (newBounty.issuer === this.state.accounts[0]),
                      loadingBounty: false,
                      usdValue: newBounty.usd_price,
                      webLink: newBounty.webReferenceURL,
                      optionsValue: newBounty.data_categories? newBounty.data_categories.join(",").toLowerCase() : ""});



      }.bind(this)).catch(function(ex) {
        console.log('parsing failed', ex)
      });

      fetch(this.state.baseURL+"/fulfillment/?limit=1000&bounty="+this.state.bountyId)
        .then(function(response) {
          return response.json();

        }.bind(this)).then(function(json) {
          console.log('parsed ful', json);

          this.setState({fulfillments: json.results,
                        loadingFulfillments: false});



        }.bind(this)).catch(function(ex) {
          console.log('parsing failed', ex)
        });

  }

  getComments(){
    this.state.UserCommentsContract.numComments((err, succ)=> {
      var total = parseInt(succ, 10);
      var comments = [];

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
          var max = new BigNumber(8640000000000000);
          if ((succ[5].times(1000)).greaterThan(max)){
            newDate = new Date(parseInt(max, 10));
            dateString = this.dateToString(8640000000000000);
          } else {
            newDate = new Date(parseInt(succ[5], 10)*1000);
            dateString = this.dateToString(parseInt(succ[5], 10)*1000);
          }

          ipfs.catJSON(succ[0], (err, result)=> {
            comments.push({title: result.title,
                          from: from,
                          to: to,
                          aboutBounty: aboutBounty,
                          bountyId: parseInt(bountyId, 10),
                          description: result.description,
                          date: newDate.toUTCString(),
                          dateString: dateString,
                          aboutFulfillment: result.aboutFulfillment,
                          fulfillment_id: result.fulfillmentId,
                          version: result.version || "v0" });

            if (comments.length === total){
              var myComments = [];
              this.setState({comments: comments});
              for (i = 0; i < this.state.comments.length; i++){
                if (this.state.comments[i].version == this.state.version){
                  if (this.state.comments[i].aboutBounty && this.state.comments[i].bountyId == this.state.bountyId && this.state.comments[i].aboutFulfillment !== true){
                    myComments.push(this.state.comments[i]);
                  }
                  if (this.state.comments[i].aboutBounty && this.state.comments[i].bountyId == this.state.bountyId && this.state.comments[i].aboutFulfillment === true){
                    var fulfillments = this.state.fulfillments;
                    fulfillments[this.state.comments[i].fulfillment_id].comments.push(this.state.comments[i]);
                  }
                }
              }
              this.setState({myComments: myComments});
            }
          });
        });
      }
    });
  }

  handleFulfill(evt){
    evt.preventDefault();
    if (this.state.accounts.length === 0){
      this.setState({noWeb3Error: true});
    } else {
      var data = evt.target.bug_description.value;
      var contact = evt.target.contact.value;
      if (data === "" && this.state.sourceFileName === ""){
        this.setState({fulfillmentError: "Empty submissions are not allowed!"});
      } else {
        this.setState({fulfillmentError: ""});
        this.setState({txModalOpen: true, txLoadingAmount: 10});
        this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to fulfill the bounty"});

        ipfs.addJSON({
          payload: {
            description: data,
            sourceFileName: this.state.sourceFileName,
            sourceDirectoryHash: this.state.sourceDirectoryHash,
            sourceFileHash: this.state.sourceFileHash,
            fulfiller: {
              email: contact,
              address: this.state.accounts[0]
            }
          },
          meta: {
            platform: 'bounties-network',
            schemaVersion: '0.1',
            schemaName: 'standardSchema'
          }
        }, (err, succ)=> {
          this.setState({txLoadingAmount: 40});

          this.state.StandardBounties.fulfillBounty(this.state.bountyId, succ, {from: this.state.accounts[0]}, (err, succ)=> {
            if (err){
              console.log("err", err);
              this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

            } else {
              console.log("tx success", succ);
              this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
              var hasSucceeded = false;
              setInterval(function() {
                if (!hasSucceeded){
                  web3.eth.getTransaction(succ, (err, succ)=> {
                    if (succ.blockNumber){
                      this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                      hasSucceeded = true;
                      setTimeout(function(){
                          window.location.reload();

                      }, 3000);
                    }
                  });
                }
              }.bind(this), 100);
            }
          });
        });
      }
    }

  }

  handleContribute(evt){
    evt.preventDefault();
    if (this.state.accounts.length === 0){
      this.setState({noWeb3Error: true});
    } else {
      var amount = evt.target.deposit_amount.value;
      if (amount === "" || amount === "0"){
        this.setState({contributionError: "The new payout cannot be 0 or empty"});
      } else {
        this.setState({contributionError: ""});
        this.setState({txModalOpen: true, txLoadingAmount: 10});
        if (!this.state.paysTokens){
          var num = web3.toWei(amount ,'ether');
          this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to contribute to this bounty"});
          this.state.StandardBounties.contribute(this.state.bountyId, num, {from: this.state.accounts[0], value: num}, (err, succ)=> {
            if (err){
              console.log("err", err);
              this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

            } else {
              console.log("tx success", succ);
              this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
              var hasSucceeded = false;
              setInterval(function() {
                if (!hasSucceeded){
                  web3.eth.getTransaction(succ, (err, succ)=> {
                    if (succ.blockNumber){
                      this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                      hasSucceeded = true;
                      setTimeout(function(){
                          window.location.reload();

                      }, 3000);
                    }
                  });
                }
              }.bind(this), 100);
            }
          });
        } else {
          this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to send tokens to this bounty"});

          var newAmount = new BigNumber(amount, 10);
          var decimalToMult = new BigNumber(10, 10);
          var decimalUnits = new BigNumber(this.state.decimals, 10);
          decimalToMult = decimalToMult.pow(decimalUnits);
          newAmount = newAmount.mul(decimalToMult);

          this.state.tokenContract.approve(this.state.StandardBounties.address, parseInt(newAmount, 10), {from: this.state.accounts[0]}, (err, succ)=> {
            if (err){
              console.log("err", err);
              this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

            } else {
              this.setState({txLoadingAmount: 40, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
              var hasSucceeded = false;
              setInterval(function() {
                if (!hasSucceeded){
                  web3.eth.getTransaction(succ, (err, succ)=> {
                    if (succ.blockNumber){
                      this.setState({txLoadingMessage: "Please confirm your transaction to complete your contribution to the bounty", txLoadingAmount: 60});
                      hasSucceeded = true;
                      setTimeout(function(){
                        this.state.StandardBounties.contribute(this.state.bountyId, parseInt(newAmount, 10), {from: this.state.accounts[0]}, (err, succ)=> {
                          if (err){
                            console.log("err", err);
                            this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

                          } else {
                            console.log("tx success", succ);
                            this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
                            var hasSucceeded = false;
                            setInterval(function() {
                              if (!hasSucceeded){
                                web3.eth.getTransaction(succ, (err, succ)=> {
                                  if (succ.blockNumber){
                                    this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                                    hasSucceeded = true;
                                    setTimeout(function(){
                                        window.location.reload();
                                    }, 3000);
                                  }
                                });
                              }
                            }.bind(this), 100);
                          }
                        });

                      }.bind(this), 3000);
                    }
                  });
                }
              }.bind(this), 100);
            }

          });
        }
      }
    }



  }

  handleChangeDescriptionEdit(evt) {
    evt.preventDefault();

    this.setState({editDescription: !this.state.editDescription});
  }

  handleEdit(evt){
    evt.preventDefault();

    var description = evt.target.description.value;
    var title = evt.target.title.value;
    var contact = evt.target.contact.value;

    if (description === ""){
      this.setState({descriptionError: "Please enter a valid bounty description"});
    } else {
      this.setState({descriptionError: ""});
      var newData = {
        title: title,
        description: description,
        sourceFileHash: this.state.editSourceFileHash,
        sourceFileName: this.state.editSourceFileName,
        sourceDirectoryHash: this.state.editSourceDirectoryHash,
        contact: contact,
        categories: this.state.optionsList
      };
      console.log("about to add", newData);
      this.setState({txModalOpen: true, txLoadingAmount: 10});
      this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to edit the bounty"});
      ipfs.addJSON(newData, (err, result)=>{
        this.setState({txLoadingAmount: 40});
        this.state.StandardBounties.changeBountyData(this.state.bountyId, result, {from: this.state.accounts[0]}, (err, succ)=> {
          if (err){
            console.log("err", err);
            this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

          } else {
            console.log("tx success", succ);
            this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
            var hasSucceeded = false;
            setInterval(function() {
              if (!hasSucceeded){
                web3.eth.getTransaction(succ, (err, succ)=> {
                  if (succ.blockNumber){
                    this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                    hasSucceeded = true;
                    setTimeout(function(){
                        window.location.reload();

                    }, 3000);
                  }
                });
              }
            }.bind(this), 100);
          }
        });
      });

    }

  }
  handleChangeTitleEdit(evt) {
    evt.preventDefault();

    this.setState({editTitle: !this.state.editTitle});
  }

  handleSubmitNewTitle(evt){
    evt.preventDefault();

    var title = evt.target.title.value;

    if (title === ""){
      this.setState({titleError: "Please enter a valid bounty title"});
    } else {
      this.setState({titleError: ""});
      var newData = {
        title: title,
        description: this.state.description,
        sourceFileHash: this.state.sourceFileHash,
        sourceFileName: this.state.sourceFileName,
        sourceDirectoryHash: this.state.sourceDirectoryHash,
        contact: this.state.contact,
        categories: this.state.categories
      };
      this.setState({txModalOpen: true, txLoadingAmount: 10});
      this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to change the bounty title"});
      ipfs.addJSON(newData, (err, result)=>{
        this.setState({txLoadingAmount: 40});

        this.state.StandardBounties.changeBountyData(this.state.bountyId, result, {from: this.state.accounts[0]}, (err, succ)=> {
          if (err){
            console.log("err", err);
            this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

          } else {
            console.log("tx success", succ);
            this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
            var hasSucceeded = false;
            setInterval(function() {
              if (!hasSucceeded){
                web3.eth.getTransaction(succ, (err, succ)=> {
                  if (succ.blockNumber){
                    this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                    hasSucceeded = true;
                    setTimeout(function(){
                        window.location.reload();

                    }, 3000);
                  }
                });
              }
            }.bind(this), 100);
          }
        });
      });

    }

  }
  handlecaptureFile (event) {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
    this.setState({sourceFileName: file.name, didUploadFile: true});


    let reader = new window.FileReader()
    reader.onloadend = () => this.saveToIpfs(reader)
    reader.readAsArrayBuffer(file)
  }
  saveToIpfs (reader) {
    let ipfsId;
    // eslint-disable-next-line
    const buffer = Buffer.from(reader.result);

    ipfsNew.add([{path: "/bounties/" + this.state.sourceFileName, content: buffer}], (err, response)=> {

      console.log("response", response);
      this.setState({sourceDirectoryHash: response[1].hash, fileUploadFinished: true});
    });

  }
isAddress(address) {
    // function isAddress(address) {

        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        console.log("not address");
        return false;

    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return "true
        return true;
    } else {
        // Otherwise check each case
        return true;
    }
}
handleCloseTxLoading(){
  this.setState({txModalOpen: false});
}
handleExpandComment(i){
  var fulfillments = this.state.fulfillments;
  fulfillments[i].commentsOpen = !fulfillments[i].commentsOpen;
  this.setState({fulfillments: fulfillments});
}
handleToggleFulfillment(){
  var newOpen = !this.state.fulfillmentOpen;
  this.setState({fulfillmentOpen: newOpen});
}
handleToggleComment(){
  var newOpen = !this.state.commentOnBountyOpen;
  this.setState({commentOnBountyOpen: newOpen});
}


isChecksumAddress(address) {
    // Check each case
    address = address.replace('0x','');
    var addressHash = web3.sha3(address.toLowerCase());
    for (var i = 0; i < 40; i++ ) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
          console.log("not checksum");
            return false;
        }
    }
    return true;
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
      this.setState({txModalOpen: true, txLoadingAmount: 10});
      this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to comment on the bounty"});
      ipfs.addJSON({title: title, description: description, version: this.state.version}, (err, succ)=> {
        this.setState({txLoadingAmount: 40});
        this.state.UserCommentsContract.addComment(succ, 0x0, true, this.state.bountyId, {from: this.state.accounts[0]}, (err, succ)=> {
          if (err){
            console.log("err", err);
            this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

          } else {
            console.log("tx success", succ);
            this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
            var hasSucceeded = false;
            setInterval(function() {
              if (!hasSucceeded){
                web3.eth.getTransaction(succ, (err, succ)=> {
                  if (succ.blockNumber){
                    this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                    hasSucceeded = true;
                    setTimeout(function(){
                        window.location.reload();

                    }, 3000);
                  }
                });
              }
            }.bind(this), 100);
          }
        });
      })
    }
  }
  }
  handleCommentOnFulfillment(evt){
    evt.preventDefault();
    console.log("comment on evt", evt.target.comment_index.value);

    if (this.state.accounts.length === 0){
      this.setState({noWeb3Error: true});
    } else {
    var index = evt.target.comment_index.value;
    var description = evt.target.comment_description.value;

    if (description === ""){
      var fulfillments = this.state.fulfillments;
      fulfillments[index].commentError = "Please add a valid comment";
      this.setState({fulfillments: fulfillments});
    } else {
      var fulfillments = this.state.fulfillments;
      fulfillments[index].commentError = "";
      this.setState({fulfillments: fulfillments});

      this.setState({txModalOpen: true, txLoadingAmount: 10});
      this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to comment on the bounty"});
      ipfs.addJSON({description: description, aboutFulfillment: true, fulfillmentId: index}, (err, succ)=> {
        this.setState({txLoadingAmount: 40});
        this.state.UserCommentsContract.addComment(succ, 0x0, true, this.state.bountyId, {from: this.state.accounts[0]}, (err, succ)=> {
          if (err){
            console.log("err", err);
            this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

          } else {
            console.log("tx success", succ);
            this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
            var hasSucceeded = false;
            setInterval(function() {
              if (!hasSucceeded){
                web3.eth.getTransaction(succ, (err, succ)=> {
                  if (succ.blockNumber){
                    this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                    hasSucceeded = true;
                    setTimeout(function(){
                        window.location.reload();

                    }, 3000);
                  }
                });
              }
            }.bind(this), 100);
          }
        });
      })
    }
  }
  }

  handleActivate(evt){
    evt.preventDefault();

    var amount = evt.target.deposit_amount.value;

    if (!this.state.paysTokens){
      var num = web3.toWei(amount ,'ether');
      this.setState({txModalOpen: true, txLoadingAmount: 10});
      this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to activate the bounty"});
      this.state.StandardBounties.activateBounty(this.state.bountyId, num, {from: this.state.accounts[0], value: num}, (err, succ)=> {
        if (err){
          this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

        } else {
          console.log("tx success", succ);
          this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
          var hasSucceeded = false;
          setInterval(function() {
            if (!hasSucceeded){
              web3.eth.getTransaction(succ, (err, succ)=> {
                if (succ.blockNumber){
                  this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                  hasSucceeded = true;
                  setTimeout(function(){
                      window.location.reload();

                  }, 3000);
                }
              });
            }
          }.bind(this), 100);
        }
      });
    } else {
      if (amount !== 0){
        var newAmount = new BigNumber(amount, 10);
        var decimalToMult = new BigNumber(10, 10);
        var decimalUnits = new BigNumber(this.state.decimals, 10);
        decimalToMult = decimalToMult.pow(decimalUnits);
        newAmount = newAmount.mul(decimalToMult);
        this.setState({txModalOpen: true, txLoadingAmount: 10});
        this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to send tokens to this bounty"});

        this.state.tokenContract.approve(this.state.StandardBounties.address, parseInt(newAmount, 10), {from: this.state.accounts[0]}, (err, succ)=> {
          if (err){
            console.log("err", err);
            this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

          } else {
            this.setState({txLoadingAmount: 40, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
            var hasSucceeded = false;
            setInterval(function() {
              if (!hasSucceeded){
                web3.eth.getTransaction(succ, (err, succ)=> {
                  if (succ.blockNumber){
                    this.setState({txLoadingMessage: "Please confirm your transaction to complete bounty activation", txLoadingAmount: 60});
                    hasSucceeded = true;
                    setTimeout(function(){
                      this.state.StandardBounties.activateBounty(this.state.bountyId, parseInt(newAmount, 10), {from: this.state.accounts[0]},  (err, succ)=> {
                        if (err){
                          console.log("err", err);
                          this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

                        } else {
                          console.log("tx success", succ);
                          this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
                          var hasSucceeded = false;
                          setInterval(function() {
                            if (!hasSucceeded){
                              web3.eth.getTransaction(succ, (err, succ)=> {
                                if (succ.blockNumber){
                                  this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                                  hasSucceeded = true;
                                  setTimeout(function(){
                                      window.location.reload();
                                  }, 3000);
                                }
                              });
                            }
                          }.bind(this), 100);
                        }
                      });

                    }.bind(this), 3000);
                  }
                });
              }
            }.bind(this), 100);
          }

        });
      } else {
        this.setState({txModalOpen: true, txLoadingAmount: 10});
        this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to activate the bounty"});
        this.state.StandardBounties.activateBounty(this.state.bountyId, 0, {from: this.state.accounts[0]}, (err, succ)=> {
          if (err){
            console.log("err", err);
            this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

          } else {
            console.log("tx success", succ);
            this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
            var hasSucceeded = false;
            setInterval(function() {
              if (!hasSucceeded){
                web3.eth.getTransaction(succ, (err, succ)=> {
                  if (succ.blockNumber){
                    this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                    hasSucceeded = true;
                    setTimeout(function(){
                        window.location.reload();

                    }, 3000);
                  }
                });
              }
            }.bind(this), 100);
          }
        });
      }
    }
}

handleTransfer(evt){
  evt.preventDefault();

  var address = evt.target.newAddress.value;
  if (!this.isAddress(address)){
    this.setState({transferError: "You can only transfer the bounty to a valid Ethereum address"});
  } else {
    this.setState({transferError: ""});
    this.setState({txModalOpen: true, txLoadingAmount: 10});
    this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to transfer the bounty"});
    this.state.StandardBounties.transferIssuer(this.state.bountyId, address, {from: this.state.accounts[0]}, (err, succ)=> {
      if (err){
        console.log("err", err);
        this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

      } else {
        console.log("tx success", succ);
        this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
        var hasSucceeded = false;
        setInterval(function() {
          if (!hasSucceeded){
            web3.eth.getTransaction(succ, (err, succ)=> {
              if (succ.blockNumber){
                this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                hasSucceeded = true;
                setTimeout(function(){
                    window.location.reload();

                }, 3000);
              }
            });
          }
        }.bind(this), 100);
      }
    });
  }




}
handleIncreasePayout(evt){
  evt.preventDefault();

  var newPayout = evt.target.newPayout.value;
  var newDeposit = evt.target.newDeposit.value;
  if (newPayout === "" || newPayout === "0"){
    this.setState({increasePayoutError: "The new payout cannot be 0 or empty"});
  } else if (newPayout <= this.state.value){
    this.setState({increasePayoutError: "The new payout cannot be less than or equal to the current payout amount"});
  } else {
    this.setState({increasePayoutError: ""});
    var finalPayout;
    var finalDeposit;
    if (this.state.paysTokens){
      var newAmount = new BigNumber(newPayout, 10);
      var decimalToMult = new BigNumber(10, 10);
      var decimalUnits = new BigNumber(this.state.decimals, 10);
      decimalToMult = decimalToMult.pow(decimalUnits);
      newAmount = newAmount.mul(decimalToMult);
      finalPayout = parseInt(newAmount, 10);

      var newDepositAmount = new BigNumber(newDeposit, 10);
      var decimalToMult = new BigNumber(10, 10);
      var decimalUnits = new BigNumber(this.state.decimals, 10);
      decimalToMult = decimalToMult.pow(decimalUnits);
      newDepositAmount = newDepositAmount.mul(decimalToMult);
      finalDeposit = parseInt(newDepositAmount, 10);
      if (finalDeposit > 0){
        this.setState({txModalOpen: true, txLoadingAmount: 10});
        this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to deposit your new tokens into the bounty"});
        this.state.tokenContract.approve(this.state.StandardBounties.address, parseInt(finalDeposit, 10), {from: this.state.accounts[0]}, (err, succ)=> {
          if (err){
            console.log("err", err);
            this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

          } else {
            this.setState({txLoadingAmount: 40, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
            var hasSucceeded = false;
            setInterval(function() {
              if (!hasSucceeded){
                web3.eth.getTransaction(succ, (err, succ)=> {
                  if (succ.blockNumber){
                    this.setState({txLoadingMessage: "Please confirm your transaction to complete the increasing of the bounty reward", txLoadingAmount: 60});
                    hasSucceeded = true;
                    setTimeout(function(){
                      this.state.StandardBounties.increasePayout(this.state.bountyId, finalPayout, finalDeposit, {from: this.state.accounts[0], value: finalDeposit}, (err, succ)=> {
                        if (err){
                          console.log("err", err);
                          this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

                        } else {
                          console.log("tx success", succ);
                          this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
                          var hasSucceeded = false;
                          setInterval(function() {
                            if (!hasSucceeded){
                              web3.eth.getTransaction(succ, (err, succ)=> {
                                if (succ.blockNumber){
                                  this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                                  hasSucceeded = true;
                                  setTimeout(function(){
                                      window.location.reload();

                                  }, 3000);
                                }
                              });
                            }
                          }.bind(this), 100);
                        }
                      });

                    }.bind(this), 3000);
                  }
                });
              }
            }.bind(this), 100);
          }

        });
      } else {
        this.setState({txModalOpen: true, txLoadingAmount: 10});
        this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to increase the reward of the bounty"});
        this.state.StandardBounties.increasePayout(this.state.bountyId, finalPayout, 0, {from: this.state.accounts[0]}, (err, succ)=> {
          if (err){
            console.log("err", err);
            this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

          } else {
            console.log("tx success", succ);
            this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
            var hasSucceeded = false;
            setInterval(function() {
              if (!hasSucceeded){
                web3.eth.getTransaction(succ, (err, succ)=> {
                  if (succ.blockNumber){
                    this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                    hasSucceeded = true;
                    setTimeout(function(){
                        window.location.reload();

                    }, 3000);
                  }
                });
              }
            }.bind(this), 100);
          }
        });
      }



    } else {
      finalPayout = web3.toWei(newPayout, 'ether');
      finalDeposit = web3.toWei(newDeposit, 'ether');

      this.setState({txModalOpen: true, txLoadingAmount: 10});
      this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to increase the reward of the bounty"});
      this.state.StandardBounties.increasePayout(this.state.bountyId, finalPayout, finalDeposit, {from: this.state.accounts[0], value: finalDeposit}, (err, succ)=> {
        if (err){
          console.log("err", err);
          this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

        } else {
          console.log("tx success", succ);
          this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
          var hasSucceeded = false;
          setInterval(function() {
            if (!hasSucceeded){
              web3.eth.getTransaction(succ, (err, succ)=> {
                if (succ.blockNumber){
                  this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                  hasSucceeded = true;
                  setTimeout(function(){
                      window.location.reload();

                  }, 3000);
                }
              });
            }
          }.bind(this), 100);
        }
      });
    }

  }



}

handleChangePayout(evt){
  evt.preventDefault();

  var newPayout = evt.target.newPayout.value;
  if (newPayout === "" || newPayout === "0"){
    this.setState({changePayoutError: "The new payout cannot be 0 or empty"});
  } else {
    this.setState({changePayoutError: ""});
    var finalPayout = web3.toWei(newPayout, 'ether');

    if (this.state.paysTokens){
      var newAmount = new BigNumber(newPayout, 10);
      var decimalToMult = new BigNumber(10, 10);
      var decimalUnits = new BigNumber(this.state.decimals, 10);
      decimalToMult = decimalToMult.pow(decimalUnits);
      newAmount = newAmount.mul(decimalToMult);
      finalPayout = parseInt(newAmount, 10);
    }

    // TODO: calculate right token padding

    this.setState({txModalOpen: true, txLoadingAmount: 10});
    this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to change the reward of the bounty"});
    console.log("changing payout: ", this.state.bountyId, finalPayout);
    this.state.StandardBounties.changeBountyFulfillmentAmount(this.state.bountyId, finalPayout, {from: this.state.accounts[0]}, (err, succ)=> {
      if (err){
        console.log("err", err);
        this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

      } else {
        console.log("tx success", succ);
        this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
        var hasSucceeded = false;
        setInterval(function() {
          if (!hasSucceeded){
            web3.eth.getTransaction(succ, (err, succ)=> {
              if (succ.blockNumber){
                this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                hasSucceeded = true;
                setTimeout(function(){
                    window.location.reload();

                }, 3000);
              }
            });
          }
        }.bind(this), 100);
      }
    });


  }



}

handleDeadline(evt){
  evt.preventDefault();

  var deadline = evt.target.bounty_deadline.value;
  if (deadline === ""){
    this.setState({deadlineError: "Please enter a valid date"});
  } else {
    this.setState({deadlineError: ""});
    var deadline2 = new Date(deadline + "z");
    var date = deadline2.getTime()/1000|0;
    this.setState({txModalOpen: true, txLoadingAmount: 10});
    this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to extend the deadline of the bounty"});
    this.state.StandardBounties.extendDeadline(this.state.bountyId, date, {from: this.state.accounts[0]}, (err, succ)=> {
      if (err){
        console.log("err", err);
        this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

      } else {
        console.log("tx success", succ);
        this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
        var hasSucceeded = false;
        setInterval(function() {
          if (!hasSucceeded){
            web3.eth.getTransaction(succ, (err, succ)=> {
              if (succ.blockNumber){
                this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                hasSucceeded = true;
                setTimeout(function(){
                    window.location.reload();

                }, 3000);
              }
            });
          }
        }.bind(this), 100);
      }
    });
  }
}
handleDeadlineChange(evt){
  evt.preventDefault();

  var deadline = evt.target.bounty_deadline.value;
  if (deadline === ""){
    this.setState({deadlineError: "Please enter a valid date"});
  } else {
    this.setState({deadlineError: ""});
    var deadline2 = new Date(deadline + "z");
    var date = deadline2.getTime()/1000|0;

    this.setState({txModalOpen: true, txLoadingAmount: 10});
    this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to extend the deadline of the bounty"});

    this.state.StandardBounties.changeDeadline(this.state.bountyId, date, {from: this.state.accounts[0]}, (err, succ)=> {
      if (err){
        console.log("err", err);
        this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

      } else {
        console.log("tx success", succ);
        this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
        var hasSucceeded = false;
        setInterval(function() {
          if (!hasSucceeded){
            web3.eth.getTransaction(succ, (err, succ)=> {
              if (succ.blockNumber){
                this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
                hasSucceeded = true;
                setTimeout(function(){
                    window.location.reload();

                }, 3000);
              }
            });
          }
        }.bind(this), 100);
      }
    });
  }


}
handleKill(evt){
  evt.preventDefault();
  this.setState({txModalOpen: true, txLoadingAmount: 10});
  this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to kill the bounty"});
  this.state.StandardBounties.killBounty(this.state.bountyId, {from: this.state.accounts[0]}, (err, succ)=> {
    if (err){
      console.log("err", err);
      this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

    } else {
      console.log("tx success", succ);
      this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
      var hasSucceeded = false;
      setInterval(function() {
        if (!hasSucceeded){
          web3.eth.getTransaction(succ, (err, succ)=> {
            if (succ.blockNumber){
              this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
              hasSucceeded = true;
              setTimeout(function(){
                  window.location.reload();

              }, 3000);
            }
          });
        }
      }.bind(this), 100);
    }
  });


}

handleAccept(i){
  this.setState({txModalOpen: true, txLoadingAmount: 10});
  this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to accept the bounty submission"});
  console.log("about to accept", this.state.bountyId, i, this.state.accounts[0]);
  this.state.StandardBounties.acceptFulfillment(this.state.bountyId, i, {from: this.state.accounts[0]}, (err, succ)=> {
    if (err){
      console.log("err", err);
      this.setState({txLoadingMessage: "An error occurred. Please refresh the page and try again."});

    } else {
      console.log("tx success", succ);
      this.setState({txLoadingAmount: 80, txLoadingMessage: "Waiting for your transaction to be confirmed on the blockchain..."});
      var hasSucceeded = false;
      setInterval(function() {
        if (!hasSucceeded){
          web3.eth.getTransaction(succ, (err, succ)=> {
            if (succ.blockNumber){
              this.setState({txLoadingMessage: "Transaction confirmed!", txLoadingAmount: 100});
              hasSucceeded = true;
              setTimeout(function(){
                  window.location.reload();

              }, 3000);
            }
          });
        }
      }.bind(this), 100);
    }
  });

}
handleMilestoneChange (evt){
  this.setState({selectedMilestone: evt.target.value})
}
handleOpen () {
  this.setState({modalOpen: true});
}

handleClose(){
  this.setState({modalOpen: false});
  this.getInitialData();
}
handleSelectChange(value) {
  var optionsList = value.split(",");
  var containsCode = false;
  if (optionsList.includes("Code")|| optionsList.includes("Bugs")){
    containsCode = true;
  }
  this.setState({ optionsList: optionsList, optionsValue: value, containsCode: containsCode});
  this.forceUpdate();

}
handleCloseNoWeb3(){
  console.log("noWeb3");
  this.setState({noWeb3Error: false});

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
render() {



    var actions;
    var fulBody;
    var fileName;
    if (this.state.sourceFileName.length > 38){
      fileName = this.state.sourceFileName.substring(0,38) + "...";
    } else {
      fileName = this.state.sourceFileName;
    }
    if (this.state.mine){
      if (this.state.stage === "Draft"){
        console.log("categories", this.state.categoryOptions);
        actions=(
          <div style={{width: "100%"}}>
          <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "#f52a34"}} inkBarStyle={{backgroundColor: "rgb(255, 222, 70)", color: "#f52a34"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
            <Tab label="Activate Bounty" value={0} style={{color: this.state.tabValue === 0? ("#1D1749") : "#f52a34"}}>
              <ActivateForm onhandleActivate={this.handleActivate} tokenDetails={this.state.tokenDetails} amount={this.state.value}/>
            </Tab>
            <Tab label="Edit Bounty" value={1} style={{color: this.state.tabValue === 1? ("#1D1749") : "#f52a34"}}>
              <EditForm
              onHandleEdit={this.handleEdit}
              bountyData={this.state.bountyData}
              title={this.state.title}
              description={this.state.description}
              categories={this.state.categories}
              webURL={this.state.webURL}
              contact={this.state.contact}
              selectedValue={this.state.optionsValue}
              onHandleChangeSelected={this.handleSelectChange}
              onHandleCaptureEditFile={this.handleCaptureEditFile}
              sourceFileName={this.state.editSourceFileName}
              containsCode={this.state.containsCode}
              fileUploadFinished={this.state.editFileUploadFinished}
              didUploadFile={this.state.editDidUploadFile}
              categoryOptions={this.state.categoryOptions}
              />
            </Tab>
            <Tab label="Change Deadline" value={2} style={{color: this.state.tabValue === 2? ("#1D1749") : "#f52a34"}}>
              <ChangeDeadlineForm onhandleChangeDeadline={this.handleChangeDeadline} deadlineError={this.state.deadlineError} dateNum={this.state.dateString}/>
            </Tab>
            <Tab label="Transfer Ownership" value={3} style={{color: this.state.tabValue === 3? ("#1D1749") : "#f52a34"}}>
              <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
            </Tab>
            <Tab label="Change Prize" value={4} style={{color: this.state.tabValue === 4? ("#1D1749") : "#f52a34"}}>
              <ChangePayoutForm onhandleChange={this.handleChangePayout} changePayoutError={this.state.changePayoutError} symbol={this.state.symbol}/>
            </Tab>
          </Tabs>
          </div>
        );
      }  else if (this.state.stage === "Active"){

        actions = (
          <div style={{width: "100%"}}>
          <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "#f52a34"}} inkBarStyle={{backgroundColor: "rgb(255, 222, 70)", color: "#f52a34"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
            <Tab label="Extend Bounty Deadline" value={0} style={{color: this.state.tabValue === 0?("#1D1749") : "#f52a34"}}>
              <ExtendDeadlineForm onhandleDeadline={this.handleDeadline} deadlineError={this.state.deadlineError} dateNum={this.state.dateString}/>
            </Tab>
            <Tab label="Increase Prize" value={3} style={{color: this.state.tabValue === 3? ("#1D1749") : "#f52a34"}}>
              <IncreasePayoutForm onhandleIncrease={this.handleIncreasePayout} increasePayoutError={this.state.increasePayoutError} symbol={this.state.symbol}/>
            </Tab>
            <Tab label="Kill Bounty" value={1} style={{color: this.state.tabValue === 1? ("#1D1749") : "#f52a34"}}>
              <KillBountyForm onhandleKill={this.handleKill} />
            </Tab>
            <Tab label="Transfer Ownership" value={2} style={{color: this.state.tabValue === 2? ("#1D1749") : "#f52a34"}}>
              <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
            </Tab>
          </Tabs>
          </div>
        );
      } else if (this.state.stage === "Dead"){
         actions=(
           <div style={{width: "100%"}}>
           <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "#f52a34"}} inkBarStyle={{backgroundColor: "rgb(255, 222, 70)", color: "#f52a34"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
             <Tab label="Re-activate Bounty" value={0} style={{color: this.state.tabValue === 0? ("#1D1749") : "#f52a34"}}>
               <ActivateForm onhandleActivate={this.handleActivate} tokenDetails={this.state.tokenDetails} amount={this.state.value}/>
             </Tab>
             <Tab label="Extend Bounty Deadline" value={1} style={{color: this.state.tabValue === 1?("#1D1749") : "#f52a34"}}>
               <ExtendDeadlineForm onhandleDeadline={this.handleDeadline} deadlineError={this.state.deadlineError} dateNum={this.state.dateString}/>
             </Tab>
             <Tab label="Transfer Ownership" value={2} style={{color: this.state.tabValue === 2? ("#1D1749") : "#f52a34"}}>
               <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
             </Tab>
             <Tab label="Increase Prize" value={3} style={{color: this.state.tabValue === 3? ("#1D1749") : "#f52a34"}}>
               <IncreasePayoutForm onhandleIncrease={this.handleIncreasePayout} increasePayoutError={this.state.increasePayoutError} symbol={this.state.symbol}/>
             </Tab>
           </Tabs>
           </div>

        );
      }

    }



      var categories = [];
      if (this.state.categoryOptions){
        for (i = 0; i < this.state.categoryOptions.length; i++){

          categories.push(
            <Chip style={{margin: "0px 15px 5px 0px", float: "left", border: "1px solid #1D1749", backgroundColor: "#1D1749", height: "30px"}}
                  labelStyle={{color: "white", lineHeight: "28px"}}
                  key={this.state.categoryOptions[i].label}>
              {this.state.categoryOptions[i].label}
            </Chip>
          );
        }
      }
    var commentsArray = [];
    var comments;
    for (i = 0; i < this.state.myComments.length; i++){
      commentsArray.push(
        <div style={{display: "block", borderBottom: "0px solid #f52a34", marginBottom: "15px", overflow: "hidden"}} key={"comment: "+i}>
          <div style={{backgroundColor: "rgb(249,249,249)", display: "block", overflow: "hidden", padding: "15px", color: "rgb(25, 55, 83)"}}>
              <h5 style={{margin: "5px 0px", color :"rgb(25, 55, 83)"}}><b style={{fontSize: "16px"}}>{this.state.myComments[i].title}</b></h5>
              <Text style={{ fontSize: "14px", width: "100%", margin: "0px 10px 10px 0px", color: "#FFDE46", textDecoration: "none", display: "block", overflow: "hidden"}}>{this.state.myComments[i].description}</Text>

              <p style={{ fontSize: "12px", margin: "4px  10px 2.5px 0px", display: "inline-block", float: "left"}}><b style={{color: "#FFDE46"}}>By: </b></p>
              <Blockies
              seed={this.state.myComments[i].from}
              size={9}
              scale={2.5}
              style={{borderRadius: "10px", display: "inline-block", float: "left"}}
              />
              <p style={{ fontSize: "12px", margin: "4px  0px 4px 10px", display: "inline-block", float: "left"}}><Link style={{color: "#f52a34"}} target={"_blank"} to={"/user/"+ this.state.myComments[i].from}>{this.state.myComments[i].from}</Link></p>
              <p style={{ fontSize: "12px", margin: "4px  0px 4px 10px", display: "inline-block", float: "left", color: "rgb(208, 208, 208)"}}>{this.state.myComments[i].dateString}</p>
          </div>
        </div>
      );
    }
    comments = (
      <div style={{paddingTop: "30px", display: "block",  minHeight: "66vh"}}>
        <div style={{overflow: "hidden", display: "block", backgroundColor: "rgb(249, 249, 249)", position: "relative", padding: "30px", marginBottom: "30px",color: "rgb(25, 55, 83)"}}>
          <h4 onClick={this.handleToggleComment} style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "0px", textAlign: "center", fontSize: "1.17em", cursor: "pointer",  fontWeight: "600"}}>Comment on Bounty</h4>

          {!this.state.commentOnBountyOpen? <SvgDown onClick={this.handleToggleComment} style={{position: "absolute", right: "50px", top: "30px", width: "40px", height: "40px", color: "rgb(245, 42, 52)", marginTop: "-7px", cursor: "pointer"}}/>
        : <SvgUp onClick={this.handleToggleComment} style={{position: "absolute", right: "50px", top: "30px", width: "40px", height: "40px", color: "rgb(245, 42, 52)", marginTop: "-7px", cursor: "pointer"}}/>}

          {this.state.commentOnBountyOpen &&
            <form className='Contribute' onSubmit={this.handleComment} style={{width: "940px", display: "inline-block"}}>

              <label htmlFor='comment_title' style={{fontSize: "12px", display: "block"}}>Title</label>
              <input id='comment_title' className='SendAmount' type='text' style={{width: "920px", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}/>
              <label htmlFor='comment_description' style={{fontSize: "12px", display: "block", marginTop: "15px"}}>Description</label>
              <textarea id='comment_description' cols="60" rows="3" className='ContractCode' type='text' style={{width: "920px", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}></textarea>
              {this.state.commentError &&
                <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "10px", textAlign: "center"}}>{this.state.commentError}</p>}
              <button type='submit'  className='AddBtn' style={{backgroundColor:"rgb(245, 42, 52)", border:"0px", color: "white",  display: "block", padding: "16px", margin: "0 auto", marginTop: "30px", fontSize: "1em", width: "200px", fontWeight: "700"}}>COMMENT</button>
            </form>
          }
        </div>
        {commentsArray}
      </div>
    );
    var numPushed = 0;

      var fulfillments = [];
      for (var i = 0; i < this.state.fulfillments.length; i++){
        var fulfillmentComments = [];
        if (this.state.fulfillments[i].comments){
          for (var j = 0; j < this.state.fulfillments[i].comments.length; j++){
            fulfillmentComments.push(
              <div style={{display: "block", width: "793px", marginBottom: "5px", borderBottom: j === (this.state.fulfillments[i].comments.length-1)? "0px" : "1px solid rgba(0,0,0,0.3)", paddingBottom: "10px", overflow: "hidden"}}>

                <Text style={{ fontSize: "14px", width: "100%", margin: "0px 10px 10px 0px", color: "#FFDE46", textDecoration: "none", display: "block", overflow: "hidden"}}>{this.state.fulfillments[i].comments[j].description}</Text>

                <p style={{ fontSize: "10px", margin: "4px  10px 2.5px 0px", display: "inline-block", float: "left"}}><b style={{color:"rgb(255, 184, 21)"}}>By: </b></p>
                <Blockies
                seed={this.state.fulfillments[i].comments[j].from}
                size={9}
                scale={2.5}
                style={{borderRadius: "10px", display: "inline-block", float: "left"}}
                />
                <p style={{ fontSize: "10px", margin: "4px  0px 4px 10px", display: "inline-block", float: "left"}}><Link style={{color: "#f52a34"}} to={"/user/"+ this.state.fulfillments[i].comments[j].from}>{this.state.fulfillments[i].comments[j].from}</Link></p>
                <p style={{ fontSize: "10px", margin: "4px  0px 4px 10px", display: "inline-block", float: "left", color: "rgb(208, 208, 208)"}}>{this.state.fulfillments[i].comments[j].dateString}</p>

              </div>
            );
          }
        }

        fulfillments.push(
          <div style={{display: "block", borderLeft:"1px solid rgb(25, 55, 83)", marginBottom: "15px", overflow: "hidden"}} key={this.state.fulfillments[i].fulfiller+i}>

            <div style={{backgroundColor: "rgb(249, 249, 249)", color: "rgb(25, 55, 83)"}}>
            <div style={{display: "block", overflow: "hidden", padding: "15px", position: "relative"}}>
              <div style={{width: "88%", display: "inline-block", float: "left"}}>
                <p style={{ fontSize: "14px", margin: "4px  10px 2.5px 0px", display: "inline-block", float: "left"}}><b style={{color:"rgb(255, 184, 21)"}}>Bounty Hunter: </b></p>
                <Blockies
                seed={this.state.fulfillments[i].fulfiller}
                size={9}
                scale={2.5}
                style={{borderRadius: "10px", display: "inline-block", float: "left"}}
                />
                <p style={{ fontSize: "14px", margin: "4px  10px 2.5px 10px", display: "inline-block", float: "left"}}><Link style={{color: "#f52a34"}} target={"_blank"} to={"/user/"+ this.state.fulfillments[i].fulfiller}>{this.state.fulfillments[i].fulfiller}</Link></p>
                {this.state.fulfillments[i].fulfiller_email &&
                <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px", display: "block", overflow: "hidden"}}><b style={{color: "rgb(255, 184, 21)"}}>Contact: </b> {this.state.fulfillments[i].fulfiller_email} </p>}
                {this.state.fulfillments[i].sourceDirectoryHash &&
                <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px", display: "block", overflow: "hidden"}}><b style={{color: "rgb(255, 184, 21)"}}>Associated File: </b> <Link style={{color: "#f52a34"}} target={"_blank"} to={"https://ipfs.infura.io/ipfs/" + this.state.fulfillments[i].sourceDirectoryHash+"/"+this.state.fulfillments[i].sourceFileName}> {this.state.fulfillments[i].sourceFileName} </Link> </p>}

                <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px", color:"rgb(255, 184, 21)", display: "block", overflow: "hidden"}}><b>Submission</b>:</p>
                <Text style={{ fontSize: "14px", width: "100%", margin: "0px 10px 10px 0px", color: "rgb(255, 184, 21)", textDecoration: "none", display: "block", overflow: "hidden"}}>{this.state.fulfillments[i].description}</Text>
                <FlatButton style={{backgroundColor: "rgba(0, 126, 255, 0.24)", border:"0px", color: "white", float: "left",  marginTop: "15px", display: "block", width: "200px"}} onClick={this.handleExpandComment.bind(this,i)}>Add Comment </FlatButton>
                {this.state.fulfillments[i].commentsOpen &&
                  <form className='Contribute' onSubmit={this.handleCommentOnFulfillment} style={{width: "967px", display: "inline-block", paddingTop: "15px"}}>

                    <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "5px", textAlign: "center", fontSize: "16px"}}>Comment on Submission</h4>
                    <input id="comment_index" value={i} style={{display: "none"}}></input>

                    <label htmlFor='comment_description' style={{fontSize: "12px", display: "block", marginTop: "15px"}}>Comment</label>
                    <textarea id='comment_description' cols="60" rows="3" className='ContractCode' type='text' style={{width: "952px", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}></textarea>
                    {this.state.fulfillments[i].commentError &&
                      <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "10px", textAlign: "center"}}>{this.state.fulfillments[i].commentError}</p>}
                    <button type='submit'  className='AddBtn' style={{backgroundColor: "#f52a34", border:"0px", color: "rgb(21, 38, 57)",  display: "block", padding: "10px 16px", margin: "0 auto", marginTop: "15px", fontSize: "1em", width: "200px", fontWeight: "700"}}>COMMENT</button>
                  </form>

                }
                {this.state.fulfillments[i].comments && this.state.fulfillments[i].comments.length > 0 &&
                  <div style={{borderTop: "1px solid rgba(256,256,256, 0.18)", padding: "30px 0px 0px 30px", marginTop: this.state.fulfillments[i].commentsOpen?"30px":"70px"}}>
                    <h5 style={{margin: "5px 0px", textAlign: "left", fontWeight: "200"}}><b style={{fontSize: "16px", fontWeight: "200", color: "rgb(255, 184, 21)"}}>{this.state.fulfillments[i].comments.length +"  Comment"+  (this.state.fulfillments[i].comments.length === 1? "" : "s")}</b></h5>

                    {fulfillmentComments}

                  </div>
                }


              </div>
              <div style={{width: "12%", display: "inline-block", float: "left"}}>
              <Chip style={{float: "right", border: "1px solid #1D1749", backgroundColor:"#1D1749", height: "30px", margin: "5px auto"}}
                    labelStyle={{color: this.state.fulfillments[i].accepted? "#f52a34" : "#FFDE46", fontSize: "14px", marginTop: "-2px"}}
                    key={this.state.fulfillments[i].accepted? "Accepted" : "Not Accepted"}>
                    {this.state.fulfillments[i].accepted? "Accepted" : "Not Accepted"}
              </Chip>
                {this.state.stage === "Active" && !this.state.fulfillments[i].accepted && this.state.accounts && this.state.accounts[0] === this.state.issuer &&
                <FlatButton style={{backgroundColor: "#f52a34", border:"0px", color: "#152639", float: "right",  margin: "10px", display: "block"}} onClick={this.handleAccept.bind(this,this.state.fulfillments[i].fulfillment_id)}> Accept </FlatButton>}

              </div>
</div>

            </div>
          </div>
        );
        numPushed++;

      }
      fulBody = (
        <div style={{width: "100%", marginTop: "30px", display: "block", marginBottom: "30px", paddingBottom: "30px", minHeight: "90vh"}}>
          {(this.state.stage === "Active" && !this.state.mine)&&
            <div style={{backgroundColor: "rgb(249, 249, 249)", display: "block", overflow: "hidden", marginBottom: "30px"}}>
              <div style={{width: "940px", marginTop: "15px", marginLeft: "15px", marginRight: "15px", position: "relative", padding: "15px"}}>
                {!this.state.fulfillmentOpen? <SvgDown onClick={this.handleToggleFulfillment} style={{position: "absolute", right: "15px", top: "15px", width: "40px", height: "40px", color: "rgb(245, 42, 52)", marginTop: "-7px", cursor: "pointer"}}/>
              : <SvgUp onClick={this.handleToggleFulfillment} style={{position: "absolute", right: "15px", top: "15px", width: "40px", height: "40px", color: "rgb(245, 42, 52)", marginTop: "-7px", cursor: "pointer"}}/>}
                <h3 onClick={this.handleToggleFulfillment} style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center", cursor: "pointer",  fontWeight: "600", color: "rgb(25, 55, 83)"}}>Fulfill the Bounty</h3>
                {this.state.fulfillmentOpen &&

                  <div style={{paddingBottom: "0px"}}>
                    <form className='Fulfill' onSubmit={this.handleFulfill} style={{overflow: "hidden", color: "rgb(25, 55, 83)"}}>
                      <div style={{width: "445px", display: "block", overflow: "hidden", float: "left", marginRight: "15px"}}>
                      <label htmlFor='contact' style={{fontSize: "12px"}}>{"Contact"}</label>
                      <input id='contact' className='SendAmount' style={{width: "450px", border: "0px", display: "block"}}/>
                      </div>

                        <div style={{width: "445px", display: "block", overflow: "hidden", float: "left", marginLeft: "15px"}}>
                          <label style={{fontSize: "12px"}} htmlFor='contract_code'>Associated Files</label>
                          <input id='contract_code' type="file" name="file" onChange={this.handlecaptureFile} style={{width: "0px", display: "block", border: "0px", color: "rgb(25, 55, 83)", height: "0px", padding: "0px", margin: "0px"}}/>
                          <div style={{width: "440px", display: "block", border: "0px", color: "white", height: "20px", padding: "7.5px", paddingTop: "6px", paddingLeft: "0px", borderRadius: "4px"}}>
                            <label htmlFor="contract_code" style={{backgroundColor: "white", color: "#122134", padding: "3px 15px", fontWeight: "700", borderRadius: "0px", marginTop: "-1px"}}> Upload </label>
                            {
                              (this.state.didUploadFile && !this.state.fileUploadFinished)&&
                              <div style={{ float: "right", display: "inline-block", padding: "0px 15px 0px 5px", overflow: "hidden"}}>
                                <Halogen.ClipLoader color={"#f52a34"} size={"15px"} style={{float: "right", width: "15px", height: "15px", display: "inline-block"}}/>
                              </div>

                            }
                            {
                              (this.state.didUploadFile && this.state.fileUploadFinished)&&
                              <div style={{ float: "right", display: "inline-block", padding: "3px 15px 0px 5px", overflow: "hidden"}}>
                              <SvgCheck style={{color: "rgb(22, 229, 205)", float: "right", width: "15px", height: "15px", display: "inline-block"}}/>
                              </div>

                            }
                            <span style={{float: "right", marginRight: "30px", color: "rgb(25, 55, 83)"}}> {fileName} </span>
                          </div>
                          <p style={{fontSize: "12px", color: "rgba(25,55,83, 0.55)", marginTop: "5px"}}>any file associated with your submission</p>
                        </div>




                      <div style={{width: "100%", display: "block", overflow: "hidden", float: "left", marginRight: "0"}}>
                        <label htmlFor='deposit_amount' style={{fontSize: "12px", display: "block", width: "100%"}}>Submission Description and Comments</label>
                        <textarea id='bug_description' cols="60" rows="5" className='ContractCode' type='text' style={{width: "920px", border: "0px", padding: "15px", fontSize: "12px"}}></textarea>
                        {this.state.fulfillmentError &&
                          <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.fulfillmentError}</p>}
                      </div>
                      <div style={{width: "100%", display: "block", overflow: "hidden", float: "left", marginRight: "0"}}>
                      <button type='submit'  className='AddBtn' style={{backgroundColor: "rgb(245, 42, 52)", border:"0px", color: "white",  color: "white", display: "block", padding: "15px", margin: "0 auto", marginTop: "30px",marginBottom: "15px", fontSize: "1em", width: "200px", fontWeight: "700"}}>SUBMIT</button>

                      </div>


                    </form>
                  </div>
                }

              </div>
            </div>

          }
          {fulfillments}
        </div>
      );



    const modalActions = [
      <FlatButton
        label="Retry"
        primary={true}
        onClick={this.handleClose}
      />
    ];
    const modalActions2 = [
      <FlatButton
        label="Close"
        primary={true}
        onClick={this.handleCloseTxLoading}
      />
    ];
    const modalActions3 = [
      <FlatButton
        label="Close"
        primary={true}
        onClick={this.handleCloseNoWeb3}
      />
    ];

    var hexagonColour = "#fff";
    if (this.state.stage === "Active"){
      hexagonColour = "rgb(140, 226, 88)";
    }
    if (this.state.stage === "Draft"){
      hexagonColour = "rgb(255, 186, 20)";
    }
    if (this.state.stage === "Dead"){
      hexagonColour = "rgb(255, 104, 70)";
    }
    if (this.state.stage === "Expired"){
      hexagonColour = "rgb(104, 166, 166)";
    }
    if (this.state.stage === "Completed"){
      hexagonColour = "rgb(255, 222, 70)";
    }
    return (
      <div>
      <Helmet
          meta={[{property: 'og:title', content: "EXPLORER SEO TEST"},
          {property: 'og:type', content: 'website'},
          {property: 'og:url', content: 'https://beta.bounties.network/bounty/'},
          {property: 'og:image', content: 'https://bounties.network/images/twitter.png'},
          {property: 'og:description', content: "EXPLORER SEO TEST"},
                  ]}
                    >
      </Helmet>
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
          actions={modalActions2}
          modal={false}
          open={this.state.txModalOpen}
          onRequestClose={this.handleCloseTxLoading}
        >
          <div style={{width: "50%", display: "block", margin: "0 auto", marginTop: "30px"}}>
          <p style={{fontSize: "14px", textAlign: "center"}}> {this.state.txLoadingMessage}</p>

            <LinearProgress mode="determinate" value={this.state.txLoadingAmount} color="rgb(255, 222, 70)"/>
            </div>
        </Dialog>
        <Dialog
           title=""
           actions={modalActions3}
           modal={false}
           open={this.state.noWeb3Error}
           onRequestClose={this.handleCloseNoWeb3}
         >
           <div style={{width: "75%", display: "block", margin: "0 auto", marginTop: "30px"}}>
           <p style={{fontSize: "18px", textAlign: "center"}}>To perform this action, you need to use a web3 enabled browser. We suggest using the <a href="https://metamask.io" target="_blank" style={{textDecoration: "none", color: "#f52a34"}}> Metamask </a> browser extension.</p>
             </div>
         </Dialog>
        <div id={"colourBodyLight"} style={{minHeight: "100vh", position: "relative"}}>

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

          <div style={{ display: "block", overflow: "hidden", width: "1050px", margin: "0 auto", paddingBottom: "160px", display: "block"}}>

          {(this.state.loadingFulfillments || this.state.loadingBounty)  &&

            <div style={{marginLeft: "505px", marginTop: "60px", overflow: "hidden", marginBottom: "60px"}}>
            <Halogen.ScaleLoader color={"#f52a34"} />
            </div>
          }
          {
            !(this.state.loadingFulfillments || this.state.loadingBounty) &&
            <div style={{float: "left", display: "block", margin: "0 15px", width: "1020px"}}>


              <div style={{marginBottom: "0px", boxShadow: "none", borderRadius: "0", padding: "30px", marginTop: "15px", border: "0", backgroundColor: "rgb(249, 249, 249)", borderBottom: "0px solid #f52a34", color:"#1D1749", paddingTop: "30px"}} className="ContractCard">
                <h3 style={{margin: "0px 15px 30px 15px", width: "100%", display: "inline", fontSize: "28px", textAlign: "center",  fontWeight: "600"}}> {this.state.title}</h3>

                <div style={{float: "left", display: "inline-block", width: "200px",}}>
                  <div style={{backgroundColor: "rgba(1, 1, 1, 0.05)", display: "block", overflow: "hidden", padding: "15px"}}>
                  <h5 style={{ fontSize: "13px", width: "100%", textAlign: "center", marginTop: "0px", marginBottom: "0px", color: "#8C9899", fontWeight: "200"}}>PRIZE</h5>

                  <h5 style={{ fontSize: "13px", width: "100%", textAlign: "center", marginTop: "7.5px", marginBottom: "0px", color: "#1D1749", fontSize: "32px", fontWeight: "600"}}>{this.state.value}<b style={{color: "rgb(255, 184, 21)", fontWeight: "600", lineHeight: "28px"}}>{this.state.symbol? this.state.symbol : 'ETH'}</b></h5>

                  <h5 style={{textAlign: "center", marginTop: "0px", marginBottom: "0px", color: "rgb(25, 55, 83)", marginBottom: "15px", fontSize: "16px", fontWeight: "200"}}><b style={{color: "rgb(255, 184, 21)", fontWeight: "500"}}>$</b>{numberWithCommas(parseInt((this.state.usdValue )))}</h5>

                    <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", textAlign: "center", marginBottom: "7.5px", color: "#8C9899"}}>Total Balance: {this.state.balance + " " + this.state.symbol}</p>
                  </div>

                  <form className='Contribute' onSubmit={this.handleContribute} style={{width: "100%", display: "inline-block", marginTop: "30px"}}>
                    <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center",  fontWeight: "600"}}> Contribute to Bounty</h4>
                    <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>Deposit Amount ({this.state.symbol? this.state.symbol: 'ΞTH'})</label>
                    <input id='deposit_amount' className='SendAmount' type='number'  step="any" style={{width: "182px", border: "0px"}}/>
                    {this.state.contributionError &&
                      <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.contributionError}</p>}
                    <button type='submit' className='AddBtn' style={{backgroundColor: "rgba(0, 126, 255, 0)", border:"1px solid rgb(25, 55, 83)", color: "rgb(25, 55, 83)", width: "200px"}}>Contribute</button>

                  </form>
                  <div style={{margin: "0 auto", display: "block", overflow: "hidden", width: "111px"}}>
                    <Link target="_blank" to={"https://twitter.com/home?status=New Bounty: "+ this.state.title.substring(0,80) + (this.state.title.length > 80? "...":"")+"%20https%3A//beta.bounties.network/bounty/v1/"+this.state.bountyId}>
                    <SvgTwitter style={{width: "15px", height: "15px", color: "rgb(245, 42, 52)", padding: "5px", border: "1px solid rgb(25, 55, 83)", borderRadius: "100px", marginTop: "30px", marginRight: "15px"}}
                                className="iconHover"/>
                    </Link>
                    <Link target="_blank" to={"https://www.facebook.com/sharer/sharer.php?u=https%3A//beta.bounties.network/bounty/"+this.state.bountyId}>
                    <SvgFacebook style={{width: "15px", height: "15px", color: "rgb(245, 42, 52)", padding: "5px", border: "1px solid rgb(25, 55, 83)", borderRadius: "100px", marginTop: "30px", marginRight: "15px"}}
                                className="iconHover"/>
                    </Link>
                    <Link target="_blank" to={"http://reddit.com/submit?url=https%3A%2F%2Fbeta.bounties.network%2Fbounty%2F"+this.state.bountyId+"&title="+ this.state.title.substring(0,80) + (this.state.title.length > 80? "...":"")}>
                    <SvgReddit style={{width: "15px", height: "15px", color: "rgb(245, 42, 52)", padding: "5px", border: "1px solid rgb(25, 55, 83)", borderRadius: "100px", marginTop: "30px"}}
                                className="iconHover"/>
                    </Link>
                  </div>
                </div>
                <div style={{float: "left", display: "inline-block", width: "600px", paddingRight: "110px"}}>


                  <p style={{ fontSize: "14px", margin: "4px  0px 10px 0px", display: "inline-block", float: "left"}}><b style={{color: "rgb(255, 184, 21)"}}>Bounty Issuer: </b></p>
                  <Blockies
                  seed={this.state.issuer}
                  size={9}
                  scale={2.5}
                  style={{borderRadius: "10px", display: "inline-block", float: "left"}}
                  />
                  <p style={{ fontSize: "14px", margin: "4px  0px 10px 0px", display: "inline-block", float: "left"}}><Link style={{color: "#f52a34"}} target={"_blank"} to={"/user/"+ this.state.issuer}>{ this.state.issuer}</Link></p>


                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px", display: "block", overflow: "hidden"}}><b style={{color: "rgb(255, 184, 21)", marginRight: "10px"}}>Bounty Stage:</b> {this.state.stage}</p>

                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px", display: "block", overflow: "hidden"}}><b style={{color: "rgb(255, 184, 21)", marginRight: "10px"}}>Deadline:</b> {this.state.deadlineString}</p>

                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "rgb(255, 184, 21)", marginRight: "10px"}}>Contact the bounty issuer:</b> { this.state.contact}</p>
                  {this.state.webLink &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "rgb(255, 184, 21)", marginRight: "10px"}}>Github Link: </b> <Link style={{color: "#f52a34"}} target={"_blank"} to={this.state.webLink}> {this.state.webLink} </Link> </p>}

                  {this.state.sourceDirectoryHash &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "rgb(255, 184, 21)", marginRight: "10px"}}>Associated File: </b> <Link style={{color: "#f52a34"}} target={"_blank"} to={"https://ipfs.infura.io/ipfs/" + this.state.sourceDirectoryHash + "/"+ this.state.sourceFileName}> {this.state.sourceFileName} </Link> </p>}
                  {this.state.paysTokens &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "rgb(255, 184, 21)", marginRight: "10px"}}>Token Contract:</b> <Link style={{color: "#f52a34"}} target={"_blank"} to={"https://etherscan.io/address/"+ this.state.tokenAddress}>{this.state.tokenAddress}</Link></p>}
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "rgb(255, 184, 21)", marginRight: "10px"}}>Description: </b> </p>
                  <Text style={{ fontSize: "14px", width: "100%", margin: "0px 10px 10px 0px", color: "rgb(255, 184, 21)", textDecoration: "none"}}>{this.state.description}</Text>
                  <div style={{margin: "0 auto", display: "block", overflow: "hidden", marginTop: "15px"}}>
                    {categories}
                  </div>
                </div>
                {
                  /*
                  <div className="" style={{width: "110px", marginTop: "0px", webkitMask: `url(${hexagonImage}) no-repeat 50% 50%`, mask: `url(${hexagonImage}) no-repeat 50% 50%`, webkitMaskSize: "cover", maskSize: "cover", backgroundColor: hexagonColour, height: "130px", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <p style={{ fontSize: "20px", width: "100%", textAlign: "center", display: "block", fontWeight: "600", color: "#16283b"}}>{this.state.stage} Bounty</p>
                  </div>
                  */
                }






                {actions}

            </div>


            <Tabs tabItemContainerStyle={{backgroundColor: "rgb(249,249,249)", color: "#f52a34"}}
                  inkBarStyle={{backgroundColor: "rgb(255, 222, 70)", color: "#f52a34"}}
                  style={{backgroundColor: "rgba(0,0,0,0)"}}
                  onChange={this.handleMainTabsChange}
                  value={this.state.mainTabValue}
                  tabTemplate={TabTemplate}
                  style={{
                      flex: '1 1 100%',
                      minHeight: "0",
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: "rgba(0,0,0,0)"
                  }}
                  contentContainerStyle={{
                      flex: '1 1 100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflowY: 'auto',
                      height: "fixed"
                  }}>
              <Tab label={numPushed+" Submission"+(numPushed !== 1? "s" : "")} value={0} style={{color: this.state.mainTabValue === 0? "#fff" : "#f52a34", fontSize: "16px", backgroundColor: this.state.mainTabValue === 0? ("#1D1749"): "rgba(10, 22, 40, 0)"}}>
                {fulBody}
              </Tab>
              <Tab label={this.state.myComments.length+" Comment"+(this.state.myComments.length !== 1? "s" : "")} value={1} style={{color: this.state.mainTabValue === 1? "#fff" : "#f52a34", fontSize: "16px", backgroundColor: this.state.mainTabValue === 1? ("#1D1749") : "rgba(10, 22, 40, 0)"}}>
                {comments}
              </Tab>


            </Tabs>



          </div>
          }
        </div>
        <p style={{textAlign: "center", display: "block", fontSize: "10px", padding: "15px 0px", color: "rgb(25, 55, 83)", width: "100%", position: "absolute", bottom: "0px"}}>&copy; Bounties Network, a <a href="https://ConsenSys.net" target="_blank" style={{textDecoration: "none", color: "rgb(25, 55, 83)"}}>ConsenSys</a> Formation <br/>
         <a href="/privacyPolicy/" target="_blank" style={{color: "rgb(25, 55, 83)"}}>Privacy Policy</a>{" | "}<a href="/terms/" target="_blank" style={{color: "rgb(25, 55, 83)"}}>Terms of Service</a>
         </p>
      </div>
    </div>
    )
  }
}

export default BountyPage
