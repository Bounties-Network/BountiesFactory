import React, { Component } from 'react'
import './NewBounty.css'

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));
import { Link } from 'react-router';

const json = require('../../../contracts.json');

const Buffer = require('buffer/').Buffer;

const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const ipfsAPI = require('ipfs-api');

var ipfsNew = ipfsAPI({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});

import { browserHistory } from 'react-router';
const ReactMarkdown = require('react-markdown');

import logo from '../AppContainer/images/logo.svg';
import logoBounties from '../AppContainer/images/logo-bounties.svg';
import Navigation from 'components/Navigation/Navigation';

import FlatButton from 'material-ui/FlatButton';

import SvgCheck from 'material-ui/svg-icons/action/check-circle';

import Select from 'react-select';
import Dialog from 'material-ui/Dialog';
import LinearProgress from 'material-ui/LinearProgress';

import Halogen from 'halogen';

const intitialDescription =
`# Description
- Description of the bounty

# Definition of Done
- Definition 1
- Definition 2

# Requirements
A correct submission will:
- requirement 1
- requirement 2
- requirement 3

# Revisions
We will require at most 3 revisions for submitted work`;

class NewBounty extends Component {
  constructor(props) {
    super(props)

    this.state = {
      modalError: "",
      modalOpen: false,
      accounts: [],
      optionsList: [],
      sourceFileName: "",
      sourceFileHash: "",
      sourceDirectoryHash: "",
      description: intitialDescription,
      payoutMethod: "ERC",
      activateNow: "now",
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
      StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v1),
      UserComments : web3.eth.contract(json.interfaces.UserComments).at(json.mainNet.userCommentsAddress),
      baseURL: json.url.mainNet
    }
    this.ipfsApi = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: "https"});


    this.getInitialData = this.getInitialData.bind(this);
    this.handleSubmitContract = this.handleSubmitContract.bind(this);
    this.handlecaptureFile = this.handlecaptureFile.bind(this);
    this.handleTokenChange = this.handleTokenChange.bind(this);
    this.handleEncryptChange = this.handleEncryptChange.bind(this);
    this.handleActivateNowChange = this.handleActivateNowChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleChangeDescription = this.handleChangeDescription.bind(this);

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
    fetch(this.state.baseURL+"/category/?limit=1000&platform__in=categoryPlatform")
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

  getInitialData(){
    window.loaded = true;
    if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
      // Use Mist/MetaMask's provider
      console.log("Successfully connected to MetaMask")

      web3.setProvider(window.web3.currentProvider);

      web3.version.getNetwork((err, netId) => {

        if (netId === "1"){
          this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v1),
                         UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.mainNet.userCommentsAddress),
                         selectedNetwork: netId,
                        baseURL: json.url.mainNet});
        } else if (netId ===  "4"){
          this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v1),
                         UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.rinkeby.userCommentsAddress),
                         selectedNetwork: netId,
                       baseURL: json.url.rinkeby});
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
    var name = evt.target.contact_name.value;
    var title = evt.target.contract_title.value;
    var oldDeadline = evt.target.bounty_deadline.value;
    var fulfillmentAmount = evt.target.fulfillmentAmount.value;
    var tokenAddress = "0x0000000000000000000000000000000000000000";
    var difficulty = evt.target.difficulty.value;
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
              difficulty: difficulty,
              issuer: {
                address: this.state.accounts[0],
                email: info,
                name: name

              },
              funders: [{
                address: this.state.accounts[0],
                email: info,
                name: name
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
                difficulty: difficulty,
                issuer: {
                  address: this.state.accounts[0],
                  email: info,
                  name: name
                },
                funders: [{
                  address: this.state.accounts[0],
                  email: info,
                  name: name
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
  handleChangeDescription(evt){
    console.log('change', evt.target.value);
    this.setState({description: evt.target.value});
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

          <Navigation userAddress={this.state.accounts[0] || ""}/>
            <div style={{display: "block", maxWidth: "1050px", margin: "0 auto", marginBottom: "75px", marginTop: "30px"}}>
            <div style={{ padding: "15px", width: "calc(100% - 90px)", marginRight: "30px", marginLeft: "30px", backgroundColor: "rgb(249,249,249)", border: "0px", borderBottom: "0px solid #4a79fa", color:"#1D1749"}} className="ContractCard">
              <h3 style={{fontFamily: "Open Sans", margin: "15px", textAlign: "Center",width: "1000px", fontWeight: "600", fontSize: "28px"}}>Create a New Bounty</h3>
              <form className='AddProject' onSubmit={this.handleSubmitContract} style={{padding: "15px", color: "#1D1749"}}>
                <label style={{fontSize: "12px", display: "block"}} htmlFor='contract_title'>Title</label>
                <input id='contract_title' style={{border: "none", width: "calc(100% - 15px)"}} className='SendAmount' type='text' />
                {this.state.titleError &&
                  <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.titleError}</p>}

                  <div style={{display: "inline-block", width: "100%", borderBottom: "1px solid rgba(45, 8, 116, 0.3)", marginBottom: "15px", paddingBottom: "25px"}}>
                    <div style={{width: "calc(50% - 28px)", float: "left", marginRight: "15px", display: "inline-block"}}>
                    <label style={{fontSize: "12px", display: "block"}} htmlFor='contract_description'>Description</label>
                    <textarea value={this.state.description} rows="17" id='contract_description' className='SendAmount ' type='text'  style={{width: "100%", marginBottom: "15px", fontSize: "12px", padding: "10px", border: "0px"}} onChange={this.handleChangeDescription}/>
                    {this.state.descriptionError &&
                      <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.descriptionError}</p>}
                    </div>
                    <div style={{width: "calc(50% - 12px)", marginLeft: "25px", float: "left", display: "inline-block"}}>
                    <label style={{fontSize: "12px", display: "block"}} htmlFor='contract_description'>Markdown Preview</label>

                    <div style={{backgroundColor: "rgba(238, 238, 238,0.5)", overflow: "hidden", padding: "0px 15px"}}>
                    <ReactMarkdown source={this.state.description}/>
                    </div>
                    </div>
                  </div>
                  <div style={{display: "inline-block", width: "100%"}}>
                    <div style={{width: "calc(50% - 28px)", float: "left", marginRight: "15px", display: "inline-block"}}>
                      <label style={{fontSize: "12px"}} htmlFor='contact_info'>Contact Name</label>
                      <input id="contact_name" style={{width: "100%", border: "none"}}></input>
                    </div>
                    <div style={{width: "calc(50% - 28px)", marginLeft: "25px", float: "left", display: "inline-block"}}>
                      <label style={{fontSize: "12px"}} htmlFor='contact_info'>Contact Email</label>
                      <input id="contact_info" style={{width: "100%", border: "none"}}></input>
                      <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "-10px", marginBottom: "15px"}}>for bounty hunters to be able to contact you off-chain</p>
                      {this.state.contactError &&
                        <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.contactError}</p>}
                    </div>
                  </div>
                <div style={{display: "inline-block", width: "100%"}}>
                  <div style={{width: "calc(50% - 13px)",  float: "left", display: "inline-block"}}>
                    <label style={{fontSize: "12px"}} >Payout Method</label>
                    <select onChange={this.handleTokenChange} defaultValue="ERC" style={{fontSize: "16px", backgroundColor: "rgba(255, 255, 255, 0)", border:"1px solid #1D1749", color:  "#1D1749", width: "100%", height: "40px", display: "block"}}>
                      <option value="ETH">ETH</option>
                      <option value="ERC">ERC20 Token </option>
                    </select>
                    <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "10px", marginBottom: "15px"}}>the token which will be used to pay out the reward</p>

                  </div>
                  <div style={{width: "calc(50% - 28px)", marginLeft: "25px", float: "left", display: "inline-block"}}>
                    <label style={{fontSize: "12px"}} htmlFor='contact_info'>Payout Amount (TACO tokens)</label>
                    <input id="fulfillmentAmount" style={{width: "100%", border: "0px"}} type="number" step="any"></input>
                    <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "-10px", marginBottom: "15px"}}>the reward amount for completing the task</p>
                    {this.state.fulfillmentError &&
                      <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.fulfillmentError}</p>}
                  </div>
                </div>
                {this.state.payoutMethod === "ERC" && (
                  <div style={{float: "left", display: "inline-block", width: "100%"}}>
                    <label style={{fontSize: "12px", textAlign: "left", display: "block"}} htmlFor='token_address'>Token Address</label>
                    <input defaultValue="0x22e5f4936629988e328323962fc9c6c0e2a65145" id='token_address' style={{border: "none", width: "calc(100% - 15px)"}} className='SendAmount' type='text'/>
                    <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "-10px", marginBottom: "15px"}}>the address of the token you plan to use</p>
                  </div>
                )}
                <div style={{display: "inline-block", width: "100%"}}>
                <div style={{width: "calc(50% - 13px)", float: "left", display: "inline-block"}} className={"LightMode"}>
                  <label style={{fontSize: "12px"}} >Bounty Category</label>
                  <Select.Creatable multi simpleValue disabled={this.state.disabled} value={this.state.value} placeholder="Select task categories" options={this.state.categoryOptions} onChange={this.handleSelectChange} />
                  <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "5px", marginBottom: "15px"}}>the types of tasks being bountied</p>
                </div>

                  <div style={{width: "calc(50% - 28px)", marginLeft: "25px", float: "left", display: "inline-block"}}>
                    <label style={{fontSize: "12px"}} htmlFor='bounty_deadline'>Bounty Deadline (UTC)</label>
                    <input id='bounty_deadline' style={{border: "none", width: "100%"}} type='datetime-local' max="2222-12-22T22:22"/>
                    <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "-10px", marginBottom: "15px"}}>the deadline for submitting any bugs</p>
                    {this.state.deadlineError &&
                      <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.deadlineError}</p>}
                  </div>
                </div>
                <div style={{display: "inline-block", width: "100%"}}>
                  <div style={{width: "calc(50% - 13px)",  float: "left", display: "inline-block", marginBottom: "30px"}}>
                    <label style={{fontSize: "12px"}} >Difficulty</label>
                    <select id="difficulty" style={{fontSize: "16px", backgroundColor: "rgba(255, 255, 255, 0)", border:"1px solid #1D1749", color:  "#1D1749", width: "100%", height: "40px", display: "block"}}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>
                <div style={{display: "inline-block", width: "100%"}}>

                <div style={{width: "calc(50% - 13px)", float: "left", display: "inline-block"}}>
                  <label style={{fontSize: "12px"}} >When to Activate</label>
                  <select defaultValue="now" onChange={this.handleActivateNowChange} style={{fontSize: "16px", backgroundColor: "rgba(255, 255, 255, 0)", border:"1px solid rgb(25, 55, 83)", color: "rgb(25, 55, 83)", width: "100%", height: "40px", display: "block"}}>
                    <option value="later">Later</option>
                    <option value="now">Now</option>
                  </select>
                  <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "10px", marginBottom: "15px"}}>A bounty may only be edited while it is in the draft stage</p>
                </div>

                  {this.state.activateNow === "now" && (
                    <div style={{width: "calc(50% - 28px)", marginLeft: "25px", float: "left", display: "inline-block"}}>
                      <label style={{fontSize: "12px", textAlign: "left", display: "block"}} htmlFor='token_address'>Deposit Amount</label>
                      <input id='deposit_amount' style={{border: "none", width: "100%"}} className='SendAmount' type='number' step="any"/>
                      <p style={{fontSize: "12px", color: "rgba(25, 55, 83,0.5)", marginTop: "-10px", marginBottom: "15px"}}>To activate, you must deposit enough to pay the bounty at least once</p>
                      {this.state.valueError &&
                        <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.valueError}</p>}
                    </div>
                  )}

                </div>

                <div style={{display: "inline-block", width: "100%"}}>

                  <div style={{width: "calc(50% - 13px)", float: "left", display: "inline-block"}}>
                    <label style={{fontSize: "12px"}} htmlFor='contract_code'>Associated Files</label>
                    <input id='contract_code' type="file" name="file" onChange={this.handlecaptureFile} style={{width: "0px", display: "block", border: "0px", color: "rgb(25, 55, 83)", height: "0px", padding: "0px", margin: "0px"}}/>
                    <div style={{width: "calc(100% - 15px)", display: "block", border: "1px solid rgb(25, 55, 83)", color: "rgb(25, 55, 83)", height: "20px", padding: "7.5px", paddingTop: "6px", paddingLeft: "4px", borderRadius: "4px"}}>
                      <label htmlFor="contract_code" style={{backgroundColor: "white", color: "#122134", padding: "3px 15px", fontWeight: "700", borderRadius: "4px", marginTop: "-1px"}}> Upload </label>
                      {
                        (this.state.didUploadFile && !this.state.fileUploadFinished)&&
                        <div style={{ float: "right", display: "inline-block", padding: "0px 15px 0px 5px", overflow: "hidden"}}>
                          <Halogen.ClipLoader color={"#4a79fa"} size={"15px"} style={{float: "right", width: "15px", height: "15px", display: "inline-block"}}/>
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
                  <div style={{width: "calc(50% - 28px)", marginLeft: "25px", float: "left", display: "inline-block"}}>
                    <label style={{fontSize: "12px", textAlign: "left", display: "block"}} htmlFor='token_address'>Web Link</label>
                    <input id='github_link' style={{border: "none", width: "100%"}} className='SendAmount' type='text'/>
                  </div>
                </div>

                {this.state.submitting &&
                  <div style={{width: "50%", display: "block", margin: "0 auto", marginTop: "30px"}}>
                  <p style={{fontSize: "14px", textAlign: "center"}}> {this.state.loadingString} </p>

                    <LinearProgress mode="determinate" value={this.state.loadingAmount} color="rgb(255, 222, 70)"/>
                    </div>
                }
                <button type='submit' className='AddBtn' style={{backgroundColor: "rgb(52, 74, 212)", border:"0px", width: "200px", margin: "0 auto", color: "white", display: "block", marginTop: "30px", fontWeight: "600"}}>CREATE</button>
              </form>
            </div>
            <p style={{textAlign: "center", display: "block", fontSize: "10px", padding: "15px 0px", color: "#2D0874", width: "100%", position: "absolute", bottom: "0px"}}>&copy; Bounties Network, a <a href="https://ConsenSys.net" target="_blank" style={{textDecoration: "none", color: "#2D0874"}}>ConsenSys</a> Formation <br/>
              <a href="/privacyPolicy/" target="_blank" style={{color: "#2D0874"}}>Privacy Policy</a>{" | "}<a href="/terms/" target="_blank" style={{color: "#2D0874"}}>Terms of Service</a>
             </p>
        </div>
        </div>
      </div>
    )
  }
}

export default NewBounty
