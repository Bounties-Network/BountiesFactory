import React, { Component } from 'react'
import './BountyPage.css'


const json = require('../../../contracts.json');



const networkId = json.networkId;

import Web3 from 'web3';

const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const BN = require(`bn.js`);

const utf8 = require('utf8');

import logo from '../AppContainer/images/logo.svg';


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
import SvgDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import SvgUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';

import Dialog from 'material-ui/Dialog';

import {Tabs, Tab} from 'material-ui/Tabs';

import Avatar from 'material-ui/Avatar';

import Halogen from 'halogen';

import Blockies from 'react-blockies';

import Text from 'react-format-text';

const ipfsAPI = require('ipfs-api');


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
      standardBountiesAddress = json.mainNet.standardBountiesAddress;
      userCommentsAddress = json.mainNet.userCommentsAddress;
      networkName = "Main Network";
      localStorage.setItem('ethereumNetwork', "MainNet");
    } else {
      if (stored === "MainNet"){
        providerLink = "https://mainnet.infura.io";
        requiredNetwork = 1;
        standardBountiesAddress = json.mainNet.standardBountiesAddress;
        userCommentsAddress = json.mainNet.userCommentsAddress;
        networkName = "Main Network";


      } else if (stored === "Rinkeby"){
        providerLink = "https://rinkeby.infura.io";
        requiredNetwork = 4;
        standardBountiesAddress = json.rinkeby.standardBountiesAddress;
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
        noWeb3Error: false,
        fulfillmentOpen: false,
        commentOnBountyOpen: false,
        containsCode: false,
        requiredNetwork: requiredNetwork,
        networkName: networkName,
        standardBountiesAddress: standardBountiesAddress,
        userCommentsAddress: userCommentsAddress,
        StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(standardBountiesAddress),
        UserComments : web3.eth.contract(json.interfaces.UserComments).at(userCommentsAddress)

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

    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
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
      if (parseInt(difference/oneMillenium) >= 1){
        var num = parseInt(difference/oneMillenium);
        var time = (num === 1? "millennium" : "millennia");
        return ("ends in " + num + " "+time);
      }
      if (parseInt(difference/oneCentury) >= 1){
        var num = parseInt(difference/oneCentury);
        var time = (num === 1? "century" : "centuries");
        return ("ends in " + num + " "+time);
      }
      if (parseInt(difference/oneDecade) >= 1){
        var num = parseInt(difference/oneDecade);
        var time = (num === 1? "decade" : "decades");
        return ("ends in " + num + " "+time);
      }
      if (parseInt(difference/oneYear) >= 1){
        var num = parseInt(difference/oneYear);
        var time = (num === 1? "year" : "years");
        return ("ends in " + num + " "+time);
      }
      if (parseInt(difference/oneMonth) >= 1){
        var num = parseInt(difference/oneMonth);
        var time = (num === 1? "month" : "months");
        return ("ends in " + num + " "+time);
      }
      if (parseInt(difference/oneWeek) >= 1){
        var num = parseInt(difference/oneWeek);
        var time = (num === 1? "week" : "weeks");
        return ("ends in " + num + " "+time);
      }
      if (parseInt(difference/oneDay) >= 1){
        var num = parseInt(difference/oneDay);
        var time = (num === 1? "day" : "days");
        return ("ends in " + num + " "+time);
      }
      if (parseInt(difference/oneHour) >= 1){
        var num = parseInt(difference/oneHour);
        var time = (num === 1? "hour" : "hours");
        return ("ends in " + num + " "+time);
      }
      if (parseInt(difference/oneMinute) >= 1){
        var num = parseInt(difference/oneMinute);
        var time = (num === 1? "minute" : "minutes");
        return ("ends in " + num + " "+time);
      }
      if (parseInt(difference/oneSecond) >= 1){
        var num = parseInt(difference/oneSecond);
        var time = (num === 1? "second" : "seconds");
        return ("ends in " + num + " "+time);
      }

    } else if (difference < 0){
      difference = difference * -1;
      if (parseInt(difference/oneMillenium) >= 1){
        var num = parseInt(difference/oneMillenium);
        var time = (num === 1? "millennium" : "millennia");
        return (num + " "+time+" ago");
      }
      if (parseInt(difference/oneCentury) >= 1){
        var num = parseInt(difference/oneCentury);
        var time = (num === 1? "century" : "centuries");
        return (num + " "+time+" ago");
      }
      if (parseInt(difference/oneDecade) >= 1){
        var num = parseInt(difference/oneDecade);
        var time = (num === 1? "decade" : "decades");
        return (num + " "+time+" ago");
      }
      if (parseInt(difference/oneYear) >= 1){
        var num = parseInt(difference/oneYear);
        var time = (num === 1? "year" : "years");
        return (num + " "+time+" ago");
      }
      if (parseInt(difference/oneMonth) >= 1){
        var num = parseInt(difference/oneMonth);
        var time = (num === 1? "month" : "months");
        return (num + " "+time+" ago");
      }
      if (parseInt(difference/oneWeek) >= 1){
        var num = parseInt(difference/oneWeek);
        var time = (num === 1? "week" : "weeks");
        return (num + " "+time+" ago");
      }
      if (parseInt(difference/oneDay) >= 1){
        var num = parseInt(difference/oneDay);
        var time = (num === 1? "day" : "days");
        return (num + " "+time+" ago");
      }
      if (parseInt(difference/oneHour) >= 1){
        var num = parseInt(difference/oneHour);
        var time = (num === 1? "hour" : "hours");
        return (num + " "+time+" ago");
      }
      if (parseInt(difference/oneMinute) >= 1){
        var num = parseInt(difference/oneMinute);
        var time = (num === 1? "minute" : "minutes");
        return (num + " "+time+" ago");
      }
      if (parseInt(difference/oneSecond) >= 1){
        var num = parseInt(difference/oneSecond);
        var time = (num === 1? "second" : "seconds");
        return (num + " "+time+" ago");
      }

    } else {
      return "now";
    }
  }
  componentDidMount() {

    window.addEventListener('load',this.getInitialData);

  }

  handleTabsChange(value){
    this.setState({
      tabValue: value,
    });
    console.log("changed tab");
  }
  handleMainTabsChange(value){
    this.setState({
      mainTabValue: value,
    });
    console.log("changed tab");
  }
  handleCaptureEditFile (event) {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
    this.setState({editSourceFileName: file.name, didUploadFile: true});


    let reader = new window.FileReader()
    reader.onloadend = () => this.saveToIpfsEdit(reader)
    reader.readAsArrayBuffer(file)
  }
  saveToIpfsEdit (reader) {
    let ipfsId

    const buffer = Buffer.from(reader.result);
    console.log("about to save...", buffer, reader);

    ipfs.add([buffer], (err, response)=> {
      console.log("response", response);

      this.setState({editSourceFileHash: response, fileUploadFinished: true});
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
    if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
      // Use Mist/MetaMask's provider
      web3.setProvider(window.web3.currentProvider);
      web3.version.getNetwork((err, netId) => {
        if (parseInt(this.state.requiredNetwork) !== parseInt(netId)){
          console.log("network, ", netId, this.state.requiredNetwork);
            this.setState({modalError: ("Please change your Ethereum network to the " + this.state.networkName), modalOpen: true});
        } else {

        web3.eth.getAccounts(function(err, accs){
          if (err){
            console.log ('error fetching accounts', err);
          } else {
            if (accs.length === 0){
              this.setState({modalError: "Please unlock your MetaMask Accounts", modalOpen: true});

            } else {


            var account = web3.eth.accounts[0];
            setInterval(function() {
              if (web3.eth.accounts[0] !== account) {
                account = web3.eth.accounts[0];
                window.location.reload();
              }
            }, 100);

            this.setState({accounts: accs});
            this.state.StandardBounties.getBounty(this.state.bountyId, (err, succ)=> {
              this.state.StandardBounties.getBountyData(this.state.bountyId, (err, data)=> {
                if (data){
                  console.log("data", data);

                  ipfs.catJSON(data, (err, result)=> {
                    var stage;
                    if (parseInt(succ[4], 10) === 0){
                      stage = "Draft";
                    } else if (parseInt(succ[4], 10) === 1){
                      stage = "Active";
                    } else {
                      stage = "Dead";
                    }
                    var intDate = parseInt(succ[1], 10);
                    var newDate;
                    var dateString;
                    var max = new BN(8640000000000000);
                    if ((succ[1].times(1000)).greaterThan(max)){
                      newDate = new Date(parseInt(max, 10));
                      console.log("new date bigger", newDate)
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
                  ipfs.catJSON(succ[0], (err, result)=> {
                    comments.push({title: result.title,
                                  aboutFulfillment: result.aboutFulfillment,
                                  fulfillmentId: result.fulfillmentId,
                                  from: from,
                                  to: to,
                                  aboutBounty: aboutBounty,
                                  bountyId: bountyId,
                                  description: result.description,
                                  date: date.toUTCString()});
                    if (comments.length === total){
                      this.setState({comments: comments});
                    }
                  });
                });
              }
            });

          }
        }
          }.bind(this));
        }
      });

    } else {
      this.state.StandardBounties.getBounty(this.state.bountyId, (err, succ)=> {
        this.state.StandardBounties.getBountyData(this.state.bountyId, (err, data)=> {
          if (data){
            console.log("data", data);

            ipfs.catJSON(data, (err, result)=> {
              var stage;
              if (parseInt(succ[4], 10) === 0){
                stage = "Draft";
              } else if (parseInt(succ[4], 10) === 1){
                stage = "Active";
              } else {
                stage = "Dead";
              }
              var newDate = new Date(parseInt(succ[1], 10)*1000);
              var dateString = this.dateToString(parseInt(succ[1], 10)*1000);


              if (!succ[3]){
                var value = web3.fromWei(parseInt(succ[2], 10), 'ether');
                var balance = web3.fromWei(parseInt(succ[5], 10), 'ether');
                console.log("balance: ", value, balance);
                this.setState({contract: {
                  issuer: succ[0],
                  deadline: newDate.toUTCString(),
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
                optionsList: result.categories});
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
                      optionsList: result.categories});

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
        console.log("got fulfillment", fulfillments);

        if (fulfillments.length === total){

          fulfillments.sort(function(f1, f2){return f1.fulfillmentId-f2.fulfillmentId});

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
            console.log("new date bigger", newDate)
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

        ipfs.addJSON({description: data, sourceFileName: this.state.sourceFileName, sourceFileHash: this.state.sourceFileHash, contact: contact}, (err, succ)=> {
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
    this.setState({sourceFileName: file.name});


    let reader = new window.FileReader()
    reader.onloadend = () => this.saveToIpfs(reader)
    reader.readAsArrayBuffer(file)
  }
  saveToIpfs (reader) {
    let ipfsId;
    // eslint-disable-next-line
    const buffer = Buffer.from(reader.result);
    ipfs.add(buffer, (err, response)=> {
      console.log("response", response);

      ipfsId = response[0].hash;
      console.log("response", ipfsId);

      this.setState({sourceFileHash: response});

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

  render() {
    document.title = "Bounties Explorer | " + this.state.contract.bountyData.title;



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
            <Tab label="Activate Bounty" value={0} style={{color: this.state.tabValue === 0? "#fff" : "#16e5cd"}}>
              <ActivateForm onhandleActivate={this.handleActivate} tokenDetails={this.state.tokenDetails} amount={this.state.contract.value}/>
            </Tab>
            <Tab label="Edit Bounty" value={1} style={{color: this.state.tabValue === 1? "#fff" : "#16e5cd"}}>
              <EditForm
              onHandleEdit={this.handleEdit}
              bountyData={this.state.contract.bountyData}
              selectedValue={this.state.selectedValue}
              onHandleChangeSelected={this.handleSelectChange}
              onHandleCaptureEditFile={this.handleCaptureEditFile}
              sourceFileName={this.state.editSourceFileName}
              containsCode={this.state.containsCode}
              />
            </Tab>
            <Tab label="Change Deadline" value={2} style={{color: this.state.tabValue === 2? "#fff" : "#16e5cd"}}>
              <ChangeDeadlineForm onhandleChangeDeadline={this.handleChangeDeadline} deadlineError={this.state.deadlineError} dateNum={this.state.contract.dateString}/>
            </Tab>
            <Tab label="Transfer Ownership" value={3} style={{color: this.state.tabValue === 3? "#fff" : "#16e5cd"}}>
              <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
            </Tab>
            <Tab label="Increase Reward" value={4} style={{color: this.state.tabValue === 4? "#fff" : "#16e5cd"}}>
              <IncreasePayoutForm onhandleIncrease={this.handleIncreasePayout} increasePayoutError={this.state.increasePayoutError} symbol={this.state.contract.symbol}/>
            </Tab>
          </Tabs>
          </div>
        );
      }  else if (this.state.contract.stage === "Active"){

        actions = (
          <div style={{width: "100%"}}>
          <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "#16e5cd"}} inkBarStyle={{backgroundColor: "rgb(255, 222, 70)", color: "#16e5cd"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
            <Tab label="Extend Bounty Deadline" value={0} style={{color: this.state.tabValue === 0? "#fff" : "#16e5cd"}}>
              <ExtendDeadlineForm onhandleDeadline={this.handleDeadline} deadlineError={this.state.deadlineError} dateNum={this.state.contract.dateString}/>
            </Tab>
            <Tab label="Increase Reward" value={3} style={{color: this.state.tabValue === 3? "#fff" : "#16e5cd"}}>
              <IncreasePayoutForm onhandleIncrease={this.handleIncreasePayout} increasePayoutError={this.state.increasePayoutError} symbol={this.state.contract.symbol}/>
            </Tab>
            <Tab label="Kill Bounty" value={1} style={{color: this.state.tabValue === 1? "#fff" : "#16e5cd"}}>
              <KillBountyForm onhandleKill={this.handleKill} />
            </Tab>
            <Tab label="Transfer Ownership" value={2} style={{color: this.state.tabValue === 2? "#fff" : "#16e5cd"}}>
              <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
            </Tab>
          </Tabs>
          </div>
        );
      } else if (this.state.contract.stage === "Dead"){
         actions=(
           <div style={{width: "100%"}}>
           <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "#16e5cd"}} inkBarStyle={{backgroundColor: "rgb(255, 222, 70)", color: "#16e5cd"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
             <Tab label="Re-activate Bounty" value={0} style={{color: this.state.tabValue === 0? "#fff" : "#16e5cd"}}>
               <ActivateForm onhandleActivate={this.handleActivate} tokenDetails={this.state.tokenDetails} amount={this.state.contract.value}/>
             </Tab>
             <Tab label="Extend Bounty Deadline" value={1} style={{color: this.state.tabValue === 1? "#fff" : "#16e5cd"}}>
               <ExtendDeadlineForm onhandleDeadline={this.handleDeadline} deadlineError={this.state.deadlineError} dateNum={this.state.contract.dateString}/>
             </Tab>
             <Tab label="Transfer Ownership" value={2} style={{color: this.state.tabValue === 2? "#fff" : "#16e5cd"}}>
               <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
             </Tab>
             <Tab label="Increase Reward" value={3} style={{color: this.state.tabValue === 3? "#fff" : "#16e5cd"}}>
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
          var icon;
          if (this.state.contract.bountyData.categories[i] === "Bugs"){
            icon=(<SvgBug />);
          } else if (this.state.contract.bountyData.categories[i] === "Code"){
            icon=(<SvgCode />);
          } else if (this.state.contract.bountyData.categories[i] === "Graphic Design"){
            icon=(<SvgGraphic />);
          } else if (this.state.contract.bountyData.categories[i] === "Questions"){
            icon=(<SvgQuestion />);
          } else if (this.state.contract.bountyData.categories[i] === "Surveys"){
            icon=(<SvgSurvey />);
          } else if (this.state.contract.bountyData.categories[i] === "Social Media"){
            icon=(<SvgSocial />);
          } else if (this.state.contract.bountyData.categories[i] === "Content Creation"){
            icon=(<SvgContent />);
          } else if (this.state.contract.bountyData.categories[i] === "Translations"){
            icon=(<SvgTranslations />);
          }
          categories.push(
            <Chip style={{margin: "0px 15px 5px 0px", float: "left", border: "1px solid rgba(0, 126, 255, 0.24)", backgroundColor: "rgba(0, 126, 255, 0.08)", height: "30px"}}
                  labelStyle={{color: "white", lineHeight: "28px"}}
                  key={this.state.contract.bountyData.categories[i]}>
              <Avatar color="rgb(255, 222, 70)" icon={icon} style={{backgroundColor: "rgba(0, 126, 255, 0.24)", height: "28px", width: "28px"}}/>
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
          <div style={{backgroundColor: "rgba(10, 22, 40, 0.5)", display: "block", overflow: "hidden", padding: "15px"}}>
              <h5 style={{margin: "5px 0px"}}><b style={{fontSize: "16px"}}>{this.state.myComments[i].title}</b></h5>
              <p style={{ fontSize: "15px", width: "100%", margin: "2.5px 0px", }}><b style={{color: "#FFDE46"}}></b>{this.state.myComments[i].description}</p>

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
        <div style={{overflow: "hidden", display: "block", width: "940px", backgroundColor: "rgba(10, 22, 40, 0.5)", position: "relative", padding: "30px", marginBottom: "30px"}}>
          <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "0px", textAlign: "center", fontSize: "1.17em"}}>Comment on Bounty</h4>

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
              <button type='submit'  className='AddBtn' style={{backgroundColor: "rgba(0, 126, 255, 0.24)", border:"0px", color: "white",  display: "block", padding: "16px", margin: "0 auto", marginTop: "30px", fontSize: "1em", width: "200px"}}>Comment</button>
            </form>
          }
        </div>
        {commentsArray}
      </div>
    );
    var numPushed = 0;

    if (this.state.fulfillments.length){
      var fulfillments = [];
      for (var i = 0; i < this.state.fulfillments.length; i++){
        var fulfillmentComments = [];
        for (var j = 0; j < this.state.fulfillments[i].comments.length; j++){
          fulfillmentComments.push(
            <div style={{display: "block", width: "793px", marginBottom: "5px", borderBottom: j === (this.state.fulfillments[i].comments.length-1)? "0px" : "1px solid rgba(0,0,0,0.3)", paddingBottom: "10px", overflow: "hidden"}}>

              <Text style={{ fontSize: "14px", width: "100%", margin: "0px 10px 10px 0px", color: "#FFDE46", textDecoration: "none", display: "block", overflow: "hidden"}}>{this.state.fulfillments[i].comments[j].description}</Text>

              <p style={{ fontSize: "10px", margin: "4px  10px 2.5px 0px", display: "inline-block", float: "left"}}><b style={{color: "#FFDE46"}}>By: </b></p>
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
          <div style={{display: "block", borderLeft: "1px solid #16e5cd", marginBottom: "15px", overflow: "hidden"}} key={this.state.fulfillments[i].fulfiller+i}>

            <div style={{backgroundColor: "rgba(10, 22, 40, 0.5)"}}>
            <div style={{display: "block", overflow: "hidden", padding: "15px", position: "relative"}}>
              <div style={{width: "88%", display: "inline-block", float: "left"}}>
                <p style={{ fontSize: "14px", margin: "4px  10px 2.5px 0px", display: "inline-block", float: "left"}}><b style={{color: "#FFDE46"}}>Bounty Hunter: </b></p>
                <Blockies
                seed={this.state.fulfillments[i].fulfiller}
                size={9}
                scale={2.5}
                style={{borderRadius: "10px", display: "inline-block", float: "left"}}
                />
                <p style={{ fontSize: "14px", margin: "4px  10px 2.5px 10px", display: "inline-block", float: "left"}}><a style={{color: "#16e5cd"}} target={"_blank"} href={"/user/"+ this.state.fulfillments[i].fulfiller}>{this.state.fulfillments[i].fulfiller}</a></p>
                {this.state.fulfillments[i].data.contact &&
                <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px", display: "block", overflow: "hidden"}}><b style={{color: "#FFDE46"}}>Contact: </b> {this.state.fulfillments[i].data.contact} </p>}
                {this.state.fulfillments[i].data.sourceFileHash &&
                <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px", display: "block", overflow: "hidden"}}><b style={{color: "#FFDE46"}}>Associated File: </b> <a style={{color: "#16e5cd"}} target={"_blank"} href={"https://ipfs.infura.io/ipfs/" + this.state.fulfillments[i].data.sourceFileHash} download={this.state.fulfillments[i].data.sourceFileName}> {this.state.fulfillments[i].data.sourceFileName} </a> </p>}
                <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px", color: "#FFDE46", display: "block", overflow: "hidden"}}><b>Submission</b>:</p>
                <Text style={{ fontSize: "14px", width: "100%", margin: "0px 10px 10px 0px", color: "#FFDE46", textDecoration: "none", display: "block", overflow: "hidden"}}>{this.state.fulfillments[i].data.description}</Text>
                <FlatButton style={{backgroundColor: "rgba(0, 126, 255, 0.24)", border:"0px", color: "white", float: "left",  marginTop: "15px", display: "block", width: "200px"}} onClick={this.handleExpandComment.bind(this,i)}>Add Comment </FlatButton>
                {this.state.fulfillments[i].commentsOpen &&
                  <form className='Contribute' onSubmit={this.handleCommentOnFulfillment} style={{width: "967px", display: "inline-block", paddingTop: "15px"}}>

                    <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "5px", textAlign: "center", fontSize: "16px"}}>Comment on Submission</h4>
                    <input id="comment_index" value={i} style={{display: "none"}}></input>

                    <label htmlFor='comment_description' style={{fontSize: "12px", display: "block", marginTop: "15px"}}>Comment</label>
                    <textarea id='comment_description' cols="60" rows="3" className='ContractCode' type='text' style={{width: "952px", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}></textarea>
                    {this.state.fulfillments[i].commentError &&
                      <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "10px", textAlign: "center"}}>{this.state.fulfillments[i].commentError}</p>}
                    <button type='submit'  className='AddBtn' style={{backgroundColor: "#16e5cd", border:"0px", color: "rgb(21, 38, 57)",  display: "block", padding: "10px 16px", margin: "0 auto", marginTop: "15px", fontSize: "1em", width: "200px"}}>Comment</button>
                  </form>

                }
                {this.state.fulfillments[i].comments.length > 0 &&
                  <div style={{borderTop: "1px solid rgba(256,256,256, 0.18)", padding: "30px 0px 0px 30px", marginTop: this.state.fulfillments[i].commentsOpen?"30px":"70px"}}>
                    <h5 style={{margin: "5px 0px", textAlign: "left", fontWeight: "200"}}><b style={{fontSize: "16px", fontWeight: "200", color: "#FFDE46"}}>{this.state.fulfillments[i].comments.length} Comment{ this.state.fulfillments[i].comments.length === 1? "" : "s"}</b></h5>

                    {fulfillmentComments}

                  </div>
                }


              </div>
              <div style={{width: "12%", display: "inline-block", float: "left"}}>
              <Chip style={{float: "right", border: "1px solid rgba(0, 126, 255, 0.24)", backgroundColor: "rgba(0, 126, 255, 0.08)", height: "30px", margin: "5px auto"}}
                    labelStyle={{color: this.state.fulfillments[i].accepted? "#16e5cd" : "#FFDE46", fontSize: "14px", marginTop: "-2px"}}
                    key={this.state.fulfillments[i].accepted? "Accepted" : "Not Accepted"}>
                    {this.state.fulfillments[i].accepted? "Accepted" : "Not Accepted"}
              </Chip>
                {this.state.contract.stage === "Active" && !this.state.fulfillments[i].accepted && this.state.accounts && this.state.accounts[0] === this.state.contract.issuer &&
                <FlatButton style={{backgroundColor: "#16e5cd", border:"0px", color: "#152639", float: "right",  margin: "10px", display: "block"}} onClick={this.handleAccept.bind(this,i)}> Accept </FlatButton>}

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
            <div style={{backgroundColor: "rgba(10, 22, 40, 0.5)", display: "block", overflow: "hidden", marginBottom: "30px"}}>
              <div style={{width: "940px", marginTop: "15px", marginLeft: "15px", marginRight: "15px", position: "relative", padding: "15px"}}>
                {!this.state.fulfillmentOpen? <SvgDown onClick={this.handleToggleFulfillment} style={{position: "absolute", right: "15px", top: "15px", width: "40px", height: "40px", color: "rgb(22, 229, 205)", marginTop: "-7px"}}/>
              : <SvgUp onClick={this.handleToggleFulfillment} style={{position: "absolute", right: "0px", top: "0px", width: "40px", height: "40px", color: "rgb(22, 229, 205)", marginTop: "-7px"}}/>}
                <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center"}}>Fulfill the Bounty</h3>
                {this.state.fulfillmentOpen &&

                  <div style={{paddingBottom: "0px"}}>
                    <form className='Fulfill' onSubmit={this.handleFulfill} style={{marginBottom: "15px"}}>
                    <div style={{width: "445px", display: "block", overflow: "hidden", float: "left", marginRight: "15px"}}>
                    <label htmlFor='contact' style={{fontSize: "12px"}}>{"Contact"}</label>
                    <input id='contact' className='SendAmount' style={{width: "450px", border: "0px", display: "block"}}/>
                    </div>
                    <div style={{width: "445px", display: "block", overflow: "hidden", float: "left", marginLeft: "15px"}}>
                      <label style={{fontSize: "12px"}} htmlFor='contract_code'>Associated Files</label>
                      <input id='contract_code' type="file" name="file" onChange={this.handlecaptureFile} style={{width: "0px", display: "block", border: "0px", color: "white", height: "0px", padding: "0px", margin: "0px"}}/>
                      <div style={{width: "440px", display: "block", border: "0px", color: "white", height: "20px", padding: "7.5px", paddingTop: "6px", paddingLeft: "0px", borderRadius: "4px"}}>
                        <label htmlFor="contract_code" style={{backgroundColor: "white", color: "#122134", padding: "3px 15px", fontWeight: "700", borderRadius: "0px", marginTop: "-1px"}}> Upload </label>
                        <span style={{float: "right", marginRight: "30px"}}> {fileName} </span>
                      </div>
                      <p style={{fontSize: "12px", color: "rgba(265,265,265, 0.55)", marginTop: "5px"}}>any file associated with your submission</p>
                    </div>


                      <input id='bounty_deadline' type='text' defaultValue={0} style={{width: "0.01px", display: "none"}}/>

                      <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>Submission Description and Comments</label>
                      <textarea id='bug_description' cols="60" rows="5" className='ContractCode' type='text' style={{width: "920px", border: "0px"}}></textarea>
                      {this.state.fulfillmentError &&
                        <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.fulfillmentError}</p>}
                        <button type='submit' className='AddBtn' style={{backgroundColor: "#16e5cd", border:"0px", color: "#152639", width: "200px", margin: "0 auto", display: "block"}}>Submit</button>
                    </form>
                  </div>
                }

              </div>
            </div>

          }
          {fulfillments}
        </div>
      );


    }
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
        <div id="colourBody">
          <div style={{overflow: "hidden"}}>
            <a href="/" style={{width: "276px", overflow: "hidden", display: "inline-block", float: "left", padding: "1.25em 0em"}}>
              <div style={{backgroundImage: `url(${logo})`, width: "14em", backgroundSize: "contain", backgroundRepeat: "no-repeat",  height: "3em", float: "left", marginLeft: "60px", display: "block"}}>
              </div>
            </a>
          <BountiesFacts total={this.state.total}/>
          <span style={{backgroundSize: 'cover', backgroundRepeat: 'no-repeat', borderRadius: '50%', boxShadow: 'inset rgba(255, 255, 255, 0.6) 0 2px 2px, inset rgba(0, 0, 0, 0.3) 0 -2px 6px'}} />

          <div style={{display: "block", width: "190px", backgroundColor: "rgba(10, 22, 40, 0.25)", overflow: "hidden", float: "right", margin: "15px"}}>
            <select onChange={this.handleChangeNetwork} value={this.state.requiredNetwork} style={{fontSize: "10px",backgroundColor: "rgba(10, 22, 40, 0)",border: "0px",color: "#d0d0d0", width: "190px", height: "30px", display: "block", borderRadius: "0px", WebkitAppearance: "none", 	background: "url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgaWQ9IkxheWVyXzEiIGRhdGEtbmFtZT0iTGF5ZXIgMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNC45NSAxMCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMxNzM3NTM7fS5jbHMtMntmaWxsOiMxNmU1Y2Q7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5hcnJvd3M8L3RpdGxlPjxyZWN0IGNsYXNzPSJjbHMtMSIgd2lkdGg9IjQuOTUiIGhlaWdodD0iMTAiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMS40MSA0LjY3IDIuNDggMy4xOCAzLjU0IDQuNjcgMS40MSA0LjY3Ii8+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjMuNTQgNS4zMyAyLjQ4IDYuODIgMS40MSA1LjMzIDMuNTQgNS4zMyIvPjwvc3ZnPg==) no-repeat 100% 50%", padding: "0px 10px"}}>
              <option value="1">Ethereum Main Network</option>
              <option value="4">Rinkeby Network</option>
            </select>
          </div>
          <FlatButton href="/newBounty/" style={{backgroundColor: "rgba(0,0,0,0)", border:"1px solid #16e5cd", color: "#16e5cd", width: "150px", marginTop: '15px', float: "right"}} > New Bounty </FlatButton>

          </div>

          <div style={{ display: "block", overflow: "hidden", width: "1050px", margin: "0 auto", paddingBottom: "160px", display: "block"}}>

            <div style={{float: "left", display: "block", margin: "0 15px", width: "1000px"}}>
            { this.state.loading &&

              <div style={{marginLeft: "480px", marginTop: "60px", overflow: "hidden", marginBottom: "60px"}}>
              <Halogen.ScaleLoader color={"#16e5cd"} />
              </div>
            }
              <div style={{marginBottom: "0px", boxShadow: "none", borderRadius: "0", padding: "30px", marginTop: "15px", border: "0", backgroundColor: "rgba(10, 22, 40, 0.5)", borderBottom: "0px solid #16e5cd", color :"white", paddingTop: "30px"}} className="ContractCard">
              <h3 style={{margin: "0px 15px 30px 15px", width: "100%", display: "inline", fontSize: "28px", textAlign: "center"}}> {this.state.contract.bountyData.title}</h3>

                <div style={{float: "left", display: "inline-block", width: "200px",}}>
                  <div style={{backgroundColor: "rgba(10, 22, 40, 0.5)", display: "block", overflow: "hidden", padding: "15px"}}>

                    <h1 style={{textAlign: "center", marginTop: "7.5px", marginBottom: "7.5px"}}>{this.state.contract.value}</h1>
                    <h5 style={{ fontSize: "17px", width: "100%", textAlign: "center", marginTop: "0px", marginBottom: "0px", color: "#FFDE46"}}>{this.props.symbol? this.props.symbol : 'ETH'}</h5>
                    <h5 style={{ fontSize: "13px", width: "100%", textAlign: "center", marginTop: "0px", marginBottom: "0px", color: "#8C9899", fontWeight: "200"}}>PRIZE</h5>
                    <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", textAlign: "center", marginBottom: "7.5px"}}><b style={{color: "#FFDE46", fontWeight: "500", marginRight: "5px"}}>BALANCE</b> {this.state.contract.balance + " " + this.state.contract.symbol}</p>
                  </div>
                  <form className='Contribute' onSubmit={this.handleContribute} style={{width: "100%", display: "inline-block", marginTop: "30px"}}>
                    <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center"}}> Contribute to Bounty</h4>
                    <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>Deposit Amount ({this.state.contract.symbol? this.state.contract.symbol: 'ΞTH'})</label>
                    <input id='deposit_amount' className='SendAmount' type='number'  step="any" style={{width: "182px", border: "0px"}}/>
                    {this.state.contributionError &&
                      <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.contributionError}</p>}
                    <button type='submit' className='AddBtn' style={{backgroundColor: "rgba(0, 126, 255, 0.24)", border:"0px", color: "white", width: "200px"}}>Contribute</button>

                  </form>
                </div>
                <div style={{float: "left", display: "inline-block", width: "600px", paddingRight: "110px"}}>


                  <p style={{ fontSize: "14px", margin: "4px  0px 10px 0px", display: "inline-block", float: "left"}}><b style={{color: "#FFDE46"}}>Bounty Issuer: </b></p>
                  <Blockies
                  seed={this.state.contract.issuer}
                  size={9}
                  scale={2.5}
                  style={{borderRadius: "10px", display: "inline-block", float: "left"}}
                  />
                  <p style={{ fontSize: "14px", margin: "4px  0px 10px 0px", display: "inline-block", float: "left"}}><a style={{color: "#16e5cd"}} target={"_blank"} href={"/user/"+ this.state.contract.issuer}>{ this.state.contract.issuer}</a></p>



                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px", display: "block", overflow: "hidden"}}><b style={{color: "#FFDE46", marginRight: "10px"}}>Bounty Stage:</b> {this.state.contract.stage}</p>
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "#FFDE46", marginRight: "10px"}}>Deadline:</b> {this.state.contract.deadlineString}</p>

                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "#FFDE46", marginRight: "10px"}}>Contact the bounty issuer:</b> { this.state.contract.bountyData.contact}</p>
                  {this.state.contract.bountyData.githubLink &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "#FFDE46", marginRight: "10px"}}>Github Link: </b> <a style={{color: "#16e5cd"}} target={"_blank"} href={this.state.contract.bountyData.githubLink}> {this.state.contract.bountyData.githubLink} </a> </p>}
                  {this.state.contract.bountyData.sourceFileHash &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "#FFDE46", marginRight: "10px"}}>Associated File: </b> <a style={{color: "#16e5cd"}} target={"_blank"} href={"https://ipfs.infura.io/ipfs/" + this.state.contract.bountyData.sourceFileHash}> {this.state.contract.bountyData.sourceFileName} </a> </p>}
                  {this.state.contract.paysTokens &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "#FFDE46", marginRight: "10px"}}>Token Contract:</b> <a style={{color: "#16e5cd"}} target={"_blank"} href={"https://etherscan.io/address/"+ this.state.contract.tokenContract.address}>{this.state.contract.tokenContract.address}</a></p>}
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "#FFDE46", marginRight: "10px"}}>Description: </b> </p>
                  <Text style={{ fontSize: "14px", width: "100%", margin: "0px 10px 10px 0px", color: "#FFDE46", textDecoration: "none"}}>{this.state.contract.bountyData.description}</Text>
                  <div style={{margin: "0 auto", display: "block", overflow: "hidden", marginTop: "15px"}}>
                    {categories}
                  </div>
                </div>





                {actions}

            </div>


            <Tabs tabItemContainerStyle={{backgroundColor: "rgba(10, 22, 40, 0.5)", color: "#16e5cd"}}
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
              <Tab label={numPushed+" Submission"+(numPushed !== 1? "s" : "")} value={0} style={{color: this.state.mainTabValue === 0? "#fff" : "#16e5cd", fontSize: "16px", backgroundColor: this.state.mainTabValue === 0? "rgba(10, 22, 40, 0.5)" : "rgba(10, 22, 40, 0)"}}>
                {fulBody}
              </Tab>
              <Tab label={this.state.myComments.length+" Comment"+(this.state.myComments.length !== 1? "s" : "")} value={1} style={{color: this.state.mainTabValue === 1? "#fff" : "#16e5cd", fontSize: "16px", backgroundColor: this.state.mainTabValue === 1? "rgba(10, 22, 40, 0.5)" : "rgba(10, 22, 40, 0)"}}>
                {comments}
              </Tab>


            </Tabs>


          </div>
        </div>
        <p style={{textAlign: "center", fontSize: "10px", padding: "15px", color: "rgba(256,256,256,0.75)"}}>&copy; Bounties Network, a <a href="https://ConsenSys.net" target="_blank" style={{textDecoration: "none", color: "#16e5cd"}}>ConsenSys</a> Formation <br/>
        This software provided without any guarantees. <b> Use at your own risk</b> while it is in public beta.</p>
      </div>
    </div>
    )
  }
}

export default BountyPage
