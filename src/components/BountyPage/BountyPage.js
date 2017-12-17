import React, { Component } from 'react'
import './BountyPage.css'


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
      loading: true,
      modalOpen: false,
      comments: [],
      sourceFileName: "",
      sourceFileHash: "",
      sourceDirectoryHash: "",
      contract: {
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
                bountyBroken: "false"},
        prices: {},
        bountyId: this.props.params.id,
        myComments: [],
        commentError: "",
        contributionError: "",
        fulfillmentError: "",
        transferError: "",
        deadlineError: "",
        increasePayoutError: "",
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
        lightMode:  localStorage.getItem('lightMode') === null? true : localStorage.getItem('lightMode') == "true",
        version: this.props.params.version

    }
    this.ipfsApi = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: "https"});

    this.getInitialData = this.getInitialData.bind(this);
    this.getComments = this.getComments.bind(this);
    this.getFulfillment = this.getFulfillment.bind(this);

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
    this.handleToggleLightMode = this.handleToggleLightMode.bind(this);

    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);

    this.getPrices = this.getPrices.bind(this);

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
    this.getPrices();


    if (window.loaded){
      this.getInitialData();
    } else {
      window.addEventListener('load', this.getInitialData);
    }

  }
  getPrices(){

    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://api.coinmarketcap.com/v1/ticker/?convert=USD&limit=0", false);
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
        if (netId === "1"){
          if (this.state.version === "v0"){
            this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v0),
                           UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.mainNet.userCommentsAddress),
                           selectedNetwork: netId});
          } else if (this.state.version === "v1"){
            this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v1),
                           UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.mainNet.userCommentsAddress),
                           selectedNetwork: netId});
          }

        } else if (netId === "4"){
          if (this.state.version == "v0"){
            this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v0),
                           UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.rinkeby.userCommentsAddress),
                           selectedNetwork: netId});
          } else if (this.state.version == "v1"){
            this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v1),
                           UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.rinkeby.userCommentsAddress),
                           selectedNetwork: netId});
          }

        } else {
          this.setState({modalError: ("Please change your Ethereum network to the Main Ethereum network or the Rinkeby network"), modalOpen: true});
        }
        console.log("got network", netId);
        console.log("version", this.state.version);


        setInterval(function() {
          web3.version.getNetwork(function(err, newNetId){
            if (netId !== newNetId) {
              window.location.reload();
            }
          });
        });

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
            });

            this.setState({accounts: accs});
            console.log("bounty", this.state.StandardBounties);

            this.state.StandardBounties.getBounty(this.state.bountyId, (err, succ)=> {
              this.state.StandardBounties.getBountyData(this.state.bountyId, (err, data)=> {
                if (data){
                  console.log("data", data);

                  ipfs.catJSON(data, (err, result)=> {
                    var stage;
                    var max = new BN(8640000000000000);

                    if (parseInt(succ[4], 10) === 0){
                      stage = "Draft";
                    } else if (parseInt(succ[4], 10) === 1 && parseInt(succ[5], 10) < parseInt(succ[2], 10)){
                      stage = "Completed";
                    } else if (parseInt(succ[4], 10) === 1 && (!(succ[1].times(1000)).greaterThan(max) && (parseInt(succ[1], 10)*1000 - Date.now()) < 0)){
                      stage = "Expired";
                    } else if (parseInt(succ[4], 10) === 1){
                      stage = "Active";
                    }  else {
                      stage = "Dead";
                    }
                    var intDate = parseInt(succ[1], 10);
                    var newDate;
                    var dateString;
                    if ((succ[1].times(1000)).greaterThan(max)){
                      newDate = new Date(parseInt(max, 10));
                      console.log("new date bigger", newDate)
                      dateString = this.dateToString(8640000000000000);
                    } else {
                      newDate = new Date(parseInt(succ[1], 10)*1000);
                      dateString = this.dateToString(parseInt(succ[1], 10)*1000);
                    }
                    console.log("got date", parseInt(succ[1], 10)*1000, newDate, dateString);

                    if (!succ[3]){
                      var value = web3.fromWei(parseInt(succ[2], 10), 'ether');
                      var balance = web3.fromWei(parseInt(succ[5], 10), 'ether');
                      console.log("balance: ", value, balance);
                      this.setState({contract: {
                        issuer: succ[0],
                        deadline: newDate.toUTCString(),
                        deadlineString: dateString,
                        value: value,
                        paysTokens: succ[3],
                        stage: stage,
                        balance: balance,
                        bountyData: result,
                        dateString: newDate.toISOString().slice(0,19),
                        dateNum: parseInt(succ[1], 10)*1000,
                        symbol: "ETH",
                        mine: (succ[0] === this.state.accounts[0])
                      },
                      loading: false,
                      selectedValue: result.categories.join(","),
                      editSourceFileName: result.sourceFileName,
                      editSourceFileHash: result.sourceFileHash,
                      editSourceDirectoryHash: result.sourceDirectoryHash,
                      optionsList: result.categories,
                      containsCode: (result.categories.includes("Code") || result.categories.includes("Bugs"))
                    });
                      this.getComments();
                    } else {
                      this.state.StandardBounties.getBountyToken(this.state.bountyId, (err, address)=> {
                        var HumanStandardToken = web3.eth.contract(json.interfaces.HumanStandardToken).at(address);
                        HumanStandardToken.symbol((err, symbol)=> {
                          HumanStandardToken.decimals((err, dec)=> {

                            var decimals = parseInt(dec, 10);
                            var newAmount = succ[2];
                            var decimalToMult = new BN(10, 10);
                            var decimalUnits = new BN(decimals, 10);
                            decimalToMult = decimalToMult.pow(decimalUnits);
                            newAmount = newAmount.div(decimalToMult);

                            var balance = succ[5];
                            balance = balance.div(decimalToMult);


                            this.setState({contract: {
                              issuer: succ[0],
                              deadline: newDate.toUTCString(),
                              deadlineString: dateString,
                              value: parseInt(newAmount, 10),
                              paysTokens: succ[3],
                              stage: stage,
                              balance: parseInt(balance, 10),
                              bountyData: result,
                              dateString: newDate.toISOString().slice(0,19),
                              pdateNum: parseInt(succ[1], 10)*1000,
                              symbol: symbol,
                              mine: (succ[0] === this.state.accounts[0]),
                              decimals: decimals,
                              tokenContract: HumanStandardToken,
                            },
                            loading: false,
                            selectedValue: result.categories.join(","),
                            editSourceFileName: result.sourceFileName,
                            editSourceFileHash: result.sourceFileHash,
                            editSourceDirectoryHash: result.sourceDirectoryHash,
                            optionsList: result.categories,
                            containsCode: (result.categories.includes("Code") || result.categories.includes("Bugs"))});
                            this.getComments();

                          });
                        });

                      });

                    }

                  });
                }
              });

            });
            this.state.StandardBounties.getNumFulfillments(this.state.bountyId, (err, succ)=> {
              var total = parseInt(succ, 10);
              console.log("total", total);
              var fulfillments = [];
              for (var j = 0; j < total; j++){
                this.getFulfillment(j, fulfillments, total);
              }
            });
            this.state.StandardBounties.getNumBounties((err, succ) => {
              var total = parseInt(succ,10);
              this.setState({total: total});
            });

          }
        }
          }.bind(this));

      });

    } else {
      this.state.StandardBounties.getBounty(this.state.bountyId, (err, succ)=> {
        this.state.StandardBounties.getBountyData(this.state.bountyId, (err, data)=> {
          if (data){
            console.log("data", data);

            ipfs.catJSON(data, (err, result)=> {
              var stage;
              var max = new BN(8640000000000000);

              if (parseInt(succ[4], 10) === 0){
                stage = "Draft";
              } else if (parseInt(succ[4], 10) === 1 && parseInt(succ[5], 10) < parseInt(succ[2], 10)){
                stage = "Completed";
              } else if (parseInt(succ[4], 10) === 1 && (!(succ[1].times(1000)).greaterThan(max) && (parseInt(succ[1], 10)*1000 - Date.now()) < 0)){
                stage = "Expired";
              } else if (parseInt(succ[4], 10) === 1){
                stage = "Active";
              }  else {
                stage = "Dead";
              }

              var intDate = parseInt(succ[1], 10);
              var newDate;
              var dateString;
              if ((succ[1].times(1000)).greaterThan(max)){
                newDate = new Date(parseInt(max, 10));
                dateString = this.dateToString(8640000000000000);
              } else {
                newDate = new Date(parseInt(succ[1], 10)*1000);
                dateString = this.dateToString(parseInt(succ[1], 10)*1000);
              }

              if (!succ[3]){
                var value = web3.fromWei(parseInt(succ[2], 10), 'ether');
                var balance = web3.fromWei(parseInt(succ[5], 10), 'ether');
                console.log("balance: ", value, balance);
                this.setState({contract: {
                  issuer: succ[0],
                  deadline: newDate.toUTCString(),
                  deadlineString: dateString,
                  value: value,
                  paysTokens: succ[3],
                  stage: stage,
                  balance: balance,
                  dateString: dateString,
                  bountyData: result,
                  symbol: "ETH",
                  mine: (succ[0] === this.state.accounts[0])
                },
                loading: false,
                selectedValue: result.categories.join(","),
                editSourceFileName: result.sourceFileName,
                editSourceFileHash: result.sourceFileHash,
                editSourceDirectoryHash: result.sourceDirectoryHash,
                optionsList: result.categories});
                this.getComments();
              } else {
                this.state.StandardBounties.getBountyToken(this.state.bountyId, (err, address)=> {
                  var HumanStandardToken = web3.eth.contract(json.interfaces.HumanStandardToken).at(address);
                  HumanStandardToken.symbol((err, symbol)=> {
                    HumanStandardToken.decimals((err, dec)=> {

                      var decimals = parseInt(dec, 10);
                      var newAmount = succ[2];
                      var decimalToMult = new BN(10, 10);
                      var decimalUnits = new BN(decimals, 10);
                      decimalToMult = decimalToMult.pow(decimalUnits);
                      newAmount = newAmount.div(decimalToMult);

                      var balance = succ[5];
                      balance = balance.div(decimalToMult);


                      this.setState({contract: {
                        issuer: succ[0],
                        deadline: newDate.toUTCString(),
                        deadlineString: dateString,
                        value: parseInt(newAmount, 10),
                        paysTokens: succ[3],
                        stage: stage,
                        balance: parseInt(balance, 10),
                        bountyData: result,
                        dateString: dateString,
                        symbol: symbol,
                        mine: (succ[0] === this.state.accounts[0]),
                        decimals: decimals,
                        tokenContract: HumanStandardToken,
                      },
                      loading: false,
                      selectedValue: result.categories.join(","),
                      editSourceFileName: result.sourceFileName,
                      editSourceFileHash: result.sourceFileHash,
                      editSourceDirectoryHash: result.sourceDirectoryHash,
                      optionsList: result.categories});
                      this.getComments();

                    });
                  });

                });

              }

            });
          }



        });

      });
      this.state.StandardBounties.getNumFulfillments(this.state.bountyId, (err, succ)=> {
        var total = parseInt(succ, 10);
        console.log("total", total);
        var fulfillments = [];
        for (var j = 0; j < total; j++){
          this.getFulfillment(j, fulfillments, total);
        }
      });
      this.state.StandardBounties.getNumBounties((err, succ) => {
        var total = parseInt(succ,10);
        this.setState({total: total});
      });

    }

  }
  getFulfillment(fulId, fulfillments, total){
    this.state.StandardBounties.getFulfillment(this.state.bountyId, fulId, (err, succ)=> {
      console.log("Jth fulfillmnet", fulId);
      ipfs.catJSON(succ[2], (err, result)=> {
        console.log("err, succ", err, result);
        fulfillments.push({
          fulfillmentId: fulId,
          accepted: succ[0],
          fulfiller: succ[1],
          data: result,
          commentsOpen: false,
          comments: [],
        });

        if (fulfillments.length === total){

          fulfillments.sort(function(f1, f2){return f2.fulfillmentId-f1.fulfillmentId});

          this.setState({fulfillments: fulfillments});
        }
      });
    });
  }
  getComments(){
    this.state.UserCommentsContract.numComments((err, succ)=> {
      var total = parseInt(succ, 10);
      var comments = [];

      console.log("total comments: ", total);
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
              var myComments = [];
              this.setState({comments: comments});
              for (i = 0; i < this.state.comments.length; i++){
                if (this.state.comments[i].aboutBounty && this.state.comments[i].bountyId == this.state.bountyId && this.state.comments[i].aboutFulfillment !== true){
                  myComments.push(this.state.comments[i]);
                }
                if (this.state.comments[i].aboutBounty && this.state.comments[i].bountyId == this.state.bountyId && this.state.comments[i].aboutFulfillment === true){
                  var fulfillments = this.state.fulfillments;
                  fulfillments[this.state.comments[i].fulfillmentId].comments.push(this.state.comments[i]);
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

        ipfs.addJSON({description: data, sourceFileName: this.state.sourceFileName, sourceDirectoryHash: this.state.sourceDirectoryHash, sourceFileHash: this.state.sourceFileHash, contact: contact}, (err, succ)=> {
          this.setState({txLoadingAmount: 40});

          console.log("about to fulfill", this.state.bountyId, succ);
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
        if (!this.state.contract.paysTokens){
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

          var newAmount = new BN(amount, 10);
          var decimalToMult = new BN(10, 10);
          var decimalUnits = new BN(this.state.contract.decimals, 10);
          decimalToMult = decimalToMult.pow(decimalUnits);
          newAmount = newAmount.mul(decimalToMult);

          console.log("newAmount", this.state.StandardBounties.address);

          this.state.contract.tokenContract.approve(this.state.StandardBounties.address, parseInt(newAmount, 10), {from: this.state.accounts[0]}, (err, succ)=> {
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
        description: this.state.contract.bountyData.description,
        sourceFileHash: this.state.contract.bountyData.sourceFileHash,
        sourceFileName: this.state.contract.bountyData.sourceFileName,
        sourceDirectoryHash: this.state.contract.bountyData.sourceDirectoryHash,
        contact: this.state.contract.bountyData.contact,
        categories: this.state.contract.bountyData.categories
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
      ipfs.addJSON({title: title, description: description}, (err, succ)=> {
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

    if (!this.state.contract.paysTokens){
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
        var newAmount = new BN(amount, 10);
        var decimalToMult = new BN(10, 10);
        var decimalUnits = new BN(this.state.contract.decimals, 10);
        decimalToMult = decimalToMult.pow(decimalUnits);
        newAmount = newAmount.mul(decimalToMult);
        this.setState({txModalOpen: true, txLoadingAmount: 10});
        this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to send tokens to this bounty"});

        this.state.contract.tokenContract.approve(this.state.StandardBounties.address, parseInt(newAmount, 10), {from: this.state.accounts[0]}, (err, succ)=> {
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
  } else if (newPayout <= this.state.contract.value){
    this.setState({increasePayoutError: "The new payout cannot be less than or equal to the current payout amount"});
  } else {
    this.setState({increasePayoutError: ""});
    var finalPayout;
    var finalDeposit;
    if (this.state.contract.paysTokens){
      var newAmount = new BN(newPayout, 10);
      var decimalToMult = new BN(10, 10);
      var decimalUnits = new BN(this.state.contract.decimals, 10);
      decimalToMult = decimalToMult.pow(decimalUnits);
      newAmount = newAmount.mul(decimalToMult);
      finalPayout = parseInt(newAmount, 10);

      var newDepositAmount = new BN(newDeposit, 10);
      var decimalToMult = new BN(10, 10);
      var decimalUnits = new BN(this.state.contract.decimals, 10);
      decimalToMult = decimalToMult.pow(decimalUnits);
      newDepositAmount = newDepositAmount.mul(decimalToMult);
      finalDeposit = parseInt(newDepositAmount, 10);
      if (finalDeposit > 0){
        this.setState({txModalOpen: true, txLoadingAmount: 10});
        this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to deposit your new tokens into the bounty"});
        this.state.contract.tokenContract.approve(this.state.StandardBounties.address, parseInt(finalDeposit, 10), {from: this.state.accounts[0]}, (err, succ)=> {
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
  this.setState({ optionsList: optionsList, value: value, containsCode: containsCode});
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
handleToggleLightMode(){
  var lightMode = !this.state.lightMode;
  this.setState({lightMode: lightMode});
  localStorage.setItem('lightMode', lightMode);

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
    if (this.state.contract.mine){
      if (this.state.contract.stage === "Draft"){
        actions=(
          <div style={{width: "100%"}}>
          <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "#16e5cd"}} inkBarStyle={{backgroundColor: "rgb(255, 222, 70)", color: "#16e5cd"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
            <Tab label="Activate Bounty" value={0} style={{color: this.state.tabValue === 0? (this.state.lightMode? "rgb(25, 55, 83)":"#fff") : "#16e5cd"}}>
              <ActivateForm onhandleActivate={this.handleActivate} tokenDetails={this.state.tokenDetails} amount={this.state.contract.value}/>
            </Tab>
            <Tab label="Edit Bounty" value={1} style={{color: this.state.tabValue === 1? (this.state.lightMode? "rgb(25, 55, 83)":"#fff") : "#16e5cd"}}>
              <EditForm
              onHandleEdit={this.handleEdit}
              bountyData={this.state.contract.bountyData}
              selectedValue={this.state.selectedValue}
              onHandleChangeSelected={this.handleSelectChange}
              onHandleCaptureEditFile={this.handleCaptureEditFile}
              sourceFileName={this.state.editSourceFileName}
              containsCode={this.state.containsCode}
              fileUploadFinished={this.state.editFileUploadFinished}
              didUploadFile={this.state.editDidUploadFile}
              />
            </Tab>
            <Tab label="Change Deadline" value={2} style={{color: this.state.tabValue === 2? (this.state.lightMode? "rgb(25, 55, 83)":"#fff") : "#16e5cd"}}>
              <ChangeDeadlineForm onhandleChangeDeadline={this.handleChangeDeadline} deadlineError={this.state.deadlineError} dateNum={this.state.contract.dateString}/>
            </Tab>
            <Tab label="Transfer Ownership" value={3} style={{color: this.state.tabValue === 3? (this.state.lightMode? "rgb(25, 55, 83)":"#fff") : "#16e5cd"}}>
              <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
            </Tab>
            <Tab label="Increase Prize" value={4} style={{color: this.state.tabValue === 4? (this.state.lightMode? "rgb(25, 55, 83)":"#fff") : "#16e5cd"}}>
              <IncreasePayoutForm onhandleIncrease={this.handleIncreasePayout} increasePayoutError={this.state.increasePayoutError} symbol={this.state.contract.symbol}/>
            </Tab>
          </Tabs>
          </div>
        );
      }  else if (this.state.contract.stage === "Active"){

        actions = (
          <div style={{width: "100%"}}>
          <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "#16e5cd"}} inkBarStyle={{backgroundColor: "rgb(255, 222, 70)", color: "#16e5cd"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
            <Tab label="Extend Bounty Deadline" value={0} style={{color: this.state.tabValue === 0?(this.state.lightMode? "rgb(25, 55, 83)":"#fff") : "#16e5cd"}}>
              <ExtendDeadlineForm onhandleDeadline={this.handleDeadline} deadlineError={this.state.deadlineError} dateNum={this.state.contract.dateString}/>
            </Tab>
            <Tab label="Increase Prize" value={3} style={{color: this.state.tabValue === 3? (this.state.lightMode? "rgb(25, 55, 83)":"#fff") : "#16e5cd"}}>
              <IncreasePayoutForm onhandleIncrease={this.handleIncreasePayout} increasePayoutError={this.state.increasePayoutError} symbol={this.state.contract.symbol}/>
            </Tab>
            <Tab label="Kill Bounty" value={1} style={{color: this.state.tabValue === 1? (this.state.lightMode? "rgb(25, 55, 83)":"#fff") : "#16e5cd"}}>
              <KillBountyForm onhandleKill={this.handleKill} />
            </Tab>
            <Tab label="Transfer Ownership" value={2} style={{color: this.state.tabValue === 2? (this.state.lightMode? "rgb(25, 55, 83)":"#fff") : "#16e5cd"}}>
              <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
            </Tab>
          </Tabs>
          </div>
        );
      } else if (this.state.contract.stage === "Dead"){
         actions=(
           <div style={{width: "100%"}}>
           <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "#16e5cd"}} inkBarStyle={{backgroundColor: "rgb(255, 222, 70)", color: "#16e5cd"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
             <Tab label="Re-activate Bounty" value={0} style={{color: this.state.tabValue === 0? (this.state.lightMode? "rgb(25, 55, 83)":"#fff") : "#16e5cd"}}>
               <ActivateForm onhandleActivate={this.handleActivate} tokenDetails={this.state.tokenDetails} amount={this.state.contract.value}/>
             </Tab>
             <Tab label="Extend Bounty Deadline" value={1} style={{color: this.state.tabValue === 1?(this.state.lightMode? "rgb(25, 55, 83)":"#fff") : "#16e5cd"}}>
               <ExtendDeadlineForm onhandleDeadline={this.handleDeadline} deadlineError={this.state.deadlineError} dateNum={this.state.contract.dateString}/>
             </Tab>
             <Tab label="Transfer Ownership" value={2} style={{color: this.state.tabValue === 2? (this.state.lightMode? "rgb(25, 55, 83)":"#fff") : "#16e5cd"}}>
               <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
             </Tab>
             <Tab label="Increase Prize" value={3} style={{color: this.state.tabValue === 3? (this.state.lightMode? "rgb(25, 55, 83)":"#fff") : "#16e5cd"}}>
               <IncreasePayoutForm onhandleIncrease={this.handleIncreasePayout} increasePayoutError={this.state.increasePayoutError} symbol={this.state.contract.symbol}/>
             </Tab>
           </Tabs>
           </div>

        );
      }

    }



      var categories = [];
      if (this.state.contract.bountyData.categories){
        for (i = 0; i < this.state.contract.bountyData.categories.length; i++){

          categories.push(
            <Chip style={{margin: "0px 15px 5px 0px", float: "left", border: this.state.lightMode? "1px solid rgba(25, 55, 83, 1)":"1px solid rgba(0, 126, 255, 0.24)", backgroundColor: this.state.lightMode? "rgba(25, 55, 83, 10.08":"rgba(0, 126, 255, 0.08)", height: "30px"}}
                  labelStyle={{color: "white", lineHeight: "28px"}}
                  key={this.state.contract.bountyData.categories[i]}>
              {this.state.contract.bountyData.categories[i]}
            </Chip>
          );
        }
      }
    var commentsArray = [];
    var comments;
    for (i = 0; i < this.state.myComments.length; i++){
      commentsArray.push(
        <div style={{display: "block", borderBottom: "0px solid #16e5cd", marginBottom: "15px", overflow: "hidden"}} key={"comment: "+i}>
          <div style={{backgroundColor: this.state.lightMode? "rgb(249,249,249)":"rgba(10, 22, 40, 0.5)", display: "block", overflow: "hidden", padding: "15px", color: this.state.lightMode? "rgb(25, 55, 83)":"white"}}>
              <h5 style={{margin: "5px 0px", color :this.state.lightMode? "rgb(25, 55, 83)":"rgb(255, 222, 70)"}}><b style={{fontSize: "16px"}}>{this.state.myComments[i].title}</b></h5>
              <Text style={{ fontSize: "14px", width: "100%", margin: "0px 10px 10px 0px", color: "#FFDE46", textDecoration: "none", display: "block", overflow: "hidden"}}>{this.state.myComments[i].description}</Text>

              <p style={{ fontSize: "12px", margin: "4px  10px 2.5px 0px", display: "inline-block", float: "left"}}><b style={{color: "#FFDE46"}}>By: </b></p>
              <Blockies
              seed={this.state.myComments[i].from}
              size={9}
              scale={2.5}
              style={{borderRadius: "10px", display: "inline-block", float: "left"}}
              />
              <p style={{ fontSize: "12px", margin: "4px  0px 4px 10px", display: "inline-block", float: "left"}}><a style={{color: "#16e5cd"}} target={"_blank"} href={"/user/"+ this.state.myComments[i].from}>{this.state.myComments[i].from}</a></p>
              <p style={{ fontSize: "12px", margin: "4px  0px 4px 10px", display: "inline-block", float: "left", color: "rgb(208, 208, 208)"}}>{this.state.myComments[i].dateString}</p>
          </div>
        </div>
      );
    }
    comments = (
      <div style={{paddingTop: "30px", display: "block",  minHeight: "66vh"}}>
        <div style={{overflow: "hidden", display: "block", backgroundColor: this.state.lightMode? "rgb(249, 249, 249)":"rgba(10, 22, 40, 0.5)", position: "relative", padding: "30px", marginBottom: "30px",color: this.state.lightMode? "rgb(25, 55, 83)":"white"}}>
          <h4 onClick={this.handleToggleComment} style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "0px", textAlign: "center", fontSize: "1.17em", cursor: "pointer",  fontWeight: "600"}}>Comment on Bounty</h4>

          {!this.state.commentOnBountyOpen? <SvgDown onClick={this.handleToggleComment} style={{position: "absolute", right: "30px", top: "30px", width: "40px", height: "40px", color: "rgb(22, 229, 205)", marginTop: "-7px"}}/>
        : <SvgUp onClick={this.handleToggleComment} style={{position: "absolute", right: "30px", top: "30px", width: "40px", height: "40px", color: "rgb(22, 229, 205)", marginTop: "-7px"}}/>}

          {this.state.commentOnBountyOpen &&
            <form className='Contribute' onSubmit={this.handleComment} style={{width: "940px", display: "inline-block"}}>

              <label htmlFor='comment_title' style={{fontSize: "12px", display: "block"}}>Title</label>
              <input id='comment_title' className='SendAmount' type='text' style={{width: "920px", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}/>
              <label htmlFor='comment_description' style={{fontSize: "12px", display: "block", marginTop: "15px"}}>Description</label>
              <textarea id='comment_description' cols="60" rows="3" className='ContractCode' type='text' style={{width: "920px", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}></textarea>
              {this.state.commentError &&
                <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "10px", textAlign: "center"}}>{this.state.commentError}</p>}
              <button type='submit'  className='AddBtn' style={{backgroundColor:this.state.lightMode? "rgb(25, 55, 83)":"rgba(0, 126, 255, 0.24)", border:"0px", color: "white",  display: "block", padding: "16px", margin: "0 auto", marginTop: "30px", fontSize: "1em", width: "200px", fontWeight: "700"}}>COMMENT</button>
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
        for (var j = 0; j < this.state.fulfillments[i].comments.length; j++){
          fulfillmentComments.push(
            <div style={{display: "block", width: "793px", marginBottom: "5px", borderBottom: j === (this.state.fulfillments[i].comments.length-1)? "0px" : "1px solid rgba(0,0,0,0.3)", paddingBottom: "10px", overflow: "hidden"}}>

              <Text style={{ fontSize: "14px", width: "100%", margin: "0px 10px 10px 0px", color: "#FFDE46", textDecoration: "none", display: "block", overflow: "hidden"}}>{this.state.fulfillments[i].comments[j].description}</Text>

              <p style={{ fontSize: "10px", margin: "4px  10px 2.5px 0px", display: "inline-block", float: "left"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46"}}>By: </b></p>
              <Blockies
              seed={this.state.fulfillments[i].comments[j].from}
              size={9}
              scale={2.5}
              style={{borderRadius: "10px", display: "inline-block", float: "left"}}
              />
              <p style={{ fontSize: "10px", margin: "4px  0px 4px 10px", display: "inline-block", float: "left"}}><a style={{color: "#16e5cd"}} href={"/user/"+ this.state.fulfillments[i].comments[j].from}>{this.state.fulfillments[i].comments[j].from}</a></p>
              <p style={{ fontSize: "10px", margin: "4px  0px 4px 10px", display: "inline-block", float: "left", color: "rgb(208, 208, 208)"}}>{this.state.fulfillments[i].comments[j].dateString}</p>

            </div>
          );
        }

        fulfillments.push(
          <div style={{display: "block", borderLeft: this.state.lightMode?"1px solid rgb(25, 55, 83)":"1px solid #16e5cd", marginBottom: "15px", overflow: "hidden"}} key={this.state.fulfillments[i].fulfiller+i}>

            <div style={{backgroundColor: this.state.lightMode?"rgb(249, 249, 249)":"rgba(10, 22, 40, 0.5)", color: this.state.lightMode?"rgb(25, 55, 83)":"white"}}>
            <div style={{display: "block", overflow: "hidden", padding: "15px", position: "relative"}}>
              <div style={{width: "88%", display: "inline-block", float: "left"}}>
                <p style={{ fontSize: "14px", margin: "4px  10px 2.5px 0px", display: "inline-block", float: "left"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46"}}>Bounty Hunter: </b></p>
                <Blockies
                seed={this.state.fulfillments[i].fulfiller}
                size={9}
                scale={2.5}
                style={{borderRadius: "10px", display: "inline-block", float: "left"}}
                />
                <p style={{ fontSize: "14px", margin: "4px  10px 2.5px 10px", display: "inline-block", float: "left"}}><a style={{color: "#16e5cd"}} target={"_blank"} href={"/user/"+ this.state.fulfillments[i].fulfiller}>{this.state.fulfillments[i].fulfiller}</a></p>
                {this.state.fulfillments[i].data.contact &&
                <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px", display: "block", overflow: "hidden"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46"}}>Contact: </b> {this.state.fulfillments[i].data.contact} </p>}
                {(this.state.fulfillments[i].data.sourceFileHash && false) &&
                <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px", display: "block", overflow: "hidden"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46"}}>Associated File: </b> <a style={{color: "#16e5cd"}} target={"_blank"} href={"https://ipfs.infura.io/ipfs/" + this.state.fulfillments[i].data.sourceFileHash} download={this.state.fulfillments[i].data.sourceFileName}> {this.state.fulfillments[i].data.sourceFileName} </a> </p>}
                {this.state.fulfillments[i].data.sourceDirectoryHash &&
                <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px", display: "block", overflow: "hidden"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46"}}>Associated File: </b> <a style={{color: "#16e5cd"}} target={"_blank"} href={"https://ipfs.infura.io/ipfs/" + this.state.fulfillments[i].data.sourceDirectoryHash+"/"+this.state.fulfillments[i].data.sourceFileName}> {this.state.fulfillments[i].data.sourceFileName} </a> </p>}

                <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px", color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", display: "block", overflow: "hidden"}}><b>Submission</b>:</p>
                <Text style={{ fontSize: "14px", width: "100%", margin: "0px 10px 10px 0px", color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", textDecoration: "none", display: "block", overflow: "hidden"}}>{this.state.fulfillments[i].data.description}</Text>
                <FlatButton style={{backgroundColor: "rgba(0, 126, 255, 0.24)", border:"0px", color: "white", float: "left",  marginTop: "15px", display: "block", width: "200px"}} onClick={this.handleExpandComment.bind(this,i)}>Add Comment </FlatButton>
                {this.state.fulfillments[i].commentsOpen &&
                  <form className='Contribute' onSubmit={this.handleCommentOnFulfillment} style={{width: "967px", display: "inline-block", paddingTop: "15px"}}>

                    <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "5px", textAlign: "center", fontSize: "16px"}}>Comment on Submission</h4>
                    <input id="comment_index" value={i} style={{display: "none"}}></input>

                    <label htmlFor='comment_description' style={{fontSize: "12px", display: "block", marginTop: "15px"}}>Comment</label>
                    <textarea id='comment_description' cols="60" rows="3" className='ContractCode' type='text' style={{width: "952px", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}></textarea>
                    {this.state.fulfillments[i].commentError &&
                      <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "10px", textAlign: "center"}}>{this.state.fulfillments[i].commentError}</p>}
                    <button type='submit'  className='AddBtn' style={{backgroundColor: "#16e5cd", border:"0px", color: "rgb(21, 38, 57)",  display: "block", padding: "10px 16px", margin: "0 auto", marginTop: "15px", fontSize: "1em", width: "200px", fontWeight: "700"}}>COMMENT</button>
                  </form>

                }
                {this.state.fulfillments[i].comments.length > 0 &&
                  <div style={{borderTop: "1px solid rgba(256,256,256, 0.18)", padding: "30px 0px 0px 30px", marginTop: this.state.fulfillments[i].commentsOpen?"30px":"70px"}}>
                    <h5 style={{margin: "5px 0px", textAlign: "left", fontWeight: "200"}}><b style={{fontSize: "16px", fontWeight: "200", color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46"}}>{this.state.fulfillments[i].comments.length +"  Comment"+  (this.state.fulfillments[i].comments.length === 1? "" : "s")}</b></h5>

                    {fulfillmentComments}

                  </div>
                }


              </div>
              <div style={{width: "12%", display: "inline-block", float: "left"}}>
              <Chip style={{float: "right", border: this.state.lightMode? "1px solid rgba(25, 55, 83,0.24)":"1px solid rgba(0, 126, 255, 0.24)", backgroundColor: this.state.lightMode? "rgba(25, 55, 83,1)":"rgba(0, 126, 255, 0.08)", height: "30px", margin: "5px auto"}}
                    labelStyle={{color: this.state.fulfillments[i].accepted? "#16e5cd" : "#FFDE46", fontSize: "14px", marginTop: "-2px"}}
                    key={this.state.fulfillments[i].accepted? "Accepted" : "Not Accepted"}>
                    {this.state.fulfillments[i].accepted? "Accepted" : "Not Accepted"}
              </Chip>
                {this.state.contract.stage === "Active" && !this.state.fulfillments[i].accepted && this.state.accounts && this.state.accounts[0] === this.state.contract.issuer &&
                <FlatButton style={{backgroundColor: "#16e5cd", border:"0px", color: "#152639", float: "right",  margin: "10px", display: "block"}} onClick={this.handleAccept.bind(this,this.state.fulfillments[i].fulfillmentId)}> Accept </FlatButton>}

              </div>
</div>

            </div>
          </div>
        );
        numPushed++;

      }
      fulBody = (
        <div style={{width: "100%", marginTop: "30px", display: "block", marginBottom: "30px", paddingBottom: "30px", minHeight: "90vh"}}>
          {(this.state.contract.stage === "Active" && !this.state.contract.mine)&&
            <div style={{backgroundColor: this.state.lightMode? "rgb(249, 249, 249)":"rgba(10, 22, 40, 0.5)", display: "block", overflow: "hidden", marginBottom: "30px"}}>
              <div style={{width: "940px", marginTop: "15px", marginLeft: "15px", marginRight: "15px", position: "relative", padding: "15px"}}>
                {!this.state.fulfillmentOpen? <SvgDown onClick={this.handleToggleFulfillment} style={{position: "absolute", right: "15px", top: "15px", width: "40px", height: "40px", color: "rgb(22, 229, 205)", marginTop: "-7px"}}/>
              : <SvgUp onClick={this.handleToggleFulfillment} style={{position: "absolute", right: "15px", top: "15px", width: "40px", height: "40px", color: "rgb(22, 229, 205)", marginTop: "-7px"}}/>}
                <h3 onClick={this.handleToggleFulfillment} style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center", cursor: "pointer",  fontWeight: "600", color: this.state.lightMode?"rgb(25, 55, 83)":"white"}}>Fulfill the Bounty</h3>
                {this.state.fulfillmentOpen &&

                  <div style={{paddingBottom: "0px"}}>
                    <form className='Fulfill' onSubmit={this.handleFulfill} style={{overflow: "hidden", color: this.state.lightMode?"rgb(25, 55, 83)":"white"}}>
                      <div style={{width: "445px", display: "block", overflow: "hidden", float: "left", marginRight: "15px"}}>
                      <label htmlFor='contact' style={{fontSize: "12px"}}>{"Contact"}</label>
                      <input id='contact' className='SendAmount' style={{width: "450px", border: "0px", display: "block"}}/>
                      </div>
                      {
                        <div style={{width: "445px", display: "block", overflow: "hidden", float: "left", marginLeft: "15px"}}>
                          <label style={{fontSize: "12px"}} htmlFor='contract_code'>Associated Files</label>
                          <input id='contract_code' type="file" name="file" onChange={this.handlecaptureFile} style={{width: "0px", display: "block", border: "0px", color: this.state.lightMode?"rgb(25, 55, 83)":"white", height: "0px", padding: "0px", margin: "0px"}}/>
                          <div style={{width: "440px", display: "block", border: "0px", color: "white", height: "20px", padding: "7.5px", paddingTop: "6px", paddingLeft: "0px", borderRadius: "4px"}}>
                            <label htmlFor="contract_code" style={{backgroundColor: "white", color: "#122134", padding: "3px 15px", fontWeight: "700", borderRadius: "0px", marginTop: "-1px"}}> Upload </label>
                            {
                              (this.state.didUploadFile && !this.state.fileUploadFinished)&&
                              <div style={{ float: "right", display: "inline-block", padding: "0px 15px 0px 5px", overflow: "hidden"}}>
                                <Halogen.ClipLoader color={"#16e5cd"} size={"15px"} style={{float: "right", width: "15px", height: "15px", display: "inline-block"}}/>
                              </div>

                            }
                            {
                              (this.state.didUploadFile && this.state.fileUploadFinished)&&
                              <div style={{ float: "right", display: "inline-block", padding: "3px 15px 0px 5px", overflow: "hidden"}}>
                              <SvgCheck style={{color: "rgb(22, 229, 205)", float: "right", width: "15px", height: "15px", display: "inline-block"}}/>
                              </div>

                            }
                            <span style={{float: "right", marginRight: "30px"}}> {fileName} </span>
                          </div>
                          <p style={{fontSize: "12px", color: "rgba(25,55,83, 0.55)", marginTop: "5px"}}>any file associated with your submission</p>
                        </div>

                      }


                      <div style={{width: "100%", display: "block", overflow: "hidden", float: "left", marginRight: "0"}}>
                        <label htmlFor='deposit_amount' style={{fontSize: "12px", display: "block", width: "100%"}}>Submission Description and Comments</label>
                        <textarea id='bug_description' cols="60" rows="5" className='ContractCode' type='text' style={{width: "920px", border: "0px", padding: "15px"}}></textarea>
                        {this.state.fulfillmentError &&
                          <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.fulfillmentError}</p>}
                      </div>
                      <div style={{width: "100%", display: "block", overflow: "hidden", float: "left", marginRight: "0"}}>
                      <button type='submit'  className='AddBtn' style={{backgroundColor: "#16e5cd", border:"0px", color: "white",  color: "#152639", display: "block", padding: "15px", margin: "0 auto", marginTop: "30px",marginBottom: "15px", fontSize: "1em", width: "200px", fontWeight: "700"}}>SUBMIT</button>

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
    if (this.state.contract.stage === "Active"){
      hexagonColour = "rgb(140, 226, 88)";
    }
    if (this.state.contract.stage === "Draft"){
      hexagonColour = "rgb(255, 186, 20)";
    }
    if (this.state.contract.stage === "Dead"){
      hexagonColour = "rgb(255, 104, 70)";
    }
    if (this.state.contract.stage === "Expired"){
      hexagonColour = "rgb(104, 166, 166)";
    }
    if (this.state.contract.stage === "Completed"){
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
                    {/*
                      <meta charSet="utf-8" />
                      <title>{"Bounties Explorer | " + this.state.contract.bountyData.title}</title>
                      <link rel="canonical" href={'https://beta.bounties.network/bounty/'+this.state.bountyId} />
                      <meta name="twitter:card" value="summary"/>
                  		<meta name="twitter:site" content="@ethbounties"/>
                  		<meta name="twitter:title" content={"Bounties Explorer | " + this.state.contract.bountyData.title}/>
                  		<meta name="twitter:description" content={this.state.contract.bountyData.description.substring(0,100)}/>
                  		<meta name="twitter:image:src" content="https://bounties.network/images/twitter.png"/>


                      <meta property="og:title" content={this.state.contract.bountyData.title + " | Bounties Explorer" }/>
                  		<meta property="og:type" content="website" />
                  		<meta property="og:url" content={'https://beta.bounties.network/bounty/'+this.state.bountyId}/>
                  		<meta property="og:image" content="https://bounties.network/images/twitter.png" />
                  		<meta property="og:description" content={this.state.contract.bountyData.description.substring(0,100)}/>


                      <meta property="og:title" content="EXPLORER SEO TEST"/>
                  		<meta property="og:type" content="website" />
                  		<meta property="og:url" content={'https://beta.bounties.network/bounty/'+this.state.bountyId}/>
                  		<meta property="og:image" content="https://bounties.network/images/twitter.png" />
                  		<meta property="og:description" content="EXPLORER SEO TEST"/>
                      */
                    }

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
           <p style={{fontSize: "18px", textAlign: "center"}}>To perform this action, you need to use a web3 enabled browser. We suggest using the <a href="https://metamask.io" target="_blank" style={{textDecoration: "none", color: "#16e5cd"}}> Metamask </a> browser extension.</p>
             </div>
         </Dialog>
        <div id={this.state.lightMode? "colourBodyLight": "colourBodyDark"} style={{minHeight: "100vh", position: "relative"}}>
          <div style={{position: "fixed", bottom: "15px", left: "15px", display: "block", overflow: "hidden", width: "100px"}} className="CornerEmoji">

          <div onClick={this.handleToggleLightMode} style={{backgroundImage:  this.state.lightMode? `url(${darkMoon})`:`url(${lightMoon})`, height: "28px", width: "28px", backgroundSize: "contain", backgroundRepeat: "no-repeat", display: "block", float: "left"}}>
          </div>
          </div>
          <div style={{overflow: "hidden"}} className="navBar">
            <a href="/" style={{width: "276px", overflow: "hidden", display: "block", padding: "1em 0em 1em 0em", margin: "0 auto"}}>
              <div style={{backgroundImage:  `url(${logo})`, height: "3em", width: "14em", backgroundSize: "contain", backgroundRepeat: "no-repeat", display: "block", float: "left", marginLeft: "57px"}}>
              </div>
            </a>
            <span style={{backgroundSize: 'cover', backgroundRepeat: 'no-repeat', borderRadius: '50%', boxShadow: 'inset rgba(255, 255, 255, 0.6) 0 2px 2px, inset rgba(0, 0, 0, 0.3) 0 -2px 6px'}} />

          </div>

          <div style={{ display: "block", overflow: "hidden", width: "1050px", margin: "0 auto", paddingBottom: "160px", display: "block"}}>

          {this.state.loading  &&

            <div style={{marginLeft: "505px", marginTop: "60px", overflow: "hidden", marginBottom: "60px"}}>
            <Halogen.ScaleLoader color={"#16e5cd"} />
            </div>
          }
          {
            !this.state.loading &&
            <div style={{float: "left", display: "block", margin: "0 15px", width: "1020px"}}>


              <div style={{marginBottom: "0px", boxShadow: "none", borderRadius: "0", padding: "30px", marginTop: "15px", border: "0", backgroundColor: this.state.lightMode? "rgb(249, 249, 249)": "rgba(10, 22, 40, 0.5)", borderBottom: "0px solid #16e5cd", color:this.state.lightMode?"rgb(25, 55, 83)":"white", paddingTop: "30px"}} className="ContractCard">
                <h3 style={{margin: "0px 15px 30px 15px", width: "100%", display: "inline", fontSize: "28px", textAlign: "center",  fontWeight: "600"}}> {this.state.contract.bountyData.title}</h3>

                <div style={{float: "left", display: "inline-block", width: "200px",}}>
                  <div style={{backgroundColor: this.state.lightMode? "rgba(1, 1, 1, 0.05)": "rgba(10, 22, 40, 0.5)", display: "block", overflow: "hidden", padding: "15px"}}>
                  <h5 style={{ fontSize: "13px", width: "100%", textAlign: "center", marginTop: "0px", marginBottom: "0px", color: "#8C9899", fontWeight: "200"}}>PRIZE</h5>

                  <h5 style={{ fontSize: "13px", width: "100%", textAlign: "center", marginTop: "7.5px", marginBottom: "0px", color: this.state.lightMode?"rgb(25, 55, 83)":"white", fontSize: "32px", fontWeight: "600"}}>{this.state.contract.value}<b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", fontWeight: "200", lineHeight: "28px"}}>{this.state.contract.symbol? this.state.contract.symbol : 'ETH'}</b></h5>

                  <h5 style={{textAlign: "center", marginTop: "0px", marginBottom: "0px", color: this.state.lightMode?"rgb(25, 55, 83)":"white", marginBottom: "15px", fontSize: "16px", fontWeight: "200"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", fontWeight: "500"}}>$</b>{numberWithCommas(parseInt((this.state.contract.value* this.state.prices[this.state.contract.symbol])))}</h5>

                    <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", textAlign: "center", marginBottom: "7.5px", color: this.state.lightMode?"#8C9899":"#d0d0d0"}}>Total Balance: {this.state.contract.balance + " " + this.state.contract.symbol}</p>
                  </div>

                  <form className='Contribute' onSubmit={this.handleContribute} style={{width: "100%", display: "inline-block", marginTop: "30px"}}>
                    <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center",  fontWeight: "600"}}> Contribute to Bounty</h4>
                    <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>Deposit Amount ({this.state.contract.symbol? this.state.contract.symbol: 'ΞTH'})</label>
                    <input id='deposit_amount' className='SendAmount' type='number'  step="any" style={{width: "182px", border: "0px"}}/>
                    {this.state.contributionError &&
                      <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.contributionError}</p>}
                    <button type='submit' className='AddBtn' style={{backgroundColor: this.state.lightMode?"rgba(0, 126, 255, 0)":"rgba(0, 126, 255, 0.24)", border:this.state.lightMode?"1px solid rgb(25, 55, 83)":"0px", color: this.state.lightMode?"rgb(25, 55, 83)":"white", width: "200px"}}>Contribute</button>

                  </form>
                  <div style={{margin: "0 auto", display: "block", overflow: "hidden", width: "111px"}}>
                    <a target="_blank" href={"https://twitter.com/home?status=New Bounty: "+ this.state.contract.bountyData.title.substring(0,80) + (this.state.contract.bountyData.title.length > 80? "...":"")+"%20https%3A//beta.bounties.network/bounty/"+this.state.bountyId}>
                    <SvgTwitter style={{width: "15px", height: "15px", color: "rgb(22, 229, 205)", padding: "5px", border: this.state.lightMode?"1px solid rgb(25, 55, 83)":"1px solid rgb(22, 229, 205)", borderRadius: "100px", marginTop: "30px", marginRight: "15px"}}
                                className="iconHover"/>
                    </a>
                    <a target="_blank" href={"https://www.facebook.com/sharer/sharer.php?u=https%3A//beta.bounties.network/bounty/"+this.state.bountyId}>
                    <SvgFacebook style={{width: "15px", height: "15px", color: "rgb(22, 229, 205)", padding: "5px", border: this.state.lightMode?"1px solid rgb(25, 55, 83)":"1px solid rgb(22, 229, 205)", borderRadius: "100px", marginTop: "30px", marginRight: "15px"}}
                                className="iconHover"/>
                    </a>
                    <a target="_blank" href={"http://reddit.com/submit?url=https%3A%2F%2Fbeta.bounties.network%2Fbounty%2F"+this.state.bountyId+"&title="+ this.state.contract.bountyData.title.substring(0,80) + (this.state.contract.bountyData.title.length > 80? "...":"")}>
                    <SvgReddit style={{width: "15px", height: "15px", color: "rgb(22, 229, 205)", padding: "5px", border: this.state.lightMode?"1px solid rgb(25, 55, 83)":"1px solid rgb(22, 229, 205)", borderRadius: "100px", marginTop: "30px"}}
                                className="iconHover"/>
                    </a>
                  </div>
                </div>
                <div style={{float: "left", display: "inline-block", width: "600px", paddingRight: "110px"}}>


                  <p style={{ fontSize: "14px", margin: "4px  0px 10px 0px", display: "inline-block", float: "left"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46"}}>Bounty Issuer: </b></p>
                  <Blockies
                  seed={this.state.contract.issuer}
                  size={9}
                  scale={2.5}
                  style={{borderRadius: "10px", display: "inline-block", float: "left"}}
                  />
                  <p style={{ fontSize: "14px", margin: "4px  0px 10px 0px", display: "inline-block", float: "left"}}><a style={{color: "#16e5cd"}} target={"_blank"} href={"/user/"+ this.state.contract.issuer}>{ this.state.contract.issuer}</a></p>


                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px", display: "block", overflow: "hidden"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", marginRight: "10px"}}>Bounty Stage:</b> {this.state.contract.stage}</p>

                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px", display: "block", overflow: "hidden"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", marginRight: "10px"}}>Deadline:</b> {this.state.contract.deadlineString}</p>

                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", marginRight: "10px"}}>Contact the bounty issuer:</b> { this.state.contract.bountyData.contact}</p>
                  {this.state.contract.bountyData.githubLink &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", marginRight: "10px"}}>Github Link: </b> <a style={{color: "#16e5cd"}} target={"_blank"} href={this.state.contract.bountyData.githubLink}> {this.state.contract.bountyData.githubLink} </a> </p>}

                  {this.state.contract.bountyData.sourceDirectoryHash &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", marginRight: "10px"}}>Associated File: </b> <a style={{color: "#16e5cd"}} target={"_blank"} href={"https://ipfs.infura.io/ipfs/" + this.state.contract.bountyData.sourceDirectoryHash + "/"+ this.state.contract.bountyData.sourceFileName}> {this.state.contract.bountyData.sourceFileName} </a> </p>}
                  {this.state.contract.paysTokens &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", marginRight: "10px"}}>Token Contract:</b> <a style={{color: "#16e5cd"}} target={"_blank"} href={"https://etherscan.io/address/"+ this.state.contract.tokenContract.address}>{this.state.contract.tokenContract.address}</a></p>}
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", marginRight: "10px"}}>Description: </b> </p>
                  <Text style={{ fontSize: "14px", width: "100%", margin: "0px 10px 10px 0px", color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", textDecoration: "none"}}>{this.state.contract.bountyData.description}</Text>
                  <div style={{margin: "0 auto", display: "block", overflow: "hidden", marginTop: "15px"}}>
                    {categories}
                  </div>
                </div>
                {
                  /*
                  <div className="" style={{width: "110px", marginTop: "0px", webkitMask: `url(${hexagonImage}) no-repeat 50% 50%`, mask: `url(${hexagonImage}) no-repeat 50% 50%`, webkitMaskSize: "cover", maskSize: "cover", backgroundColor: hexagonColour, height: "130px", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <p style={{ fontSize: "20px", width: "100%", textAlign: "center", display: "block", fontWeight: "600", color: "#16283b"}}>{this.state.contract.stage} Bounty</p>
                  </div>
                  */
                }






                {actions}

            </div>


            <Tabs tabItemContainerStyle={{backgroundColor: this.state.lightMode?"rgb(249,249,249)":"rgba(10, 22, 40, 0.5)", color: "#16e5cd"}}
                  inkBarStyle={{backgroundColor: "rgb(255, 222, 70)", color: "#16e5cd"}}
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
              <Tab label={numPushed+" Submission"+(numPushed !== 1? "s" : "")} value={0} style={{color: this.state.mainTabValue === 0? "#fff" : "#16e5cd", fontSize: "16px", backgroundColor: this.state.mainTabValue === 0? (this.state.lightMode? "rgb(25, 55, 83)":"rgba(10, 22, 40, 0.5)"): "rgba(10, 22, 40, 0)"}}>
                {fulBody}
              </Tab>
              <Tab label={this.state.myComments.length+" Comment"+(this.state.myComments.length !== 1? "s" : "")} value={1} style={{color: this.state.mainTabValue === 1? "#fff" : "#16e5cd", fontSize: "16px", backgroundColor: this.state.mainTabValue === 1? (this.state.lightMode? "rgb(25, 55, 83)":"rgba(10, 22, 40, 0.5)") : "rgba(10, 22, 40, 0)"}}>
                {comments}
              </Tab>


            </Tabs>



          </div>
          }
        </div>
        <p style={{textAlign: "center", display: "block", fontSize: "10px", padding: "15px 0px", color: this.state.lightMode? "rgb(25, 55, 83)":"rgba(256,256,256,0.75)", width: "100%", position: "absolute", bottom: "0px"}}>&copy; Bounties Network, a <a href="https://ConsenSys.net" target="_blank" style={{textDecoration: "none", color: this.state.lightMode? "rgb(25, 55, 83)":"#16e5cd"}}>ConsenSys</a> Formation <br/>
         <a href="/privacyPolicy/" target="_blank" style={{color: this.state.lightMode? "rgb(25, 55, 83)":"rgba(256,256,256,0.75)"}}>Privacy Policy</a>{" | "}<a href="/terms/" target="_blank" style={{color: this.state.lightMode? "rgb(25, 55, 83)":"rgba(256,256,256,0.75)"}}>Terms of Service</a>
         </p>
      </div>
    </div>
    )
  }
}

export default BountyPage
