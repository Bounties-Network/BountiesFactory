import React, { Component } from 'react'
import './NewBounty.css'

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));
import { Link } from 'react-router';

const json = require('../../../contracts.json');
const networkId = json.networkId;

const Buffer = require('buffer/').Buffer;

const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const ipfsAPI = require('ipfs-api');

var ipfsNew = ipfsAPI({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});

const BigNumber = require('bignumber.js');

import ipfsFiles from "browser-ipfs";

import { browserHistory } from 'react-router';

import logo from '../AppContainer/images/logo.svg';
import darkMoon from '../AppContainer/images/DarkMoon.png';
import lightMoon from '../AppContainer/images/LightMoon.png';

import FlatButton from 'material-ui/FlatButton';

import BountiesFacts from 'components/BountiesFacts/BountiesFacts';
import SvgCheck from 'material-ui/svg-icons/action/check-circle';

import Select from 'react-select';
import Dialog from 'material-ui/Dialog';
import LinearProgress from 'material-ui/LinearProgress';


import Halogen from 'halogen';


class NewBounty extends Component {
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
      loadingInitial: true,
      accounts: [],
      contracts: [],
      fulfillments: [],
      bounties: [],
      total: 0,
      totalMe: 0,
      milestones: [{
        payout: 0,
        title: "Title for milestone",
        description: "Description for milestone",
        difficulty: 0
      }],
      numMilestones: 1,
      optionsList: [],
      sourceFileName: "",
      sourceFileHash: "",
      sourceDirectoryHash: "",
      payoutMethod: "ETH",
      activateNow: "later",
      encrypt: false,
      titleError: "",
      descriptionError: "",
      payoutError: "",
      contactError: "",
      deadlineError: "",
      tokenAddressError: "",
      valueError: "",
      fileUploadError: "",
      didUploadFile: false,
      fileUploadFinished: false,
      submitting: false,
      loadingAmount: 10,
      loadingString: "",
      containsCode: false,
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
    this.handleSubmitContract = this.handleSubmitContract.bind(this);
    this.handlecaptureFile = this.handlecaptureFile.bind(this);
    this.handleTokenChange = this.handleTokenChange.bind(this);
    this.handleEncryptChange = this.handleEncryptChange.bind(this);
    this.handleActivateNowChange = this.handleActivateNowChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleChangeNetwork = this.handleChangeNetwork.bind(this);

    this.getCategories = this.getCategories.bind(this);

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
          this.setState({modalError: ("Please change your Ethereum network to the Rinkeby network"), modalOpen: true});
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

              this.getCategories();
              this.state.StandardBounties.getNumBounties((cerr, succ) => {
                var total = parseInt(succ,10);
                this.setState({total: total});
              });
            }
          }
        }.bind(this));

    });
    } else {
      this.setState({modalError: "You must use MetaMask if you would like to use the Bounties.network dapp", modalOpen: true});
    }

  }



  handleSubmitContract(evt){

    evt.preventDefault();
    var info = evt.target.contact_info.value;
    var description = evt.target.contract_description.value;
    var title = evt.target.contract_title.value;
    var oldDeadline = evt.target.bounty_deadline.value;
    var fulfillmentAmount = evt.target.fulfillmentAmount.value;
    var tokenAddress = "0x0000000000000000000000000000000000000000";
    if (evt.target.token_address){
      tokenAddress = evt.target.token_address.value;
    }
    var githubLink;
    if (evt.target.github_link){
      githubLink = evt.target.github_link.value;
    }

    var foundError = false;
    if (title === ""){
      foundError = true;
      this.setState({titleError: "You must enter a title for your bounty"});
    } else {
      this.setState({titleError: ""});
    }
    if (description === ""){
      foundError = true;
      this.setState({descriptionError: "You must enter a description, with requirements for your bounty"});
    } else {
      this.setState({descriptionError: ""});
    }
    if (fulfillmentAmount === "" || fulfillmentAmount === "0"){
      foundError = true;
      this.setState({fulfillmentError: "The bounty payout must be valid and non-zero"});
    } else {
      this.setState({fulfillmentError: ""});
    }
    if (oldDeadline === ""){
      foundError = true;
      this.setState({deadlineError: "You must enter a valid deadline for your bounty"});
    } else {
      this.setState({deadlineError: ""});
    }

    if (this.state.didUploadFile && !this.state.fileUploadFinished){
      foundError = true;
      this.setState({fileUploadError: "You must wait for your file upload to complete"});
    } else {
      this.setState({fileUploadError: ""});
    }

    if (info === ""){
      foundError = true;
      this.setState({contactError: "You must enter valid contact information"});
    } else {
      this.setState({contactError: ""});
    }



    var deadline = new Date(oldDeadline + "z");
    var date = deadline.getTime()/1000|0;
    date +=  "";

    if (this.state.activateNow === "now"){
      var value = 0;

      if (evt.target.deposit_amount.value){
        value = evt.target.deposit_amount.value;
      }

      if (value === "" || value === 0){
        foundError = true;
        this.setState({valueError: "You must activate your bounty with a non-zero amount"});
      } else if (parseInt(value, 10) < parseInt(fulfillmentAmount, 10)){
        foundError = true;
        this.setState({valueError: "You must activate your bounty with at least enough funds to pay out once"});
      }else {
        this.setState({valueError: ""});
      }
    }

    if (!foundError){
      var tokenContract = web3.eth.contract(json.interfaces.HumanStandardToken).at(tokenAddress);

      tokenContract.symbol((err, symbol)=> {
        this.setState({submitting: true, loadingAmount: 10});
        var stringAmount = 0;
        var stringValue = 0;
        if (this.state.payoutMethod === "ETH"){
          stringAmount = web3.toWei(fulfillmentAmount ,'ether');
          stringValue = web3.toWei(value, 'ether');

          var submit = {
            payload: {
              title: title,
              description: description,
              sourceFileHash: this.state.sourceFileHash,
              sourceDirectoryHash: this.state.sourceDirectoryHash,
              sourceFileName: this.state.sourceFileName,
              webReferenceURL: githubLink,
              categories: this.state.optionsList,
              created: new Date().getTime()/1000|0,
              tokenAddress: tokenAddress,
              symbol: 'ETH',
              issuer: {
                address: this.state.accounts[0],
                email: info
              },
              funders: [{
                address: this.state.accounts[0],
                email: info
              }]
            },
            meta: {
              platform: 'bounties-network',
              schemaVersion: '0.1',
              schemaName: 'standardSchema'
            }

          };
            this.setState({loadingAmount: 15});

          ipfs.addJSON(submit, (err, result)=> {
            this.setState({loadingAmount: 50});
            if (this.state.activateNow === "now"){
              this.setState({loadingString: "Please confirm the Ethereum transaction to issue and activate your bounty"});

              this.state.StandardBounties.issueAndActivateBounty(this.state.accounts[0], date, result, stringAmount, 0x0, false, 0x0, stringValue, {from: this.state.accounts[0], value: stringValue}, (cerr, succ)=> {
                if (err){
                  console.log("cerr", err);
                  this.setState({loadingString: "An error occurred. Please refresh the page and try again."});

                } else {
                  console.log("tx success", succ);
                  this.setState({loadingAmount: 80, loadingString: "Waiting for your transaction to be confirmed on the blockchain..."});
                  var hasSucceeded = false;
                  setInterval(function() {
                    if (!hasSucceeded){
                      web3.eth.getTransaction(succ, (err, succ)=> {
                        if (succ.blockNumber){
                          this.setState({loadingString: "Transaction confirmed!", loadingAmount: 100});
                          hasSucceeded = true;
                          setTimeout(function(){
                              browserHistory.push('/');

                          }, 3000);
                        }
                      });
                    }
                  }.bind(this), 100);
                }
                //browserHistory.push('/');
              });
            } else {
              this.setState({loadingString: "Please confirm the Ethereum transaction to issue your bounty"});
              this.state.StandardBounties.issueBounty(this.state.accounts[0], date, result, stringAmount, 0x0, false, 0x0, {from: this.state.accounts[0]}, (err, succ)=> {
                if (err){
                  console.log("cerr", err);
                  this.setState({loadingString: "An error occurred. Please refresh the page and try again."});

                } else {
                  console.log("tx success", succ);
                  this.setState({loadingAmount: 80, loadingString: "Waiting for your transaction to be confirmed on the blockchain..."});
                  var hasSucceeded = false;
                  setInterval(function() {
                    if (!hasSucceeded){
                      web3.eth.getTransaction(succ, (err, transaction)=> {
                        if (transaction.blockNumber){
                          this.setState({loadingString: "Transaction confirmed!", loadingAmount: 100});
                          hasSucceeded = true;
                          setTimeout(function(){
                              browserHistory.push('/');

                          }, 3000);
                        }
                      });
                    }
                  }.bind(this), 100);
                }


                //browserHistory.push('/');
              });

            }
          });

        } else {

          console.log("tokenContract", tokenContract);
          tokenContract.decimals((err, succ)=>{
            let decimals = parseInt(succ, 10);
            var padding = Array(decimals+1).join("0");
            stringAmount = "" + fulfillmentAmount + padding;
            stringValue = "" + value + padding;

            var submit = {
              payload: {
                title: title,
                description: description,
                sourceFileHash: this.state.sourceFileHash,
                sourceDirectoryHash: this.state.sourceDirectoryHash,
                sourceFileName: this.state.sourceFileName,
                webReferenceURL: githubLink,
                categories: this.state.optionsList,
                created: new Date().getTime()/1000|0,
                tokenAddress: tokenAddress,
                symbol: symbol,
                issuer: {
                  address: this.state.accounts[0],
                  email: info
                },
                funders: [{
                  address: this.state.accounts[0],
                  email: info
                }]
              },
              meta: {
                platform: 'bounties-network',
                schemaVersion: '0.1',
                schemaName: 'standardSchema'
              }

            };
            this.setState({loadingAmount: 15});
            ipfs.addJSON(submit, {pin: true}, (err, result)=> {
              this.setState({loadingAmount: 40});
              if (this.state.activateNow === "now"){
                this.setState({loadingString: "Please confirm the Ethereum transaction to transfer the tokens for the new bounty"});

                tokenContract.approve(this.state.StandardBounties.address, stringValue, {from: this.state.accounts[0]}, (err, succ)=> {
                  if (err){
                    console.log("cerr", err);
                    this.setState({loadingString: "An error occurred. Please refresh the page and try again."});

                  } else {
                    console.log("tx success", succ);
                    this.setState({loadingAmount: 60, loadingString: "Waiting for your token transfer transaction to be confirmed on the blockchain..."});
                    var hasSucceeded = false;
                    setInterval(function() {
                      if (!hasSucceeded){
                        web3.eth.getTransaction(succ, (err, succ)=> {
                          if (succ.blockNumber){
                            hasSucceeded = true;
                            this.setState({loadingString: "Please confirm the Ethereum transaction to issue and activate your new bounty", loadingAmount: 80});
                            this.state.StandardBounties.issueAndActivateBounty(this.state.accounts[0], date, result, stringAmount, 0x0, true, tokenAddress, stringValue, {from: this.state.accounts[0]}, (cerr, succ)=> {
                              if (err){
                                console.log("cerr", err);
                                this.setState({loadingString: "An error occurred. Please refresh the page and try again."});

                              } else {
                                console.log("tx success", succ);
                                this.setState({loadingAmount: 90, loadingString: "Waiting for your new bounty transaction to be confirmed on the blockchain..."});
                                var hasSucceeded = false;
                                setInterval(function() {
                                  if (!hasSucceeded){
                                    web3.eth.getTransaction(succ, (err, succ)=> {
                                      if (succ.blockNumber){
                                        this.setState({loadingString: "Transaction confirmed!", loadingAmount: 100});
                                        hasSucceeded = true;
                                        setTimeout(function(){
                                            browserHistory.push('/');

                                        }, 3000);
                                      }
                                    });
                                  }
                                }.bind(this), 100);
                              }
                              //browserHistory.push('/');
                            });

                          }
                        });
                      }
                    }.bind(this), 100);
                  }

                });

              } else {
                this.setState({loadingString: "Please confirm the Ethereum transaction to issue your bounty"});

                this.state.StandardBounties.issueBounty(this.state.accounts[0], date, result, stringAmount, 0x0, true, tokenAddress, {from: this.state.accounts[0]}, (cerr, succ)=> {
                  if (err){
                    console.log("cerr", err);
                    this.setState({loadingString: "An error occurred. Please refresh the page and try again."});

                  } else {
                    console.log("tx success", succ);
                    this.setState({loadingAmount: 80, loadingString: "Waiting for your transaction to be confirmed on the blockchain..."});
                    var hasSucceeded = false;
                    setInterval(function() {
                      if (!hasSucceeded){
                        web3.eth.getTransaction(succ, (err, succ)=> {
                          if (succ.blockNumber){
                            this.setState({loadingString: "Transaction confirmed!", loadingAmount: 100});
                            hasSucceeded = true;
                            setTimeout(function(){
                                browserHistory.push('/');

                            }, 3000);
                          }
                        });
                      }
                    }.bind(this), 100);
                  }
                  //browserHistory.push('/');
                });
              }
            });


          });
        }
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
    let ipfsId

    const buffer = Buffer.from(reader.result);

    ipfsNew.add([{path: "/bounties/" + this.state.sourceFileName, content: buffer}], (err, response)=> {

      console.log("response", response);
      this.setState({sourceDirectoryHash: response[1].hash, fileUploadFinished: true});
    });

  }
  handleTokenChange(evt){
    this.setState({payoutMethod: evt.target.value});
  }
  handleActivateNowChange(evt){
    this.setState({activateNow: evt.target.value});
  }
  handleEncryptChange(evt){
    this.setState({encrypt: evt.target.value});
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

  handleSelectChange (value) {
    var optionsList = value.split(",");
    var containsCode = false;
    if (optionsList.includes("Code")|| optionsList.includes("Bugs")){
      containsCode = true;
    }
    this.setState({ optionsList: optionsList, value: value, containsCode: containsCode});
    console.log("value selected", value);
    this.forceUpdate();

  }

  render() {
    const modalActions = [
      <FlatButton
      label="Retry"
      primary={true}
      onClick={this.handleClose}
      />
    ];
    var fileName;
    if (this.state.sourceFileName.length > 38){
      fileName = this.state.sourceFileName.substring(0,38) + "...";
    } else {
      fileName = this.state.sourceFileName;
    }
    document.title = "Bounties Explorer | New Bounty";

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
          <Link to="/" style={{width: "276px", overflow: "hidden", display: "block", padding: "1em 0em 1em 0em", margin: "0 auto"}}>
            <div style={{backgroundImage:  `url(${logo})`, height: "3em", width: "14em", backgroundSize: "contain", backgroundRepeat: "no-repeat", display: "block", float: "left", marginLeft: "57px"}}>
            </div>
          </Link>
          <FlatButton style={{backgroundColor: "rgba(0,0,0,0)", border: "1px solid #16e5cd", color: "#16e5cd", width: "150px", float: "left", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", left: "30px"}} > <Link to="/leaderboard/" style={{textDecoration: "none"}}> LeaderBoard </Link></FlatButton>
          <span style={{backgroundSize: 'cover', backgroundRepeat: 'no-repeat', borderRadius: '50%', boxShadow: 'inset rgba(255, 255, 255, 0.6) 0 2px 2px, inset rgba(0, 0, 0, 0.3) 0 -2px 6px'}} />
          </div>
            <div style={{display: "block", width: "1050px", padding: "15px", margin: "0 auto", marginBottom: "75px", marginTop: "15px", backgroundColor: "rgb(249,249,249)", border: "0px", borderBottom: "0px solid #16e5cd", color:"rgb(25, 55, 83)"}} className="ContractCard">
              <h3 style={{fontFamily: "Open Sans", margin: "15px", textAlign: "Center",width: "1000px", fontWeight: "600", fontSize: "28px"}}>Create a New Bounty</h3>
              <form className='AddProject' onSubmit={this.handleSubmitContract} style={{padding: "15px", color: "rgb(25, 55, 83)"}}>
                <label style={{fontSize: "12px", display: "block"}} htmlFor='contract_title'>Title</label>
                <input id='contract_title' style={{border: "none", width: "1000px"}} className='SendAmount' type='text' />
                {this.state.titleError &&
                  <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.titleError}</p>}
                <label style={{fontSize: "12px", display: "block"}} htmlFor='contract_description'>Description</label>
                <textarea rows="3" id='contract_description' className='SendAmount ' type='text'  style={{width: "995px", marginBottom: "15px", fontSize: "16px", padding: "10px", border: "0px"}}/>
                {this.state.descriptionError &&
                  <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.descriptionError}</p>}
                <div style={{display: "inline-block"}}>
                  <div style={{width: "490px", marginRight: "15px", float: "left", display: "inline-block"}}>
                    <label style={{fontSize: "12px"}} >Payout Method</label>
                    <select onChange={this.handleTokenChange} style={{fontSize: "16px", backgroundColor: "rgba(255, 255, 255, 0)", border:"1px solid rgb(25, 55, 83)", color:  "rgb(25, 55, 83)", width: "490px", height: "40px", display: "block"}}>
                      <option value="ETH">ETH</option>
                      <option value="ERC">ERC20 Token </option>
                    </select>
                    <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "10px", marginBottom: "15px"}}>the token which will be used to pay out the reward</p>

                  </div>
                  <div style={{width: "490px", marginLeft: "25px", float: "left", display: "inline-block"}}>
                    <label style={{fontSize: "12px"}} htmlFor='contact_info'>Payout Amount (ETH or whole tokens)</label>
                    <input id="fulfillmentAmount" style={{width: "470px", border: "0px"}} type="number" step="any"></input>
                    <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "-10px", marginBottom: "15px"}}>the reward amount for completing the task</p>
                    {this.state.fulfillmentError &&
                      <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.fulfillmentError}</p>}
                  </div>
                </div>
                <div style={{display: "inline-block"}}>
                  <div style={{width: "490px", marginRight: "15px", float: "left", display: "inline-block"}}>
                    <label style={{fontSize: "12px"}} htmlFor='contract_code'>Associated Files</label>
                    <input id='contract_code' type="file" name="file" onChange={this.handlecaptureFile} style={{width: "0px", display: "block", border: "0px", color: "rgb(25, 55, 83)", height: "0px", padding: "0px", margin: "0px"}}/>
                    <div style={{width: "475px", display: "block", border: "1px solid rgb(25, 55, 83)", color: "rgb(25, 55, 83)", height: "20px", padding: "7.5px", paddingTop: "6px", paddingLeft: "4px", borderRadius: "4px"}}>
                      <label htmlFor="contract_code" style={{backgroundColor: "white", color: "#122134", padding: "3px 15px", fontWeight: "700", borderRadius: "4px", marginTop: "-1px"}}> Upload </label>
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
                      <span style={{float: "right", marginRight: "15px"}}> {fileName} </span>

                    </div>
                    <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "5px"}}>any files required by bounty hunters</p>
                    {this.state.fileUploadError &&
                      <p style={{fontSize: "12px", color:"#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.fileUploadError}</p>}
                  </div>
                  <div style={{width: "490px", marginLeft: "25px", float: "left", display: "inline-block"}}>
                    <label style={{fontSize: "12px"}} htmlFor='contact_info'>Contact Info</label>
                    <input id="contact_info" style={{width: "468px", border: "none"}}></input>
                    <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "-10px", marginBottom: "15px"}}>for bounty hunters to be able to contact you off-chain</p>
                    {this.state.contactError &&
                      <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.contactError}</p>}
                  </div>
                </div>
                <div style={{display: "inline-block"}}>
                  <div style={{width: "490px", marginRight: "15px", float: "left", display: "inline-block"}}>
                    <label style={{fontSize: "12px"}} >When to Activate</label>
                    <select onChange={this.handleActivateNowChange} style={{fontSize: "16px", backgroundColor: "rgba(255, 255, 255, 0)", border:"1px solid rgb(25, 55, 83)", color: "rgb(25, 55, 83)", width: "490px", height: "40px", display: "block"}}>
                      <option value="later">Later</option>
                      <option value="now">Now</option>
                    </select>
                    <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "10px", marginBottom: "15px"}}>The requirements for a bounty can only be edited while it is in the draft stage</p>
                  </div>
                  <div style={{width: "465px", marginLeft: "25px", float: "left", display: "inline-block"}}>
                    <label style={{fontSize: "12px"}} htmlFor='bounty_deadline'>Bounty Deadline (UTC)</label>
                    <input id='bounty_deadline' style={{border: "none", width: "470px"}} type='datetime-local' max="2222-12-22T22:22"/>
                    <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "-10px", marginBottom: "15px"}}>the deadline for submitting any bugs</p>
                    {this.state.deadlineError &&
                      <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.deadlineError}</p>}
                  </div>
                </div>
                <div style={{display: "inline-block"}}>
                  <div style={{width: "490px", marginRight: "15px", float: "left", display: "inline-block"}} className={"LightMode"}>
                    <label style={{fontSize: "12px"}} >Bounty Category</label>
                    <Select.Creatable multi simpleValue disabled={this.state.disabled} value={this.state.value} placeholder="Select task categories" options={this.state.categoryOptions} onChange={this.handleSelectChange} />
                    <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "5px", marginBottom: "15px"}}>the types of tasks being bountied</p>
                  </div>
                  {this.state.activateNow === "now" && (
                    <div style={{width: "465px", marginLeft: "25px", float: "left", display: "inline-block"}}>
                      <label style={{fontSize: "12px", textAlign: "left", display: "block"}} htmlFor='token_address'>Deposit Amount</label>
                      <input id='deposit_amount' style={{border: "none", width: "470px"}} className='SendAmount' type='number' step="any"/>
                      <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "-10px", marginBottom: "15px"}}>To activate, you must deposit enough to pay the bounty at least once</p>
                      {this.state.valueError &&
                        <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.valueError}</p>}
                    </div>
                  )}
                  {this.state.encrypt &&
                  <div style={{width: "490px", marginLeft: "25px", float: "left", display: "inline-block"}}>

                      <label style={{fontSize: "12px"}} >Encrypt File Submissions</label>
                      <select onChange={this.handleEncryptChange} style={{fontSize: "16px", backgroundColor: "rgba(255, 255, 255, 0)", border:"1px solid white", color: "rgb(25, 55, 83)", width: "457px", height: "40px", display: "block"}}>
                        <option value="encrypt">Encrypt Submissions</option>
                        <option value="no">No Encryption of Submissions</option>
                      </select>
                      <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "10px", marginBottom: "15px"}}>Submissions will be encrypted for the issuer, unless otherwise specified</p>

                  </div>}
                </div>
                  {this.state.payoutMethod === "ERC" && (
                    <div style={{float: "left", display: "inline-block"}}>
                      <label style={{fontSize: "12px", textAlign: "left", display: "block"}} htmlFor='token_address'>Token Address</label>
                      <input id='token_address' style={{border: "none", width: "1000px"}} className='SendAmount' type='text'/>
                      <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "-10px", marginBottom: "15px"}}>the address of the token you plan to use</p>
                    </div>
                  )}
                  {this.state.containsCode && (
                    <div style={{float: "left", display: "inline-block"}}>
                      <label style={{fontSize: "12px", textAlign: "left", display: "block"}} htmlFor='token_address'>Github Link</label>
                      <input id='github_link' style={{border: "none", width: "1000px"}} className='SendAmount' type='text'/>
                      <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "-10px", marginBottom: "15px"}}>a github link to a relevant repository</p>
                    </div>
                  )}
                {this.state.submitting &&
                  <div style={{width: "50%", display: "block", margin: "0 auto", marginTop: "30px"}}>
                  <p style={{fontSize: "14px", textAlign: "center"}}> {this.state.loadingString} </p>

                    <LinearProgress mode="determinate" value={this.state.loadingAmount} color="rgb(255, 222, 70)"/>
                    </div>
                }
                <button type='submit' className='AddBtn' style={{backgroundColor: "#16e5cd", border:"0px", width: "200px", margin: "0 auto", color: "rgb(21, 38, 57)", display: "block", marginTop: "30px"}}>Create</button>

              </form>

            </div>
            <p style={{textAlign: "center", display: "block", fontSize: "10px", padding: "15px 0px", color: "rgb(25, 55, 83)", width: "100%", position: "absolute", bottom: "0px"}}>&copy; Bounties Network, a <a href="https://ConsenSys.net" target="_blank" style={{textDecoration: "none", color: "rgb(25, 55, 83)"}}>ConsenSys</a> Formation <br/>
             <a href="/privacyPolicy/" target="_blank" style={{color: "rgb(25, 55, 83)"}}>Privacy Policy</a>{" | "}<a href="/terms/" target="_blank" style={{color: "rgb(25, 55, 83)"}}>Terms of Service</a>
             </p>
        </div>

      </div>
    )
  }
}

export default NewBounty
