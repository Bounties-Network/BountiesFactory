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
    console.log("localStorage.getItem('lightMode')", localStorage.getItem('lightMode') == "true");
    this.state = {
      modalError: "",
      balance: 0,
      loadingInitial: true,
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
      lightMode:  localStorage.getItem('lightMode') === null? true : localStorage.getItem('lightMode') == "true",
    }
    this.ipfsApi = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: "https"});

    this.getInitialData = this.getInitialData.bind(this);

    this.handleComment = this.handleComment.bind(this);
    this.handleCloseNoWeb3 = this.handleCloseNoWeb3.bind(this);

    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleChangeNetwork = this.handleChangeNetwork.bind(this);
    this.handleToggleLightMode = this.handleToggleLightMode.bind(this);


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
  getBountyFulfillments(version){
    if (version == 0){
      var fulfillments;
      for (var i = 0; i < this.state.bountiesv0.length; i++){
        this.getFulfillmentsForBounty(0,i);
      }
    } else if (version == 1){
      var fulfillments;
      for (var i = 0; i < this.state.bounties.length; i++){
        this.getFulfillmentsForBounty(1,i);
      }
    }

  }
  getFulfillmentsForBounty(version,i){
    if (version == 0){
      var index = i;
      var bountyId = this.state.bountiesv0[index].bountyId;
      this.state.StandardBountiesv0.getNumFulfillments(bountyId, (err, succ)=> {
        var total = parseInt(succ, 10);
        var fulfillments = [];
        if (total === 0){
          var bounties = this.state.bountiesv0;
          bounties[index].fulfillments = [];
          this.setState({bountiesv0: bounties});
        }
        for (var j = 0; j < total; j++){
          this.state.StandardBountiesv0.getFulfillment(bountyId, j, (err, succ)=> {
            ipfs.catJSON(succ[2], (err, result)=> {
              fulfillments.push({
                accepted:succ[0],
                fulfiller:succ[1],
                data: result
              });
              if (fulfillments.length == total){
                var bounties = this.state.bountiesv0;
                bounties[index].fulfillments = fulfillments;
                this.setState({bountiesv0: bounties});
              }
            });
          });
        }
      });
    } else if (version == 1){
      var index = i;
      var bountyId = this.state.bounties[index].bountyId;
      this.state.StandardBounties.getNumFulfillments(bountyId, (err, succ)=> {
        var total = parseInt(succ, 10);
        var fulfillments = [];
        if (total === 0){
          var bounties = this.state.bounties;
          bounties[index].fulfillments = [];
          this.setState({bounties: bounties});
        }
        for (var j = 0; j < total; j++){
          this.state.StandardBounties.getFulfillment(bountyId, j, (err, succ)=> {
            ipfs.catJSON(succ[2], (err, result)=> {
              fulfillments.push({
                accepted:succ[0],
                fulfiller:succ[1],
                data: result
              });
              if (fulfillments.length == total){
                var bounties = this.state.bounties;
                bounties[index].fulfillments = fulfillments;
                this.setState({bounties: bounties});
              }
            });
          });
        }
      });
    }

  }


  getBountyComments(){

      this.state.UserCommentsContract.numComments((err, succ)=> {
        var total = parseInt(succ, 10);
        var comments = [];
        var commentsAbout = [];


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
              console.log("error", err);
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

  getBounty(bountyId, bounties, total, version){
    if (version == 0){
      this.state.StandardBountiesv0.getBounty(bountyId, (err, succ)=> {
      this.state.StandardBountiesv0.getNumFulfillments(bountyId, (err, numFul)=>{
        this.state.StandardBountiesv0.getBountyData(bountyId, (err, data)=> {
          if (data.length > 0){
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
                bounties.push({
                  bountyId: bountyId,
                  issuer: succ[0],
                  mine: succ[0].toLowerCase() === this.state.userAddress.toLowerCase(),
                  deadline: newDate.toUTCString(),
                  dateNum: newDate.getTime(),
                  value: value,
                  paysTokens: succ[3],
                  stage: stage,
                  balance: balance,
                  bountyData: result,
                  symbol: "ETH",
                  dateString: dateString,
                  numFul: parseInt(numFul, 10),
                  version: 0,
                  fulfillments: []
                });
                if (bounties.length === total){
                  this.setState({bountiesv0: bounties, loading: false});
                  this.getBountyFulfillments(0);
                    this.getBountyComments();
                }
              } else {
                this.state.StandardBounties.getBountyToken(bountyId, (err, address)=> {
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

                      bounties.push({
                        bountyId: bountyId,
                        issuer: succ[0],
                        mine: succ[0].toLowerCase() === this.state.userAddress.toLowerCase(),
                        deadline: newDate.toUTCString(),
                        dateNum: newDate.getTime(),
                        value: parseInt(newAmount, 10),
                        paysTokens: succ[3],
                        stage: stage,
                        owedAmount: parseInt(succ[5], 10),
                        balance: parseInt(balance, 10),
                        bountyData: result,
                        dateString: dateString,
                        symbol: symbol,
                        numFul: parseInt(numFul, 10),
                        version: 0,
                        fulfillments: []
                      });
                      if (bounties.length === total){
                        this.setState({bountiesv0: bounties, loading: false});
                        this.getBountyFulfillments(0);
                    this.getBountyComments();
                      }
                    });
                  });

                });

              }

            });
          } else {

            bounties.push({
              bountyId: bountyId,
              issuer: succ[0],
              mine: succ[0].toLowerCase() === this.state.userAddress.toLowerCase(),
              deadline: 0,
              dateNum: 0,
              value: 0,
              paysTokens: succ[3],
              stage: "Draft",
              owedAmount: parseInt(succ[5], 10),
              balance: 0,
              bountyData: {categories:[]},
              dateString: "date",
              symbol: "",
              numFul: parseInt(numFul, 10),
              version: 0,
              fulfillments: []
            });
            if (bounties.length === total){
              this.setState({bountiesv0: bounties, loading: false});
              this.getBountyFulfillments(0);
                    this.getBountyComments();
            }


          }


        });
      });


    });


    } else if (version == 1){

      this.state.StandardBounties.getBounty(bountyId, (err, succ)=> {
      this.state.StandardBounties.getNumFulfillments(bountyId, (err, numFul)=>{
        this.state.StandardBounties.getBountyData(bountyId, (err, data)=> {
          if (data.length > 0){
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
                bounties.push({
                  bountyId: bountyId,
                  issuer: succ[0],
                  mine: succ[0].toLowerCase() === this.state.userAddress.toLowerCase(),
                  deadline: newDate.toUTCString(),
                  dateNum: newDate.getTime(),
                  value: value,
                  paysTokens: succ[3],
                  stage: stage,
                  balance: balance,
                  bountyData: result,
                  symbol: "ETH",
                  dateString: dateString,
                  numFul: parseInt(numFul, 10),
                  version: 1,
                  fulfillments: []
                });
                if (bounties.length === total){
                  this.setState({bounties: bounties, loading: false});
                  this.getBountyFulfillments(1);
                    this.getBountyComments();
                }
              } else {
                this.state.StandardBounties.getBountyToken(bountyId, (err, address)=> {
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

                      bounties.push({
                        bountyId: bountyId,
                        issuer: succ[0],
                        mine: succ[0].toLowerCase() === this.state.userAddress.toLowerCase(),
                        deadline: newDate.toUTCString(),
                        dateNum: newDate.getTime(),
                        value: parseInt(newAmount, 10),
                        paysTokens: succ[3],
                        stage: stage,
                        owedAmount: parseInt(succ[5], 10),
                        balance: parseInt(balance, 10),
                        bountyData: result,
                        dateString: dateString,
                        symbol: symbol,
                        numFul: parseInt(numFul, 10),
                        version: 1,
                        fulfillments: []
                      });
                      if (bounties.length === total){
                        this.setState({bounties: bounties, loading: false});
                        this.getBountyFulfillments(1);
                    this.getBountyComments();
                      }
                    });
                  });

                });

              }

            });
          } else {

            bounties.push({
              bountyId: bountyId,
              issuer: succ[0],
              deadline: 0,
              dateNum: 0,
              value: 0,
              paysTokens: succ[3],
              stage: "Draft",
              owedAmount: parseInt(succ[5], 10),
              balance: 0,
              bountyData: {categories:[]},
              dateString: "date",
              symbol: "",
              numFul: parseInt(numFul, 10),
              version: 0,
              fulfillments: []
            });
            if (bounties.length === total){
              this.setState({bounties: bounties, loading: false});
              this.getBountyFulfillments(1);
              this.getBountyComments();
            }


          }


        });
      });


    });

    }


  }

  getInitialData(){
    if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
      // Use Mist/MetaMask's provider
      web3.setProvider(window.web3.currentProvider);
      web3.version.getNetwork((err, netId) => {


        if (netId === "1"){
          this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v1),
                         StandardBountiesv0 : web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v0),
                         UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.mainNet.userCommentsAddress),
                         selectedNetwork: netId});
        } else if (netId === "4"){
          this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v1),
                         StandardBountiesv0 : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v0),
                         UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.rinkeby.userCommentsAddress),
                         selectedNetwork: netId});
        } else {
          this.setState({modalError: ("Please change your Ethereum network to the Main Ethereum network or the Rinkeby network"), modalOpen: true});
        }


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
          var bounties = [];
          this.state.StandardBounties.getNumBounties((err, succ)=> {
            var total = parseInt(succ, 10);

            this.setState({total: total});
            for (var i = 0; i < total; i++){
              this.getBounty(i, bounties, total, 1);

            }
            if (total === 0){
              this.setState({loading: false});
            }

          });
          var bountiesv0 = [];
          this.state.StandardBountiesv0.getNumBounties((err, succ)=> {
            var total = parseInt(succ, 10);

            this.setState({total: this.state.total+total});
            for (var i = 0; i < total; i++){
              this.getBounty(i, bountiesv0, total, 0);

            }
            if (total === 0){
              this.setState({loading: false});
            }

          });
          web3.eth.getBalance(this.state.userAddress, (err, succ)=> {

            var balance = parseFloat(web3.fromWei(parseInt(succ, 10), "ether")).toFixed(2);
            console.log("balance", balance);

            this.setState({balance: balance});
          });

        }
      }

        }.bind(this));

    });
    } else {

      var bounties = [];

      this.state.StandardBounties.getNumBounties((err, succ)=> {
        var total = parseInt(succ, 10);
        this.setState({total: total});
        for (var i = 0; i < total; i++){
          this.getBounty(i, bounties, total);

        }
        if (total === 0){
          this.setState({loading: false});
        }

      });
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


    var totalBounties = this.state.bounties.concat(this.state.bountiesv0);

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
        <div style={{backgroundColor: this.state.lightMode? "rgb(249,249,249)":"rgba(10, 22, 40, 0.5)", display: "block", overflow: "hidden", padding: "15px", color: this.state.lightMode? "rgb(25, 55, 83)":"white"}}>
            <h5 style={{margin: "5px 0px", color :this.state.lightMode? "rgb(25, 55, 83)":"rgb(255, 222, 70)"}}><b style={{fontSize: "16px"}}>{this.state.commentsAbout[i].title}</b></h5>
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
      <h3 style={{fontFamily: "Open Sans", marginTop: "30px", margin: "0 auto", marginBottom: "15px", textAlign: "center", color: this.state.lightMode? "rgb(25, 55, 83)": "white"}}>{this.state.commentsAbout.length} Comment{this.state.commentsAbout.length !== 1? "s" : ""}</h3>
      {commentsArray}
    </div>
  );

  var myBounties = [];
  var myFul = [];
  var numAccepted = 0;
  var myNumKilled = 0;
  var mine = false;
  var myNumAccepted = 0;
  var myIssued = 0;
  var mySubs = 0;
  var myContactInfo = [];
  var myCategories = [];
  for (i = 0; i  < totalBounties.length; i++){

    if (totalBounties[i].mine){
      mine = true;
      myIssued++;
      myBounties.push(totalBounties[i]);

      mySubs+= totalBounties[i].fulfillments.length;

      myContactInfo.push(totalBounties[i].bountyData.contact);

    }
    for (var j = 0; j < totalBounties[i].fulfillments.length; j++){
      if (mine){
        if (totalBounties[i].fulfillments[j].accepted){
          myNumAccepted ++;
        }
        if (totalBounties[i].stage === "Dead"){
          myNumKilled++;
        }
      }
      if (totalBounties[i].fulfillments[j].fulfiller.toLowerCase() === this.state.userAddress.toLowerCase()){
        for (var k = 0; k < totalBounties[i].bountyData.categories.length; k++){
          if (myCategories.indexOf(totalBounties[i].bountyData.categories[k]) < 0){
            myCategories.push(totalBounties[i].bountyData.categories[k]);
          }
        }
        if (totalBounties[i].fulfillments[j].accepted){
          numAccepted ++;
        }
        myFul.push({
          accepted:totalBounties[i].fulfillments[j].accepted,
          data:totalBounties[i].fulfillments[j].data,
          bountyId:totalBounties[i].bountyId,
          value: totalBounties[i].value,
          symbol: totalBounties[i].symbol,
          bountyData: totalBounties[i].bountyData,
          version: totalBounties[i].version
        });
      }
    }
    mine = false;
  }
  var categories = [];
  if (myCategories.length > 0){
    for (i = 0; i < myCategories.length; i++){

      categories.push(

        <Chip style={{margin: "0px 15px 5px 0px", float: "left", border: this.state.lightMode? "1px solid rgba(25, 55, 83, 1)":"1px solid rgba(0, 126, 255, 0.24)", backgroundColor: this.state.lightMode? "rgba(25, 55, 83, 10.08":"rgba(0, 126, 255, 0.08)", height: "30px"}}
              labelStyle={{color: "white", lineHeight: "28px"}}
              key={myCategories[i]}>
            {myCategories[i]}
        </Chip>
      );
    }
  }
  var uniqueContactInfo = myContactInfo.filter(this.onlyUnique);
  var acceptanceRate = 0;
  if (myFul.length !== 0){
    acceptanceRate = (numAccepted*100 / myFul.length).toFixed(0);
    console.log("myFul", numAccepted, myFul.length);
  }
  var myAcceptanceRate = 0;
  if (mySubs !== 0){
    console.log("mysubs", myNumAccepted, mySubs);

    myAcceptanceRate = (myNumAccepted*100 / mySubs).toFixed(0);
  }
  var contactString = uniqueContactInfo.join(", ");
  var bountiesList = [];
  for (i = 0; i < myBounties.length && i < 5; i++){
    var url = ("/bounty/v"+ myBounties[i].version+"/"+ myBounties[i].bountyId);
    bountiesList.push(
      <a key={"bountiesList"+i} style={{}} href={url}>
      <div  style={{backgroundColor: this.state.lightMode? "rgba(1, 1, 1, 0.05)":"rgba(10, 22, 40, 0.75)", borderLeft: this.state.lightMode? "1px solid rgb(25, 55, 83)":"1px solid #16e5cd", padding: "10px", marginBottom: (i === (myBounties.length - 1) || i == 4)? "0px":"15px", marginTop: "0px", color: this.state.lightMode? "rgb(25, 55, 83)":"white", overflow: "hidden"}} >
        <div style={{width: "390px", display: "block", float: "left", overflow: "hidden"}}>
        <h4 style={{margin: "0px", fontSize: "16px", fontWeight: "600"}}>{myBounties[i].bountyData.title}</h4>
        <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", fontWeight: "700"}}> <b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46"}}>{myBounties[i].stage}</b>| {myBounties[i].fulfillments.length}<b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", fontWeight: "500"}}> total submissions</b></p>
        </div>
        <SvgArrow style={{color: this.state.lightMode? "rgb(25, 55, 83)":"#16e5cd", fontSize: "44px", marginTop: "10px", color: "#16e5cd", textAlign: "right", display: "block"}}/>
      </div>
      </a>
    );
  }
  var fulfillmentsList = [];
  for (i = 0; i < myFul.length && i < 5; i++){
    var url = ("/bounty/v"+ myFul[i].version+"/"+ myFul[i].bountyId);

    fulfillmentsList.push(
      <a key={"fulList"+i} style={{}} href={url}>
      <div style={{backgroundColor: this.state.lightMode? "rgba(1, 1, 1, 0.05)":"rgba(10, 22, 40, 0.75)", borderLeft: this.state.lightMode? "1px solid rgb(25, 55, 83)":"1px solid #16e5cd", padding: "10px", marginBottom: (i === (myFul.length - 1) || i == 4)? "0px":"15px", marginTop: "0px", color: this.state.lightMode? "rgb(25, 55, 83)":"white", overflow: "hidden"}} >
        <div style={{width: "390px", display: "block", float: "left", overflow: "hidden"}}>
        <h4 style={{margin: "0px", fontSize: "16px", fontWeight: "600"}}>{myFul[i].bountyData.title}</h4>
        <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", fontWeight: "700"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", fontWeight: "500"}}>Reward: </b>{myFul[i].value + " " + myFul[i].symbol} | <b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", fontWeight: "500"}}>{myFul[i].accepted? "Accepted" : "Not Accepted"}</b></p>

        </div>
        <SvgArrow style={{color: this.state.lightMode? "rgb(25, 55, 83)":"#16e5cd", fontSize: "44px", marginTop: "10px", color: "#16e5cd", textAlign: "right", display: "block"}}/>

      </div>
      </a>
    );
  }
  var bountiesUI = (
    <div>

      <h3 style={{margin: "0px", width: "100%", fontSize: "18px", textAlign: "center",  fontWeight: "600", color: this.state.lightMode? "rgb(25, 55, 83)" :"white"}}>Bounties Posted</h3>
      <div style={{paddingBottom: "15px", borderBottom: "1px solid #16e5cd", display: "inline-block", width: "442px", marginBottom: "12px",color: this.state.lightMode? "rgb(25, 55, 83)" :"white"}}>
        <div style={{width: "33%", display: "inline-block", float: "left"}}>
          <h3 style={{textAlign: "center", fontSize: "48px", borderRight: "1px solid #16e5cd", margin: "15px 0px"}}> {myBounties.length} </h3>
          <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: this.state.lightMode? "rgb(255, 184, 21)":"rgb(255, 222, 70)"}}>BOUNTIES</p>
        </div>
        <div style={{width: "33%", display: "inline-block", float: "left"}}>
          <h3 style={{textAlign: "center", fontSize: "48px", borderRight: "1px solid #16e5cd", margin: "15px 0px"}}>{myNumAccepted}</h3>
          <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: this.state.lightMode? "rgb(255, 184, 21)":"rgb(255, 222, 70)"}}>ACCEPTED</p>
        </div>
        <div style={{width: "33%", display: "inline-block", float: "left"}}>
        <h3 style={{textAlign: "center", fontSize: "48px", margin: "15px 0px"}}>{myAcceptanceRate}<b style={{fontSize: "18px"}}>%</b></h3>
          <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: this.state.lightMode? "rgb(255, 184, 21)":"rgb(255, 222, 70)"}}>ACCEPTANCE RATE</p>
        </div>
      </div>
      {bountiesList}
    </div>
  );

  var fulUI = (
    <div>
      <h3 style={{margin: "0px", width: "100%", fontSize: "18px", textAlign: "center",  fontWeight: "600", color: this.state.lightMode? "rgb(25, 55, 83)" :"white"}}>Bounty Submissions</h3>
      <div style={{paddingBottom: "15px", borderBottom: "1px solid #16e5cd", display: "inline-block", width: "442px",  marginBottom: "12px", color: this.state.lightMode? "rgb(25, 55, 83)" :"white"}}>
        <div style={{width: "33%", display: "inline-block", float: "left"}}>
          <h3 style={{textAlign: "center", fontSize: "48px", borderRight: "1px solid #16e5cd", margin: "15px 0px"}}>{myFul.length}</h3>
          <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: this.state.lightMode? "rgb(255, 184, 21)":"rgb(255, 222, 70)"}}>SUBMISSIONS</p>
        </div>

        <div style={{width: "33%", display: "inline-block", float: "left"}}>
          <h3 style={{textAlign: "center", fontSize: "48px", borderRight: "1px solid #16e5cd", margin: "15px 0px"}}>{numAccepted}</h3>
          <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: this.state.lightMode? "rgb(255, 184, 21)":"rgb(255, 222, 70)"}}>ACCEPTED</p>
        </div>
        <div style={{width: "33%", display: "inline-block", float: "left"}}>
          <h3 style={{textAlign: "center", fontSize: "48px", margin: "15px 0px"}}>{acceptanceRate}<b style={{fontSize: "18px"}}>%</b></h3>
          <p style={{fontSize: "10px", textAlign: "center", fontWeight: "600", color: this.state.lightMode? "rgb(255, 184, 21)":"rgb(255, 222, 70)"}}>ACCEPTANCE RATE</p>
        </div>
      </div>
      {fulfillmentsList}
    </div>
  );

  console.log("this", this.state.bounties);
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
        <div id={this.state.lightMode? "colourBodyLight": "colourBodyDark"} style={{minHeight: "100vh", position: "relative", overflow: "hidden"}}>
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
          <div style={{ display: "block", overflow: "hidden", width: "1050px", margin: "0 auto", paddingBottom: "160px"}}>
          <div style={{float: "left", margin: "15px 15px 15px 15px", width: "960px", display: "inline-block", backgroundColor: this.state.lightMode? "rgb(249, 249, 249)" :"rgba(10, 22, 40, 0.5)", padding: "30px", color: this.state.lightMode? "rgb(25, 55, 83)" :"white"}}>

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
              <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", fontWeight: "500"}}>User Address:</b></p>
                <h3 style={{margin: "0px", width: "100%", display: "inline", fontWeight: "500", marginTop: "30px"}}>
                  <a style={{color: "#16e5cd"}} target={"_blank"} href={"https://etherscan.io/address/"+ this.state.userAddress}>{this.state.userAddress}</a>
                </h3>
                <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)":"#FFDE46", fontWeight: "500"}}>Contact user:</b> { contactString}</p>
                {myCategories.length > 0 && <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px"}}><b style={{color: this.state.lightMode? "rgb(255, 184, 21)": "#FFDE46", fontWeight: "500"}}>Skills:</b></p>}

                {categories}
              </div>

          </div>
            <div style={{float: "left", margin: "0 15px 15px 15px", width: "442px", display: "inline-block", backgroundColor: this.state.lightMode? "rgb(249, 249, 249)" :"rgba(10, 22, 40, 0.5)", padding: "30px"}}>
              {bountiesUI}

            </div>
            <div style={{float: "left", margin: "0 15px 15px 0px", width: "442px", display: "inline-block", backgroundColor: this.state.lightMode? "rgb(249, 249, 249)" :"rgba(10, 22, 40, 0.5)", padding: "30px"}}>
              {fulUI}

            </div>
              <div style={{float: "left", display: "block", margin: "0 15px", width: "1000px"}}>
              {this.state.accounts.length === 0 ||
                (this.state.userAddress.toLowerCase() !== this.state.accounts[0].toLowerCase() && !this.state.loading)
                &&
                <form className='Contribute' onSubmit={this.handleComment} style={{width: "960px", display: "inline-block", backgroundColor: this.state.lightMode? "rgb(249, 249, 249)":"rgba(10, 22, 40, 0.5)", padding: "30px", color: this.state.lightMode? "rgb(25, 55, 83)": "white"}}>
                  <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center",  fontWeight: "600", color: this.state.lightMode? "rgb(25, 55, 83)": "white"}}>Comment on User</h4>
                  <label htmlFor='comment_title' style={{fontSize: "12px", display: "block"}}>Title</label>
                  <input id='comment_title' className='SendAmount' type='text' style={{width: "940px", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}/>
                  <label htmlFor='comment_description' style={{fontSize: "12px", display: "block", marginTop: "15px"}}>Description</label>
                  <textarea id='comment_description' cols="60" rows="3" className='ContractCode' type='text' style={{width: "940px", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}></textarea>
                  {this.state.commentError &&
                    <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "10px", textAlign: "center"}}>{this.state.commentError}</p>}
                  <button type='submit'  className='AddBtn' style={{backgroundColor: this.state.lightMode? "rgb(25, 55, 83)":"rgba(0, 126, 255, 0.24)", border:"0px", color: "white",  display: "block", padding: "16px", margin: "0 auto", marginTop: "15px", fontSize: "1em", width: "200px"}}>Comment</button>
                </form>
              }
              {comments}
            </div>
          </div>
          <p style={{textAlign: "center", display: "block", fontSize: "10px", padding: "15px 0px", color: this.state.lightMode? "rgb(25, 55, 83)":"rgba(256,256,256,0.75)", width: "100%", position: "absolute", bottom: "0px"}}>&copy; Bounties Network, a <a href="https://ConsenSys.net" target="_blank" style={{textDecoration: "none", color: this.state.lightMode? "rgb(25, 55, 83)":"#16e5cd"}}>ConsenSys</a> Formation <br/>
           <a href="/privacyPolicy/" target="_blank" style={{color: this.state.lightMode? "rgb(25, 55, 83)":"rgba(256,256,256,0.75)"}}>Privacy Policy</a>{" | "}<a href="/terms/" target="_blank" style={{color: this.state.lightMode? "rgb(25, 55, 83)":"rgba(256,256,256,0.75)"}}>Terms of Service</a>
           </p>
        </div>
      </div>
    )
  }
}

export default UserPage
