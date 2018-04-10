import React, { Component } from 'react'
import './AppContainer.css'

import Web3 from 'web3';
import Select from 'react-select';

import { Link } from 'react-router';

import 'whatwg-fetch';

const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));
const json = require('../../../contracts.json');
const IPFS = require('ipfs-mini');

import logo from './images/logo.svg';
import logoBounties from './images/logo-bounties.svg';

import FlatButton from 'material-ui/FlatButton';

import ContractList from 'components/ContractList/ContractList';
import Navigation from 'components/Navigation/Navigation';

import Dialog from 'material-ui/Dialog';
import SvgArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right';


class AppContainer extends Component {
  constructor(props) {
    super(props)

    web3.setProvider(new Web3.providers.HttpProvider("https://mainnet.infura.io"));

    this.state = {
      modalError: "",
      modalOpen: false,
      accounts: [],
      bounties: [],
      optionsList: [],
      loading: true,
      loadingMore: false,
      selectedStage: "Active",
      selectedMine: "ANY",
      sortBy: "Created",
      descending: true,
      searchQuery: "",
      StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v1),
      UserComments : web3.eth.contract(json.interfaces.UserComments).at(json.mainNet.userCommentsAddress),
      nextUrl: "",
      categories: [],
      value: "",
      optionsUnseparated: "",
      myDraft: 0,
      myActive: 0,
      myCompleted: 0,
      myDead: 0,
      myExpired: 0,
      myTotal: 0,
      resultsCount: 0,
      baseURL: json.url.mainNet
    }

    this.getInitialData = this.getInitialData.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChangeStage = this.handleChangeStage.bind(this);
    this.handleMineChange = this.handleMineChange.bind(this);
    this.handleChangeToMine = this.handleChangeToMine.bind(this);
    this.handleAddCategory = this.handleAddCategory.bind(this);

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleToggleSort = this.handleToggleSort.bind(this);

    this.getBounties = this.getBounties.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.getMyBounties = this.getMyBounties.bind(this);
    this.getMoreBounties = this.getMoreBounties.bind(this);

    this.handleSearch = this.handleSearch.bind(this);

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
        sortByUrl = "&ordering=-usd_price"
      } else {
        sortByUrl = "&ordering=usd_price"
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

        this.setState({bounties: json.results, loading: false, nextUrl: json.next, resultsCount: json.count});

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
        this.setState({bounties: bounties, loadingMore: false, resultsCount: json.count});



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
          console.log("rinkeby", json.url.rinkeby);

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
                          console.log("rinkeby", json.url.rinkeby);
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
      this.setState({accounts: [], selectedNetwork: "1"});
      this.getBounties();
      this.getCategories();
    }
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

  handleSelectChange(value){
    var optionsList = value.split(",");
    var containsCode = false;
    if (optionsList.includes("Code") || optionsList.includes("Bugs")){
      containsCode = true;
    }

    this.setState({ optionsList: optionsList, value: value, containsCode: containsCode, optionsUnseparated: value, loading: true, bounties: []}, this.getBounties);
  }

  handleAddCategory(item){
    var optionsList = this.state.optionsList;
    var value = this.state.value;

    if (optionsList.indexOf(item) <= -1){
      optionsList.push(item);
      if (value.length > 0){
        value = this.state.value+",";
      }
      value += item;
    }

    this.setState({optionsList: optionsList, value: value, optionsUnseparated: value, loading: true, bounties: []}, this.getBounties);
  }

  handleToggleSort(newSort){
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
    const modalActions = [
      <FlatButton
        label="Retry"
        primary={true}
        onClick={this.handleClose}
        style={{color: "#4a79fa"}}
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
        <Navigation userAddress={this.state.accounts[0] || ""}/>
        <div style={{ display: "block", overflow: "hidden", maxWidth: "1150px", margin: "0 auto", paddingBottom: "120px"}}>
          <div style={{width: "245px", float: "left", display: "block", marginRight: "15px", marginLeft: "15px"}} className={"profileBar"}>
            <h3 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "15px", textAlign: "center", color: "#2D0874", width: "100%", fontWeight: "600", fontSize: "16px"}}>PROFILE</h3>
            <div style={{display: "block", width: "215px", backgroundColor: "rgb(249, 249, 249)" , overflow: "hidden", marginTop: "15px", padding: "15px", minHeight: "237px"}}>
            {this.state.accounts.length > 0 &&
              <div>
              <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "15px", color: "#1D1749", width: "100%", fontWeight: "500", textAlign: "center", lineHeight: "24px"}}>You have posted  <b style={{color: "#fe923b", fontSize: "24px"}}>{this.state.myTotal}</b> bounties</h5>
              <div style={{marginBottom: "15px", borderBottom: "1px solid #fe923b", display: "block", overflow: "hidden"}}>
                <div style={{width: "33%", float: "left", display: "block"}}>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "0px", textAlign: "center", color: "#2D0874", width: "100%", fontWeight: "500", lineHeight: "24px", borderRight:"1px solid #fe923b"}}><b style={{ fontSize: "24px"}}>{this.state.myDraft}</b></h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "15px", textAlign: "center", color: "rgb(255, 186, 20)", width: "100%", fontWeight: "500" }}>DRAFT</h5>
                </div>
                <div style={{width: "33%", float: "left", display: "block"}}>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "0px", textAlign: "center", color: "#2D0874", width: "100%", fontWeight: "500",  lineHeight: "24px", borderRight:"1px solid #fe923b"}}><b style={{fontSize: "24px"}}>{this.state.myActive}</b></h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "15px", textAlign: "center", color: "rgb(140, 226, 88)" , width: "100%", fontWeight: "500" }}>ACTIVE</h5>
                </div>
                <div style={{width: "33%", float: "left", display: "block"}}>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "0px", textAlign: "center", color: "#2D0874", width: "100%", fontWeight: "500", lineHeight: "24px"}}><b style={{ fontSize: "24px"}}>{this.state.myDead}</b></h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "15px", textAlign: "center", color: "#ff6846", width: "100%", fontWeight: "500"}}>DEAD</h5>
                </div>
                <div style={{width: "50%", float: "left", display: "block"}}>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "0px", textAlign: "center", color: "#2D0874", width: "100%", fontWeight: "500",  lineHeight: "24px", borderRight:"1px solid #fe923b"}}><b style={{fontSize: "24px"}}>{this.state.myExpired}</b></h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "15px", textAlign: "center", color: "rgb(104, 166, 166)" , width: "100%", fontWeight: "500" }}>EXPIRED</h5>
                </div>
                <div style={{width: "50%", float: "left", display: "block"}}>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "0px", textAlign: "center", color: "#2D0874", width: "100%", fontWeight: "500", lineHeight: "24px"}}><b style={{ fontSize: "24px"}}>{this.state.myCompleted}</b></h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "0px", marginBottom: "15px", textAlign: "center", color: "rgb(255, 222, 70)", width: "100%", fontWeight: "500"}}>COMPLETED</h5>
                </div>
              </div>

              <Link to={"/user/" + this.state.accounts[0]}>
              <FlatButton
                label="My Profile"
                primary={true}
                labelPosition="before"
                style={{color:  "#1D1749", width: "100%", backgroundColor: "rgba(1, 1, 1, 0.05)", marginTop: "15px"}}
                icon={<SvgArrow style={{color: "#4a79fa", fontSize: "44px"}}/>}
              >
              </FlatButton>
              </Link>

              <FlatButton
                label="My Bounties"
                primary={true}
                labelPosition="before"
                onClick={this.handleChangeToMine}
                style={{color: "#1D1749", width: "100%", backgroundColor: "rgba(1, 1, 1, 0.05)", marginTop: "15px"}}
                icon={<SvgArrow style={{color: "#4a79fa", fontSize: "44px"}}/>}
              />
              </div>
              }
              {this.state.accounts.length === 0 &&
                <div>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "35px", marginBottom: "15px", color: "#8a8a8a" , width: "100%", fontWeight: "700", textAlign: "center", fontSize: "18px"}}>You have no account!</h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "15px", color: "#8a8a8a" , width: "100%", fontWeight: "300", textAlign: "center", fontSize: "14px"}}>{"This is likely because you're not using a web3 enabled browser."}</h5>
                  <h5 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "15px", color: "#8a8a8a" , width: "100%", fontWeight: "300", textAlign: "center", fontSize: "14px", paddingTop: "15px", borderTop: "1px solid #4a79fa"}}>{"You can download the "}<a href="https://metamask.io" target="_blank" style={{color: "#4a79fa", fontWeight: "700"}}> Metamask </a>{" extension to begin posting bounties."}</h5>

                </div>
              }
            </div>
            <div id="mc_embed_signup">
              <h5 style={{fontFamily: "Open Sans", marginTop: "35px", marginBottom: "15px", color: "#2D0874" , width: "100%", fontWeight: "600", textAlign: "center", fontSize: "14px"}}>SIGN UP TO RECEIVE <br/> BOUNTIES NOTIFICATIONS</h5>
              <form action="//network.us16.list-manage.com/subscribe/post?u=03351ad14a86e9637146ada2a&amp;id=96ba00fd12" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" >
                  <div id="mc_embed_signup_scroll">

										<div className="6u$ 12u$(xsmall)">
											<input type="email" name="EMAIL" id="mce-EMAIL" placeholder="email address" required style={{fontFamily: "Open Sans", border: "0px", borderBottom: "1px solid #fe923b", backgroundColor: "rgba(0,0,0,0)", color: "rgb(208, 208, 208)", width: "16.2em"}}/>
										</div>
                  <div style={{position: "absolute", left: "-5000px"}} aria-hidden="true">
                    <input type="text" name="b_03351ad14a86e9637146ada2a_96ba00fd12" tabIndex="-1" value=""/>
                    </div>
                      <input type="submit" value="SIGN UP" name="subscribe" id="mc-embedded-subscribe" className="button" style={{boxShadow: "none", fontFamily: "Open Sans", backgroundColor: "#4A79FA", width: "17.4em", color: "white", border: "0px", padding: "5px 15px", fontWeight: "600"}}/>
                  </div>
              </form>
            </div>
          </div>
          <div className={"results"} style={{float: "left", display: "block", paddingTop: "24px"}}>
            <form className='Activate' onSubmit={this.handleSearch} className='searchBar' style={{width: "calc(100% - 60px)", display: "block", margin: "0 auto", marginBottom: "0px"}}>
              <input id='query' style={{width: "calc(100% - 136px)", border: "1px solid #2D0874", borderRadius: "8px", marginTop: "0px", marginBottom: "0px", marginRight: "18px", verticalAlign: "middle", height: "14px"}}/>
              <button type='submit' className='AddBtn' style={{width: "100px", height: "30px", backgroundColor: "#4A79FA", borderRadius: "8px", border:"1px", color: "white", fontSize: "13px", marginTop: "0px", verticalAlign: "middle", fontWeight: "600", paddingTop: "3px"}}>SEARCH</button>
            </form>
            <ContractList list={this.state.bounties} acc={this.state.accounts[0]} loading={this.state.loading} loadingMore={this.state.loadingMore} title={'BOUNTIES'} handleAddCategory={this.handleAddCategory} handleToggleSort={this.handleToggleSort} sortBy={this.state.sortBy} handleGetMore={this.getMoreBounties} descending={this.state.descending} next={this.state.nextUrl} count={this.state.resultsCount}/>
          </div>
          <div style={{width: "245px", float: "right", display: "block", marginLeft: "15px", marginRight: "15px"}} className={"FilterBarLight filterBar"}>
            <h3 style={{fontFamily: "Open Sans", marginTop: "15px", marginBottom: "15px", textAlign: "center", color:"#2D0874", width: "100%",  fontWeight: "600", fontSize: "16px"}}>FILTER</h3>

            <div style={{display: "block", width: "100%", backgroundColor: "rgba(1, 1, 1, 0.05)", overflow: "hidden"}}>
              <select onChange={this.handleChangeStage} value={this.state.selectedStage} style={{fontSize: "14px", backgroundColor: "rgba(10, 22, 40, 0)", border: "0px",color: "#2D0874" , width: "100%", height: "40px", display: "block", borderRadius: "0px", WebkitAppearance: "none", 	background: "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgaWQ9IkxheWVyXzEiIGRhdGEtbmFtZT0iTGF5ZXIgMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNC45NSAxMCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMxZDE3NDk7fS5jbHMtMntmaWxsOiNmNWFiMmI7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5hcnJvd3M8L3RpdGxlPjxyZWN0IGNsYXNzPSJjbHMtMSIgd2lkdGg9IjQuOTUiIGhlaWdodD0iMTAiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMS40MSA0LjY3IDIuNDggMy4xOCAzLjU0IDQuNjcgMS40MSA0LjY3Ii8+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjMuNTQgNS4zMyAyLjQ4IDYuODIgMS40MSA1LjMzIDMuNTQgNS4zMyIvPjwvc3ZnPgo=') no-repeat 100% 50%", padding: "0px 10px"}}>
                <option value="Draft">Draft Bounties</option>
                <option value="Active">Active Bounties</option>
                <option value="Completed">Completed Bounties</option>
                <option value="Expired">Expired Bounties</option>
                <option value="Dead">Dead Bounties</option>
                <option value="ANY">Any Stage</option>
              </select>
            </div>
            <div style={{display: "block", width: "100%", backgroundColor: "rgba(1, 1, 1, 0.05)", overflow: "hidden", marginTop: "15px"}}>
              <select onChange={this.handleMineChange} value={this.state.selectedMine} style={{fontSize: "14px",backgroundColor: "rgba(10, 22, 40, 0)" , border: "0px", color: "#2D0874", width: "100%", height: "40px", display: "block", borderRadius: "0px", WebkitAppearance: "none", 	background: "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgaWQ9IkxheWVyXzEiIGRhdGEtbmFtZT0iTGF5ZXIgMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNC45NSAxMCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMxZDE3NDk7fS5jbHMtMntmaWxsOiNmNWFiMmI7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5hcnJvd3M8L3RpdGxlPjxyZWN0IGNsYXNzPSJjbHMtMSIgd2lkdGg9IjQuOTUiIGhlaWdodD0iMTAiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMS40MSA0LjY3IDIuNDggMy4xOCAzLjU0IDQuNjcgMS40MSA0LjY3Ii8+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjMuNTQgNS4zMyAyLjQ4IDYuODIgMS40MSA1LjMzIDMuNTQgNS4zMyIvPjwvc3ZnPgo=') no-repeat 100% 50%", padding: "0px 10px"}}>
                <option value="ANY" selected="selected">{"Anyone's Bounties"}</option>
                <option value="MINE">My Bounties</option>
              </select>
            </div>
            <div style={{width: "100%", float: "left", display: "block", marginTop: "15px"}}>
              <Select multi simpleValue disabled={this.state.disabled} value={this.state.value} placeholder="Select Categories" options={this.state.categories} onChange={this.handleSelectChange} />
            </div>
          </div>
        </div>
        <p style={{textAlign: "center", display: "block", fontSize: "10px", padding: "15px 0px", color: "#2D0874", width: "100%", position: "absolute", bottom: "0px"}}>&copy; Bounties Network, a <a href="https://ConsenSys.net" target="_blank" style={{textDecoration: "none", color: "#2D0874"}}>ConsenSys</a> Formation <br/>
         <a href="/privacyPolicy/" target="_blank" style={{color:"#2D0874"}}>Privacy Policy</a>{" | "}<a href="/terms/" target="_blank" style={{color: "#2D0874"}}>Terms of Service</a>
         </p>
      </div>
    </div>
    )
  }
}

export default AppContainer
