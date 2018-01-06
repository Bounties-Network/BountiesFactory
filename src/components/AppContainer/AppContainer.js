import React, { Component } from 'react'
import './AppContainer.css'

import Web3 from 'web3';
import Select from 'react-select';


const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));
const json = require('../../../contracts.json');



const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const BN = require(`bn.js`);
const utf8 = require('utf8');

import logo from './images/logo.svg';
import logoDark from './images/logoDark.svg';
import darkMoon from '../AppContainer/images/DarkMoon.png';
import lightMoon from '../AppContainer/images/LightMoon.png';

import FlatButton from 'material-ui/FlatButton';
import BountiesFacts from 'components/BountiesFacts/BountiesFacts';

import ContractList from 'components/ContractList/ContractList';

import Dialog from 'material-ui/Dialog';
import SvgArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right';


const CATEGORIES = [
  { label: 'Code', value: 'Code' },
  { label: 'Bugs', value: 'Bugs' },
  { label: 'Questions', value: 'Questions' },
  { label: 'Graphic Design', value: 'Graphic Design' },
  { label: 'Social Media', value: 'Social Media' },
  { label: 'Content Creation', value: 'Content Creation' },
  { label: 'Translations', value: 'Translations'},
  { label: 'Surveys', value: 'Surveys'}
];


class AppContainer extends Component {
  constructor(props) {
    super(props)

    var requiredNetwork = 0;
    var standardBountiesAddress = "";
    var standardBountiesAddressv0 = "";

    var userCommentsAddress = "";
    var networkName = "";
    var providerLink = "";
    var stored = localStorage.getItem('ethereumNetwork');
    if (!stored){
      providerLink = "https://mainnet.infura.io";
      requiredNetwork = 1;
      standardBountiesAddress = json.mainNet.standardBountiesAddress.v1;
      standardBountiesAddressv0 = json.mainNet.standardBountiesAddress.v0;

      userCommentsAddress = json.mainNet.userCommentsAddress;
      networkName = "Main Network";
      localStorage.setItem('ethereumNetwork', "MainNet");
    } else {
      if (stored === "MainNet"){
        providerLink = "https://mainnet.infura.io";
        requiredNetwork = 1;
        standardBountiesAddress = json.mainNet.standardBountiesAddress.v1;
        standardBountiesAddressv0 = json.mainNet.standardBountiesAddress.v0;

        userCommentsAddress = json.mainNet.userCommentsAddress;
        networkName = "Main Network";


      } else if (stored === "Rinkeby"){
        providerLink = "https://rinkeby.infura.io";
        requiredNetwork = 4;
        standardBountiesAddress = json.rinkeby.standardBountiesAddress.v1;
        standardBountiesAddressv0 = json.rinkeby.standardBountiesAddress.v0;

        userCommentsAddress = json.rinkeby.userCommentsAddress;
        networkName = "Rinkeby Network";
      }

    }
    web3.setProvider(new Web3.providers.HttpProvider(providerLink));

    this.state = {
      modalError: "",
      modalOpen: false,
      loadingInitial: true,
      accounts: [],
      contracts: [],
      bounties: [],
      bountiesv0: [],
      optionsList: [],
      total: 0,
      totalMe: 0,
      loading: true,
      myBountiesLoading: true,
      selectedStage: "Active",
      selectedMine: "ANY",
      requiredNetwork: requiredNetwork,
      networkName: networkName,
      prices: {},
      standardBountiesAddress: standardBountiesAddress,
      userCommentsAddress: userCommentsAddress,
      StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(standardBountiesAddress),
      StandardBountiesv0 : web3.eth.contract(json.interfaces.StandardBounties).at(standardBountiesAddressv0),
      UserComments : web3.eth.contract(json.interfaces.UserComments).at(userCommentsAddress),
      lightMode:   localStorage.getItem('lightMode') === null? true : localStorage.getItem('lightMode') == "true",
    }

    this.getInitialData = this.getInitialData.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.getBounty = this.getBounty.bind(this);
    this.handleChangeStage = this.handleChangeStage.bind(this);
    this.handleMineChange = this.handleMineChange.bind(this);
    this.handleChangeToMine = this.handleChangeToMine.bind(this);
    this.handleAddCategory = this.handleAddCategory.bind(this);

    this.handleChangeNetwork = this.handleChangeNetwork.bind(this);

    this.handleSelectChange = this.handleSelectChange.bind(this);

    this.getPrices = this.getPrices.bind(this);

    this.handleToggleLightMode = this.handleToggleLightMode.bind(this);

  }

  componentDidMount() {
    this.getPrices();


    if (window.loaded){
      this.getInitialData();
    } else {
      window.addEventListener('load', this.getInitialData);
    }
  }


  toUTF8(hex) {
  // Find termination
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

  handleOpen () {
    this.setState({modalOpen: true});
  }

  handleClose(){
    this.setState({modalOpen: false});
    this.getInitialData();
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

  getInitialData(){
    window.loaded = true;


    if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {

      // Use Mist/MetaMask's provider
        web3.setProvider(window.web3.currentProvider);

        web3.version.getNetwork((err, netId) => {

          if (parseInt(netId, 10) > 10000){
            this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.localhost.standardBountiesAddress.v1),
                           StandardBountiesv0 : web3.eth.contract(json.interfaces.StandardBounties).at(json.localhost.standardBountiesAddress.v0),
                           UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.localhost.userCommentsAddress),
                           selectedNetwork: netId});
          } else if (netId === "1"){
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
          this.getBounty(i, bounties, total,1);

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
                  version: 0
                });
                if (bounties.length === total){
                  this.setState({bountiesv0: bounties, loading: false});
                }
              } else {
                this.state.StandardBountiesv0.getBountyToken(bountyId, (err, address)=> {
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
                        version: 0
                      });
                      if (bounties.length === total){
                        this.setState({bountiesv0: bounties, loading: false});
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
              version: 0
            });
            if (bounties.length === total){
              this.setState({bountiesv0: bounties, loading: false});
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
                  version: 1
                });
                if (bounties.length === total){
                  this.setState({bounties: bounties, loading: false});
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
                        version: 1
                      });
                      if (bounties.length === total){
                        this.setState({bounties: bounties, loading: false});
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
            });
            if (bounties.length === total){
              this.setState({bounties: bounties, loading: false});
            }


          }


        });
      });


    });

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
  handleChangeStage(evt){
    evt.preventDefault();
    var selected = evt.target.value;
    this.setState({selectedStage: selected});
  }

  handleMineChange(evt){
    evt.preventDefault();
    var selected = evt.target.value;
    this.setState({selectedMine: selected});
  }
  handleChangeToMine(evt){
    evt.preventDefault();
    this.setState({selectedMine: "MINE"});
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
  handleSelectChange(value){
    var optionsList = value.split(",");
    var containsCode = false;
    if (optionsList.includes("Code") || optionsList.includes("Bugs")){
      containsCode = true;
    }
    this.setState({ optionsList: optionsList, value: value, containsCode: containsCode});
    this.forceUpdate();

  }
  handleAddCategory(item){
    var optionsList = [];
    optionsList.push(item);
    this.setState({optionsList: optionsList, value: item});
  }
handleToggleLightMode(){
  var lightMode = !this.state.lightMode;
  this.setState({lightMode: lightMode});
  localStorage.setItem('lightMode', lightMode);

}
  render() {
    var newList = [];
    var totalMe = 0;;
    var activeList = [];
    var activeMe = 0;
    var draftMe = 0;
    var completedMe = 0;
    var deadMe = 0;
    var expiredMe = 0;
    var totalBounties = this.state.bounties.concat(this.state.bountiesv0);
    for (var i = 0; i < totalBounties.length; i++){
      if (totalBounties[i].issuer === this.state.accounts[0]){
        newList.push(totalBounties[i]);
        totalMe++;
        if (totalBounties[i].stage === "Active"){
          activeMe++;
        }
        if (totalBounties[i].stage === "Draft"){
          draftMe++;
        }
        if (totalBounties[i].stage === "Dead"){
          deadMe++;
        }
        if (totalBounties[i].stage === "Expired"){
          expiredMe++;
        }
        if (totalBounties[i].stage === "Completed"){
          completedMe++;
        }
      }
        var isInSelectedCategories = false;
        var newCategories = totalBounties[i].bountyData.categories.filter((n)=> { return this.state.optionsList.includes(n)});
        if (newCategories.length > 0 || this.state.optionsList[0] === "" || this.state.optionsList.length === 0){
          isInSelectedCategories = true;
        }
      /*


      for (var j = 0; j < this.state.bounties[i].bountyData.categories.length; i++){
        console.log("categories: ", this.state.bounties[j]);

        if (this.state.optionsList.indexOf(this.state.bounties[i].bountyData.categories[i]) >= 0){
          isInSelectedCategories = true;
        }

      }

      if (this.state.optionsList.length === 0){
        isInSelectedCategories = true;
      }
*/
      if (isInSelectedCategories){
        if (totalBounties[i].stage === this.state.selectedStage || this.state.selectedStage === "ANY"){
          if (this.state.selectedMine === "ANY"){
            activeList.push(totalBounties[i]);
          } else if (this.state.selectedMine === "MINE" && totalBounties[i].issuer === this.state.accounts[0]){
            activeList.push(totalBounties[i]);
          } else if (this.state.selectedMine === "NOT MINE" && totalBounties[i].issuer !== this.state.accounts[0]){
            activeList.push(totalBounties[i]);
          }
        }
      }


    }
    const modalActions = [
    <FlatButton
      label="Retry"
      primary={true}
      onClick={this.handleClose}
      style={{color: "#16e5cd"}}
    />
  ];
  document.title = "Bounties Explorer | Dashboard";



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
<FlatButton href="/newBounty/" style={{backgroundColor: "rgba(0,0,0,0)", border: "1px solid #16e5cd", color: "#16e5cd", width: "150px", float: "right", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "30px"}} > New Bounty </FlatButton>
        </div>
        <div style={{ display: "block", overflow: "hidden", width: "1100px", margin: "0 auto", paddingBottom: "120px"}}>

          <div style={{width: "245px", float: "left", display: "block", marginRight: "15px"}}>
            <h3 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "15px", textAlign: "center", color: this.state.lightMode? "rgb(25, 55, 83)" :"white", width: "100%", fontWeight: "600", fontSize: "16px"}}>PROFILE</h3>
            <div style={{display: "block", width: "215px", backgroundColor: this.state.lightMode? "rgb(249, 249, 249)" :"rgba(10, 22, 40, 0.5)", overflow: "hidden", marginTop: "15px", padding: "15px", minHeight: "237px"}}>

            {this.state.accounts.length > 0 &&
              <div>
              <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "15px", color: this.state.lightMode? "#193753":"white", width: "100%", fontWeight: "500", textAlign: "center", lineHeight: "24px"}}>You have posted  <b style={{color: "#16e5cd", fontSize: "24px"}}>{totalMe}</b> bounties</h5>
              <div style={{marginBottom: "15px", borderBottom: "1px solid #16e5cd", display: "block", overflow: "hidden"}}>

                <div style={{width: "33%", float: "left", display: "block"}}>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "0px", textAlign: "center", color: this.state.lightMode? "#193753": "white", width: "100%", fontWeight: "500", lineHeight: "24px", borderRight:"1px solid #16e5cd"}}><b style={{ fontSize: "24px"}}>{draftMe}</b></h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "15px", textAlign: "center", color: "rgb(255, 186, 20)", width: "100%", fontWeight: "500" }}>DRAFT</h5>

                </div>
                <div style={{width: "33%", float: "left", display: "block"}}>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "0px", textAlign: "center", color: this.state.lightMode? "#193753": "white", width: "100%", fontWeight: "500",  lineHeight: "24px", borderRight:"1px solid #16e5cd"}}><b style={{fontSize: "24px"}}>{activeMe}</b></h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "15px", textAlign: "center", color: "rgb(140, 226, 88)" , width: "100%", fontWeight: "500" }}>ACTIVE</h5>


                </div>
                <div style={{width: "33%", float: "left", display: "block"}}>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "0px", textAlign: "center", color: this.state.lightMode? "#193753":"white", width: "100%", fontWeight: "500", lineHeight: "24px"}}><b style={{ fontSize: "24px"}}>{deadMe}</b></h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "15px", textAlign: "center", color: "#ff6846", width: "100%", fontWeight: "500"}}>DEAD</h5>

                </div>


                <div style={{width: "50%", float: "left", display: "block"}}>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "0px", textAlign: "center", color: this.state.lightMode? "#193753":"white", width: "100%", fontWeight: "500",  lineHeight: "24px", borderRight:"1px solid #16e5cd"}}><b style={{fontSize: "24px"}}>{expiredMe}</b></h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "15px", textAlign: "center", color: "rgb(104, 166, 166)" , width: "100%", fontWeight: "500" }}>EXPIRED</h5>


                </div>
                <div style={{width: "50%", float: "left", display: "block"}}>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "0px", textAlign: "center", color: this.state.lightMode? "#193753":"white", width: "100%", fontWeight: "500", lineHeight: "24px"}}><b style={{ fontSize: "24px"}}>{completedMe}</b></h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "15px", textAlign: "center", color: "rgb(255, 222, 70)", width: "100%", fontWeight: "500"}}>COMPLETED</h5>

                </div>


              </div>


              <FlatButton
                label="My Profile"
                primary={true}
                labelPosition="before"
                href={"/user/" + this.state.accounts[0]}
                style={{color:  this.state.lightMode? "#193753":"white", width: "100%", backgroundColor: "rgba(1, 1, 1, 0.05)", marginTop: "15px"}}
                icon={<SvgArrow style={{color: "#16e5cd", fontSize: "44px"}}/>}
              />
              <FlatButton
                label="My Bounties"
                primary={true}
                labelPosition="before"
                onClick={this.handleChangeToMine}
                style={{color:  this.state.lightMode? "#193753":"white", width: "100%", backgroundColor: "rgba(1, 1, 1, 0.05)", marginTop: "15px"}}
                icon={<SvgArrow style={{color: "#16e5cd", fontSize: "44px"}}/>}
              />

              </div>
          }
          {this.state.accounts.length === 0 &&
            <div>
              <h5 style={{fontFamily: "Open Sans", marginTop: "35px", marginBottom: "15px", color: this.state.lightMode? "#8a8a8a" :"white", width: "100%", fontWeight: "700", textAlign: "center", fontSize: "18px"}}>You have no account!</h5>
              <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "15px", color: this.state.lightMode? "#8a8a8a" :"white", width: "100%", fontWeight: "300", textAlign: "center", fontSize: "14px"}}>{"This is likely because you're not using a web3 enabled browser."}</h5>
              <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "15px", color: this.state.lightMode? "#8a8a8a" :"white", width: "100%", fontWeight: "300", textAlign: "center", fontSize: "14px", paddingTop: "15px", borderTop: "1px solid #16e5cd"}}>{"You can download the "}<a href="https://metamask.io" target="_blank" style={{color: "#16e5cd", fontWeight: "700"}}> Metamask </a>{" extension to begin posting bounties."}</h5>

            </div>
          }

            </div>
            <div id="mc_embed_signup">
            <h5 style={{fontFamily: "Open Sans", marginTop: "35px", marginBottom: "15px", color: this.state.lightMode? "rgb(25, 55, 83)" :"rgb(208,208,208)", width: "100%", fontWeight: "600", textAlign: "center", fontSize: "14px"}}>SIGN UP TO RECEIVE <br/> BOUNTIES NOTIFICATIONS</h5>

              <form action="//network.us16.list-manage.com/subscribe/post?u=03351ad14a86e9637146ada2a&amp;id=96ba00fd12" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" >
                  <div id="mc_embed_signup_scroll">

										<div className="6u$ 12u$(xsmall)">
											<input type="email" name="EMAIL" id="mce-EMAIL" placeholder="email address" required style={{fontFamily: "Open Sans", border: "0px", borderBottom: "1px solid rgb(22, 229, 205)", backgroundColor: "rgba(0,0,0,0)", color: "rgb(208, 208, 208)", width: "16.2em"}}/>
										</div>
                  <div style={{position: "absolute", left: "-5000px"}} aria-hidden="true">
                    <input type="text" name="b_03351ad14a86e9637146ada2a_96ba00fd12" tabIndex="-1" value=""/>
                    </div>
                      <input type="submit" value="SIGN UP" name="subscribe" id="mc-embedded-subscribe" className="button" style={{boxShadow: "none", padding: "0px 18px", fontFamily: "Open Sans", backgroundColor: "#183653", width: "17.4em", color: "rgb(208, 208, 208)", border: "0px", padding: "5px 15px", fontWeight: "600", border: "0px solid rgba(0,0,0,0)"}}/>
                  </div>
              </form>
            </div>

          </div>
          <div style={{width: "630px", float: "left", display: "block"}}>
            <ContractList list={activeList} acc={this.state.accounts[0]} loading={this.state.loading} title={'BOUNTIES'} handleAddCategory={this.handleAddCategory} prices={this.state.prices} lightMode={this.state.lightMode}/>
          </div>
          <div style={{width: "195px", float: "left", display: "block", marginLeft: "15px"}} className={this.state.lightMode?"FilterBarLight":"FilterBar"}>
            <h3 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "15px", textAlign: "center", color: this.state.lightMode? "rgb(25, 55, 83)" :"white", width: "100%",  fontWeight: "600", fontSize: "16px"}}>FILTER</h3>

            <div style={{display: "block", width: "100%", backgroundColor: this.state.lightMode? "rgba(1, 1, 1, 0.05)" :"rgba(10, 22, 40, 0.5)", overflow: "hidden"}}>
              <select onChange={this.handleChangeStage} value={this.state.selectedStage} style={{fontSize: "14px", backgroundColor: "rgba(10, 22, 40, 0)", border: "0px",color: this.state.lightMode? "rgb(25, 55, 83)" : "white", width: "195px", height: "40px", display: "block", borderRadius: "0px", WebkitAppearance: "none", 	background: "url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgaWQ9IkxheWVyXzEiIGRhdGEtbmFtZT0iTGF5ZXIgMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNC45NSAxMCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMxNzM3NTM7fS5jbHMtMntmaWxsOiMxNmU1Y2Q7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5hcnJvd3M8L3RpdGxlPjxyZWN0IGNsYXNzPSJjbHMtMSIgd2lkdGg9IjQuOTUiIGhlaWdodD0iMTAiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMS40MSA0LjY3IDIuNDggMy4xOCAzLjU0IDQuNjcgMS40MSA0LjY3Ii8+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjMuNTQgNS4zMyAyLjQ4IDYuODIgMS40MSA1LjMzIDMuNTQgNS4zMyIvPjwvc3ZnPg==) no-repeat 100% 50%", padding: "0px 10px"}}>
                <option value="Draft">Draft Bounties</option>
                <option value="Active">Active Bounties</option>
                <option value="Completed">Completed Bounties</option>
                <option value="Expired">Expired Bounties</option>
                <option value="Dead">Dead Bounties</option>
                <option value="ANY">Any Stage</option>
              </select>
            </div>
            <div style={{display: "block", width: "100%", backgroundColor: this.state.lightMode? "rgba(1, 1, 1, 0.05)" :"rgba(10, 22, 40, 0.5)", overflow: "hidden", marginTop: "15px"}}>
              <select onChange={this.handleMineChange} value={this.state.selectedMine} style={{fontSize: "14px",backgroundColor: "rgba(10, 22, 40, 0)" , border: "0px", color: this.state.lightMode? "rgb(25, 55, 83)" : "white", width: "195px", height: "40px", display: "block", borderRadius: "0px", WebkitAppearance: "none", 	background: "url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgaWQ9IkxheWVyXzEiIGRhdGEtbmFtZT0iTGF5ZXIgMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNC45NSAxMCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMxNzM3NTM7fS5jbHMtMntmaWxsOiMxNmU1Y2Q7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5hcnJvd3M8L3RpdGxlPjxyZWN0IGNsYXNzPSJjbHMtMSIgd2lkdGg9IjQuOTUiIGhlaWdodD0iMTAiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMS40MSA0LjY3IDIuNDggMy4xOCAzLjU0IDQuNjcgMS40MSA0LjY3Ii8+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjMuNTQgNS4zMyAyLjQ4IDYuODIgMS40MSA1LjMzIDMuNTQgNS4zMyIvPjwvc3ZnPg==) no-repeat 100% 50%", padding: "0px 10px"}}>
                <option value="ANY" selected="selected">{"Anyone's Bounties"}</option>
                <option value="MINE">My Bounties</option>
                <option value="NOT MINE">Not My Bounties</option>
              </select>
            </div>
            <div style={{width: "100%", float: "left", display: "block", marginTop: "15px"}}>
              <Select multi simpleValue disabled={this.state.disabled} value={this.state.value} placeholder="Select Categories" options={CATEGORIES} onChange={this.handleSelectChange} />
            </div>



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

export default AppContainer
