import React, { Component } from 'react'
import './AppContainer.css'

import Web3 from 'web3';
import Select from 'react-select';

import { Link } from 'react-router';


import 'whatwg-fetch';

const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));
const json = require('../../../contracts.json');


const BigNumber = require('bignumber.js');
const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const utf8 = require('utf8');

import logo from './images/logo.svg';
import logoBounties from './images/logo-bounties.svg';

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
      loadingMore: false,
      myBountiesLoading: true,
      selectedStage: "Active",
      selectedMine: "ANY",
      sortBy: "Created",
      descending: true,
      requiredNetwork: requiredNetwork,
      networkName: networkName,
      prices: {},
      searchQuery: "",
      standardBountiesAddress: standardBountiesAddress,
      userCommentsAddress: userCommentsAddress,
      StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(standardBountiesAddress),
      StandardBountiesv0 : web3.eth.contract(json.interfaces.StandardBounties).at(standardBountiesAddressv0),
      UserComments : web3.eth.contract(json.interfaces.UserComments).at(userCommentsAddress),
      totalPayouts: 0,
      nextUrl: "",
      categories: CATEGORIES,
      optionsUnseparated: "",
      myDraft: 0,
      myActive: 0,
      myCompleted: 0,
      myDead: 0,
      myExpired: 0,
      myTotal: 0,
      baseURL: "http://a2e716ea2144911e898ed02122fce8e2-236283655.us-east-1.elb.amazonaws.com:83"
    }

    this.getInitialData = this.getInitialData.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChangeStage = this.handleChangeStage.bind(this);
    this.handleMineChange = this.handleMineChange.bind(this);
    this.handleChangeToMine = this.handleChangeToMine.bind(this);
    this.handleAddCategory = this.handleAddCategory.bind(this);

    this.handleChangeNetwork = this.handleChangeNetwork.bind(this);

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleToggleSort = this.handleToggleSort.bind(this);

    this.getPrices = this.getPrices.bind(this);
    this.getBounties = this.getBounties.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.getMyBounties = this.getMyBounties.bind(this);
    this.getMoreBounties = this.getMoreBounties.bind(this);

    this.handleSearch = this.handleSearch.bind(this);

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
  getBounties(){

    var urlBase = this.state.baseURL+'/bounty/?limit=25';

    var selectedStageUrl = "";

    console.log('current stage:', this.state.selectedStage);

    if (this.state.selectedStage === "Draft"){
      selectedStageUrl = "&bountyStage=0";
    } else if (this.state.selectedStage === "Active"){
      selectedStageUrl = "&bountyStage=1";
    } else if (this.state.selectedStage === "Dead"){
      selectedStageUrl = "&bountyStage=2";
    } else if (this.state.selectedStage === "Completed"){
      selectedStageUrl = "&bountyStage=3";
    } else if (this.state.selectedStage === "Expired"){
      selectedStageUrl = "&bountyStage=4";
    }

    //selectedMine: "ANY",
    urlBase+=selectedStageUrl;

    var selectedAddressUrl = "";

    if (this.state.selectedMine !== "ANY"){
      selectedAddressUrl = "&issuer="+this.state.accounts[0];
    }

    urlBase+=selectedAddressUrl;


    var sortByUrl = "";
    if (this.state.sortBy == "Created"){
      if (this.state.descending){
        sortByUrl = "&ordering=-bounty_created"
      } else {
        sortByUrl = "&ordering=bounty_created"
      }
    } else if (this.state.sortBy == "Value"){
      if (this.state.descending){
        sortByUrl = "&ordering=-fulfillmentAmount"
      } else {
        sortByUrl = "&ordering=fulfillmentAmount"
      }
    } else if (this.state.sortBy == "Expiry"){
      if (this.state.descending){
        sortByUrl = "&ordering=-deadline"
      } else {
        sortByUrl = "&ordering=deadline"
      }
    }

    urlBase+=sortByUrl;

    var urlCategories = "&categories__normalized_name__in="+this.state.optionsUnseparated

    urlBase+=urlCategories;

    urlBase+=("&search="+this.state.searchQuery);

    fetch(urlBase)
      .then(function(response) {
        return response.json();

      }.bind(this)).then(function(json) {
        console.log('parsed json', json)

        this.setState({bounties: json.results, loading: false, nextUrl: json.next});



      }.bind(this)).catch(function(ex) {
        console.log('parsing failed', ex)
      });
  }

  getMoreBounties(){
    this.setState({loadingMore: true});
    fetch(this.state.nextUrl)
      .then(function(response) {
        return response.json();

      }.bind(this)).then(function(json) {
        console.log('parsed json', json)
        var bounties = this.state.bounties;

        Array.prototype.push.apply(bounties,json.results);
        this.setState({bounties: bounties, loadingMore: false});



      }.bind(this)).catch(function(ex) {
        console.log('parsing failed', ex)
      });
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

        this.setState({categories: categories});



      }.bind(this)).catch(function(ex) {
        console.log('parsing failed', ex)
      });
  }

  getMyBounties(){
    fetch(this.state.baseURL+"/bounty/?limit=1000&issuer="+this.state.accounts[0])
      .then(function(response) {
        return response.json();

      }.bind(this)).then(function(json) {
        console.log('parsed json', json);
        var myDraft = 0;
        var myActive = 0;
        var myCompleted = 0;
        var myDead = 0;
        var myExpired = 0;
        var myTotal = 0;

        for (var i = 0; i < json.results.length; i++){
          if (json.results[i].bountyStage === 0){
            myDraft++;
          } else if (json.results[i].bountyStage === 1){
            myActive++;
          } else if (json.results[i].bountyStage === 2){
            myDead++;
          } else if (json.results[i].bountyStage === 3){
            myCompleted++;
          } else if (json.results[i].bountyStage === 4){
            myExpired++;
          }
          myTotal ++;
        }

        this.setState({myDraft: myDraft,
                      myActive: myActive,
                      myCompleted: myCompleted,
                      myDead: myDead,
                      myExpired: myExpired,
                      myTotal: myTotal});



      }.bind(this)).catch(function(ex) {
        console.log('parsing failed', ex)
      });
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
            this.setState({modalError: ("Please change your Ethereum network to the Rinkeby network"), modalOpen: true});
          } else if (netId === "4"){
            this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v1),
                           StandardBountiesv0 : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v0),
                           UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.rinkeby.userCommentsAddress),
                           selectedNetwork: netId,
                          baseURL: "http://staging.api.bounties.network"});
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
              this.getCategories();
              this.getMyBounties();
            }
          }
          }.bind(this));

      });
    } else {
      this.setState({accounts: ['0x0000000000000000000000000000000000000000'], selectedNetwork: "1"});
      this.getBounties();
      this.getCategories();

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
    this.setState({selectedStage: selected, loading: true, bounties: []}, this.getBounties);
  }

  handleMineChange(evt){
    evt.preventDefault();
    var selected = evt.target.value;
    this.setState({selectedMine: selected, loading: true, bounties: []}, this.getBounties);

  }
  handleChangeToMine(evt){
    evt.preventDefault();
    this.setState({selectedMine: "MINE", loading: true, bounties: []}, this.getBounties);

  }
  handleSearch(evt){
    evt.preventDefault();
    this.setState({searchQuery: evt.target.query.value, loading: true, bounties: []}, this.getBounties);
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
    this.setState({ optionsList: optionsList, value: value, containsCode: containsCode, optionsUnseparated: value, loading: true, bounties: []}, this.getBounties);

  }
  handleAddCategory(item){
    var optionsList = [];
    optionsList.push(item);
    var value;

    if (this.state.value.length > 0){
      value = this.state.value+",";
    }
    value += item;
    this.setState({optionsList: optionsList, value: value});
  }
  handleToggleSort(newSort){
  var sortByCreated = false;
  var sortByValue = false;
  var sortByExpiry = false;
  var createdDescending = true;
  var valueDescending =  true;
  var expiryDescending = true;

  if (newSort === "Created" && this.state.sortBy === "Created"){
    this.setState({descending: !this.state.descending, loading: true, bounties: []}, this.getBounties)
  } else if (newSort === "Value" && this.state.sortBy === "Value"){
    this.setState({descending: !this.state.descending, loading: true, bounties: []}, this.getBounties)
  } else if (newSort === "Expiry" && this.state.sortBy === "Expiry"){
    this.setState({descending: !this.state.descending, loading: true, bounties: []}, this.getBounties)
  } else if (newSort === "Created"){
    this.setState({sortBy: "Created", descending: true, loading: true, bounties: []}, this.getBounties)
  } else if (newSort === "Value"){
    this.setState({sortBy: "Value", descending: true, loading: true, bounties: []}, this.getBounties)
  } else if (newSort === "Expiry"){
    this.setState({sortBy: "Expiry", descending: true, loading: true, bounties: []}, this.getBounties)
  }
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



    const modalActions = [
    <FlatButton
      label="Retry"
      primary={true}
      onClick={this.handleClose}
      style={{color: "#f52a34"}}
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
        <div style={{ display: "block", overflow: "hidden", width: "1100px", margin: "0 auto", paddingBottom: "120px"}}>

          <div style={{width: "245px", float: "left", display: "block", marginRight: "15px"}}>
            <h3 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "15px", textAlign: "center", color: "#1D1749", width: "100%", fontWeight: "600", fontSize: "16px"}}>PROFILE</h3>
            <div style={{display: "block", width: "215px", backgroundColor: "rgb(249, 249, 249)" , overflow: "hidden", marginTop: "15px", padding: "15px", minHeight: "237px"}}>

            {this.state.accounts.length > 0 &&
              <div>
              <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "15px", color: "#1D1749", width: "100%", fontWeight: "500", textAlign: "center", lineHeight: "24px"}}>You have posted  <b style={{color: "#f52a34", fontSize: "24px"}}>{this.state.myTotal}</b> bounties</h5>
              <div style={{marginBottom: "15px", borderBottom: "1px solid #f52a34", display: "block", overflow: "hidden"}}>

                <div style={{width: "33%", float: "left", display: "block"}}>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "0px", textAlign: "center", color: "#1D1749", width: "100%", fontWeight: "500", lineHeight: "24px", borderRight:"1px solid #f52a34"}}><b style={{ fontSize: "24px"}}>{this.state.myDraft}</b></h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "15px", textAlign: "center", color: "rgb(255, 186, 20)", width: "100%", fontWeight: "500" }}>DRAFT</h5>

                </div>
                <div style={{width: "33%", float: "left", display: "block"}}>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "0px", textAlign: "center", color: "#1D1749", width: "100%", fontWeight: "500",  lineHeight: "24px", borderRight:"1px solid #f52a34"}}><b style={{fontSize: "24px"}}>{this.state.myActive}</b></h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "15px", textAlign: "center", color: "rgb(140, 226, 88)" , width: "100%", fontWeight: "500" }}>ACTIVE</h5>


                </div>
                <div style={{width: "33%", float: "left", display: "block"}}>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "0px", textAlign: "center", color: "#1D1749", width: "100%", fontWeight: "500", lineHeight: "24px"}}><b style={{ fontSize: "24px"}}>{this.state.myDead}</b></h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "15px", textAlign: "center", color: "#ff6846", width: "100%", fontWeight: "500"}}>DEAD</h5>

                </div>


                <div style={{width: "50%", float: "left", display: "block"}}>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "0px", textAlign: "center", color: "#1D1749", width: "100%", fontWeight: "500",  lineHeight: "24px", borderRight:"1px solid #f52a34"}}><b style={{fontSize: "24px"}}>{this.state.myExpired}</b></h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "15px", textAlign: "center", color: "rgb(104, 166, 166)" , width: "100%", fontWeight: "500" }}>EXPIRED</h5>


                </div>
                <div style={{width: "50%", float: "left", display: "block"}}>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "0px", textAlign: "center", color: "#1D1749", width: "100%", fontWeight: "500", lineHeight: "24px"}}><b style={{ fontSize: "24px"}}>{this.state.myCompleted}</b></h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "15px", textAlign: "center", color: "rgb(255, 222, 70)", width: "100%", fontWeight: "500"}}>COMPLETED</h5>

                </div>


              </div>


              <FlatButton
                label="My Profile"
                primary={true}
                labelPosition="before"
                style={{color:  "#1D1749", width: "100%", backgroundColor: "rgba(1, 1, 1, 0.05)", marginTop: "15px"}}
                icon={<SvgArrow style={{color: "#f52a34", fontSize: "44px"}}/>}
              >
              <Link to={"/user/" + this.state.accounts[0]}>

              </Link>
              </FlatButton>
              <FlatButton
                label="My Bounties"
                primary={true}
                labelPosition="before"
                onClick={this.handleChangeToMine}
                style={{color: "#1D1749", width: "100%", backgroundColor: "rgba(1, 1, 1, 0.05)", marginTop: "15px"}}
                icon={<SvgArrow style={{color: "#f52a34", fontSize: "44px"}}/>}
              />

              </div>
          }
          {this.state.accounts.length === 0 &&
            <div>
              <h5 style={{fontFamily: "Open Sans", marginTop: "35px", marginBottom: "15px", color: "#8a8a8a" , width: "100%", fontWeight: "700", textAlign: "center", fontSize: "18px"}}>You have no account!</h5>
              <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "15px", color: "#8a8a8a" , width: "100%", fontWeight: "300", textAlign: "center", fontSize: "14px"}}>{"This is likely because you're not using a web3 enabled browser."}</h5>
              <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "15px", color: "#8a8a8a" , width: "100%", fontWeight: "300", textAlign: "center", fontSize: "14px", paddingTop: "15px", borderTop: "1px solid #f52a34"}}>{"You can download the "}<a href="https://metamask.io" target="_blank" style={{color: "#f52a34", fontWeight: "700"}}> Metamask </a>{" extension to begin posting bounties."}</h5>

            </div>
          }

            </div>
            <div id="mc_embed_signup">
            <h5 style={{fontFamily: "Open Sans", marginTop: "35px", marginBottom: "15px", color: "#1D1749" , width: "100%", fontWeight: "600", textAlign: "center", fontSize: "14px"}}>SIGN UP TO RECEIVE <br/> BOUNTIES NOTIFICATIONS</h5>

              <form action="//network.us16.list-manage.com/subscribe/post?u=03351ad14a86e9637146ada2a&amp;id=96ba00fd12" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" >
                  <div id="mc_embed_signup_scroll">

										<div className="6u$ 12u$(xsmall)">
											<input type="email" name="EMAIL" id="mce-EMAIL" placeholder="email address" required style={{fontFamily: "Open Sans", border: "0px", borderBottom: "1px solid rgb(22, 229, 205)", backgroundColor: "rgba(0,0,0,0)", color: "rgb(208, 208, 208)", width: "16.2em"}}/>
										</div>
                  <div style={{position: "absolute", left: "-5000px"}} aria-hidden="true">
                    <input type="text" name="b_03351ad14a86e9637146ada2a_96ba00fd12" tabIndex="-1" value=""/>
                    </div>
                      <input type="submit" value="SIGN UP" name="subscribe" id="mc-embedded-subscribe" className="button" style={{boxShadow: "none", padding: "0px 18px", fontFamily: "Open Sans", backgroundColor: "rgb(52,74,212)", width: "17.4em", color: "white", border: "0px", padding: "5px 15px", fontWeight: "600", border: "0px solid rgba(0,0,0,0)"}}/>
                  </div>
              </form>
            </div>

          </div>
          <div style={{width: "630px", float: "left", display: "block"}}>
            <form className='Activate' onSubmit={this.handleSearch} style={{width: "100%", display: "inline-block", marginTop: "24px", marginBottom: "0px"}}>
              <input id='query' className='SendAmount' style={{width: "444px", border: "1px solid #1D1749", borderRadius: "8px", marginTop: "0px", marginBottom: "0px", marginLeft: "25px", marginRight: "18px", verticalAlign: "middle", height: "14px"}}/>
              <button type='submit' className='AddBtn' style={{width: "100px", height: "30px", backgroundColor: "#344AD4", borderRadius: "8px", border:"1px", color: "white", fontSize: "13px", marginTop: "0px", verticalAlign: "middle", fontWeight: "600", paddingTop: "3px"}}>SEARCH</button>
            </form>
            <ContractList list={this.state.bounties} acc={this.state.accounts[0]} loading={this.state.loading} loadingMore={this.state.loadingMore} title={'BOUNTIES'} handleAddCategory={this.handleAddCategory} handleToggleSort={this.handleToggleSort} prices={this.state.prices} sortBy={this.state.sortBy} handleGetMore={this.getMoreBounties} descending={this.state.descending} next={this.state.nextUrl}/>
          </div>
          <div style={{width: "195px", float: "left", display: "block", marginLeft: "15px"}} className={"FilterBarLight"}>
            <h3 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "15px", textAlign: "center", color:"#1D1749", width: "100%",  fontWeight: "600", fontSize: "16px"}}>FILTER</h3>

            <div style={{display: "block", width: "100%", backgroundColor: "rgba(1, 1, 1, 0.05)", overflow: "hidden"}}>
              <select onChange={this.handleChangeStage} value={this.state.selectedStage} style={{fontSize: "14px", backgroundColor: "rgba(10, 22, 40, 0)", border: "0px",color: "rgb(25, 55, 83)" , width: "195px", height: "40px", display: "block", borderRadius: "0px", WebkitAppearance: "none", 	background: "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgaWQ9IkxheWVyXzEiIGRhdGEtbmFtZT0iTGF5ZXIgMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNC45NSAxMCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMxZDE3NDk7fS5jbHMtMntmaWxsOiNmNWFiMmI7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5hcnJvd3M8L3RpdGxlPjxyZWN0IGNsYXNzPSJjbHMtMSIgd2lkdGg9IjQuOTUiIGhlaWdodD0iMTAiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMS40MSA0LjY3IDIuNDggMy4xOCAzLjU0IDQuNjcgMS40MSA0LjY3Ii8+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjMuNTQgNS4zMyAyLjQ4IDYuODIgMS40MSA1LjMzIDMuNTQgNS4zMyIvPjwvc3ZnPgo=') no-repeat 100% 50%", padding: "0px 10px"}}>
                <option value="Draft">Draft Bounties</option>
                <option value="Active">Active Bounties</option>
                <option value="Completed">Completed Bounties</option>
                <option value="Expired">Expired Bounties</option>
                <option value="Dead">Dead Bounties</option>
                <option value="ANY">Any Stage</option>
              </select>
            </div>
            <div style={{display: "block", width: "100%", backgroundColor: "rgba(1, 1, 1, 0.05)", overflow: "hidden", marginTop: "15px"}}>
              <select onChange={this.handleMineChange} value={this.state.selectedMine} style={{fontSize: "14px",backgroundColor: "rgba(10, 22, 40, 0)" , border: "0px", color: "rgb(25, 55, 83)", width: "195px", height: "40px", display: "block", borderRadius: "0px", WebkitAppearance: "none", 	background: "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgaWQ9IkxheWVyXzEiIGRhdGEtbmFtZT0iTGF5ZXIgMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNC45NSAxMCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMxZDE3NDk7fS5jbHMtMntmaWxsOiNmNWFiMmI7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5hcnJvd3M8L3RpdGxlPjxyZWN0IGNsYXNzPSJjbHMtMSIgd2lkdGg9IjQuOTUiIGhlaWdodD0iMTAiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMS40MSA0LjY3IDIuNDggMy4xOCAzLjU0IDQuNjcgMS40MSA0LjY3Ii8+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjMuNTQgNS4zMyAyLjQ4IDYuODIgMS40MSA1LjMzIDMuNTQgNS4zMyIvPjwvc3ZnPgo=') no-repeat 100% 50%", padding: "0px 10px"}}>
                <option value="ANY" selected="selected">{"Anyone's Bounties"}</option>
                <option value="MINE">My Bounties</option>
              </select>
            </div>
            <div style={{width: "100%", float: "left", display: "block", marginTop: "15px"}}>
              <Select multi simpleValue disabled={this.state.disabled} value={this.state.value} placeholder="Select Categories" options={this.state.categories} onChange={this.handleSelectChange} />
            </div>



          </div>
        </div>
        <p style={{textAlign: "center", display: "block", fontSize: "10px", padding: "15px 0px", color: "rgb(25, 55, 83)", width: "100%", position: "absolute", bottom: "0px"}}>&copy; Bounties Network, a <a href="https://ConsenSys.net" target="_blank" style={{textDecoration: "none", color: "rgb(25, 55, 83)"}}>ConsenSys</a> Formation <br/>
         <a href="/privacyPolicy/" target="_blank" style={{color:"rgb(25, 55, 83)"}}>Privacy Policy</a>{" | "}<a href="/terms/" target="_blank" style={{color: "rgb(25, 55, 83)"}}>Terms of Service</a>
         </p>

      </div>

    </div>

    )
  }
}

export default AppContainer
