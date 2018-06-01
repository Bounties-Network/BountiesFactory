import React, { Component } from 'react'
import './BountyPage.css'

const json = require('../../../contracts.json');

import { Link } from 'react-router';

const Buffer = require('buffer/').Buffer;

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));

const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const BigNumber = require('bignumber.js');

const moment = require('moment');

import logo from '../AppContainer/images/logo.svg';
import logoBounties from '../AppContainer/images/logo-bounties.svg';

import LinearProgress from 'material-ui/LinearProgress';

import Navigation from 'components/Navigation/Navigation';

const ReactMarkdown = require('react-markdown')


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
import SvgDown from 'material-ui/svg-icons/content/add';
import SvgUp from 'material-ui/svg-icons/content/remove';
import SvgTwitter from 'material-ui-community-icons/icons/twitter';
import SvgFacebook from 'material-ui-community-icons/icons/facebook';
import SvgReddit from 'material-ui-community-icons/icons/reddit';
import SvgCheck from 'material-ui/svg-icons/action/check-circle';

import Dialog from 'material-ui/Dialog';

import {Tabs, Tab} from 'material-ui/Tabs';

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

    this.state = {
      modalError: "",
      accounts: [],
      fulfillments: [],
      bounties: [],
      loadingBounty: true,
      loadingFulfillments: true,
      modalOpen: false,
      comments: [],
      sourceFileName: "",
      sourceFileHash: "",
      sourceDirectoryHash: "",
      bountyData: {
        title: "",
        sourceFileName: "",
        sourceFileHash: "",
        description: "",
        categories: []},
      value: 0,
      stage: "",
      mine: false,
      issuer: "0x0",
      balance: 0,
      decimals: 0,
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
      StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v1),
      UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.mainNet.userCommentsAddress),
      version: this.props.params.version,
      baseURL: json.url.mainNet,
      bountyError: false
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

    this.handleClose = this.handleClose.bind(this);

    this.getBounty = this.getBounty.bind(this);
    this.getCategories = this.getCategories.bind(this);
  }
  componentDidMount() {

    if (window.loaded){
      this.getInitialData();
    } else {
      window.addEventListener('load', this.getInitialData);
    }
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
    const buffer = Buffer.from(reader.result);
    console.log("about to save...", buffer, reader);

    ipfsNew.add([{path: "/bounties/" + this.state.editSourceFileName, content: buffer}], (err, response)=> {
      console.log("response", response);
      this.setState({editSourceDirectoryHash: response[1].hash, editFileUploadFinished: true});
    });


  }

  getInitialData(){
    window.loaded = true;

    if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
      // Use Mist/MetaMask's provider
      web3.setProvider(window.web3.currentProvider);

      web3.version.getNetwork((err, netId) => {
        if (netId === "1"){
          this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v1),
                         UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.mainNet.userCommentsAddress),
                         selectedNetwork: netId,
                        baseURL: json.url.mainNet});

        } else if (netId === "4"){
          if (this.state.version == "v0"){
            this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v0),
                           UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.rinkeby.userCommentsAddress),
                           selectedNetwork: netId,
                          baseURL: json.url.rinkeby});
          } else if (this.state.version == "v1"){
            this.setState({StandardBounties : web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v1),
                           UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.rinkeby.userCommentsAddress),
                           selectedNetwork: netId,
                          baseURL: json.url.rinkeby});
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


            var account = accs[0];
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
    fetch(this.state.baseURL+"/category/?limit=1000&platform__in=" + json.categoryPlatform)
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

        if (json.count > 0){

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
            bountyStage = "Dead";
          } else if (newBounty.bountyStage == "3"){
            bountyStage = "Completed";
          } else if (newBounty.bountyStage == "4"){
            bountyStage = "Expired";
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
                        categories: newBounty.categories,
                        symbol: newBounty.tokenSymbol,
                        mine: (newBounty.issuer === this.state.accounts[0]),
                        loadingBounty: false,
                        platform: newBounty.platform,
                        usdValue: newBounty.usd_price,
                        webLink: newBounty.webReferenceURL,
                        decimals: decimals,
                        optionsValue: newBounty.data_categories? newBounty.data_categories.join(",").toLowerCase() : ""});
        } else {
          console.log("no bounty");

          this.setState({loadingBounty: false, bountyError: true});
        }




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
          var newDate;
          var max = new BigNumber(8640000000000000);
          if ((succ[5].times(1000)).greaterThan(max)){
            newDate = new Date(parseInt(max, 10));
          } else {
            newDate = new Date(parseInt(succ[5], 10)*1000);
          }

          ipfs.catJSON(succ[0], (err, result)=> {
            comments.push({title: result.title,
                          from: from,
                          to: to,
                          aboutBounty: aboutBounty,
                          bountyId: parseInt(bountyId, 10),
                          description: result.description,
                          date: newDate.toUTCString(),
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
      var name = evt.target.name.value;
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
              address: this.state.accounts[0],
              name: name
            }
          },
          meta: {
            platform: 'hiring',
            schemaVersion: '0.1',
            schemaName: 'hiringSchema'
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
          <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "#4a79fa"}} inkBarStyle={{backgroundColor: "#fe923b", color: "#4a79fa"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
            <Tab label="Activate Bounty" value={0} style={{color: this.state.tabValue === 0? ("#2D0874") : "#4a79fa"}}>
              <ActivateForm onhandleActivate={this.handleActivate} tokenDetails={this.state.tokenDetails} amount={this.state.value}/>
            </Tab>
            <Tab label="Edit Bounty" value={1} style={{color: this.state.tabValue === 1? ("#2D0874") : "#4a79fa"}}>
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
            <Tab label="Change Deadline" value={2} style={{color: this.state.tabValue === 2? ("#2D0874") : "#4a79fa"}}>
              <ChangeDeadlineForm onhandleChangeDeadline={this.handleChangeDeadline} deadlineError={this.state.deadlineError} />
            </Tab>
            <Tab label="Transfer Ownership" value={3} style={{color: this.state.tabValue === 3? ("#2D0874") : "#4a79fa"}}>
              <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
            </Tab>
            <Tab label="Change Prize" value={4} style={{color: this.state.tabValue === 4? ("#2D0874") : "#4a79fa"}}>
              <ChangePayoutForm onhandleChange={this.handleChangePayout} changePayoutError={this.state.changePayoutError} symbol={this.state.symbol}/>
            </Tab>
          </Tabs>
          </div>
        );
      }  else if (this.state.stage === "Active"){

        actions = (
          <div style={{width: "100%"}}>
          <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "#4a79fa"}} inkBarStyle={{backgroundColor: "#fe923b", color: "#4a79fa"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
            <Tab label="Extend Bounty Deadline" value={0} style={{color: this.state.tabValue === 0?("#2D0874") : "#4a79fa"}}>
              <ExtendDeadlineForm onhandleDeadline={this.handleDeadline} deadlineError={this.state.deadlineError} />
            </Tab>
            <Tab label="Increase Prize" value={3} style={{color: this.state.tabValue === 3? ("#2D0874") : "#4a79fa"}}>
              <IncreasePayoutForm onhandleIncrease={this.handleIncreasePayout} increasePayoutError={this.state.increasePayoutError} symbol={this.state.symbol}/>
            </Tab>
            <Tab label="Kill Bounty" value={1} style={{color: this.state.tabValue === 1? ("#2D0874") : "#4a79fa"}}>
              <KillBountyForm onhandleKill={this.handleKill} />
            </Tab>
            <Tab label="Transfer Ownership" value={2} style={{color: this.state.tabValue === 2? ("#2D0874") : "#4a79fa"}}>
              <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
            </Tab>
          </Tabs>
          </div>
        );
      } else if (this.state.stage === "Dead"){
         actions=(
           <div style={{width: "100%"}}>
           <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "#4a79fa"}} inkBarStyle={{backgroundColor: "#fe923b", color: "#4a79fa"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
             <Tab label="Re-activate Bounty" value={0} style={{color: this.state.tabValue === 0? ("#2D0874") : "#4a79fa"}}>
               <ActivateForm onhandleActivate={this.handleActivate} tokenDetails={this.state.tokenDetails} amount={this.state.value}/>
             </Tab>
             <Tab label="Extend Bounty Deadline" value={1} style={{color: this.state.tabValue === 1?("#2D0874") : "#4a79fa"}}>
               <ExtendDeadlineForm onhandleDeadline={this.handleDeadline} deadlineError={this.state.deadlineError}/>
             </Tab>
             <Tab label="Transfer Ownership" value={2} style={{color: this.state.tabValue === 2? ("#2D0874") : "#4a79fa"}}>
               <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
             </Tab>
             <Tab label="Increase Prize" value={3} style={{color: this.state.tabValue === 3? ("#2D0874") : "#4a79fa"}}>
               <IncreasePayoutForm onhandleIncrease={this.handleIncreasePayout} increasePayoutError={this.state.increasePayoutError} symbol={this.state.symbol}/>
             </Tab>
           </Tabs>
           </div>
        );
      } else if (this.state.stage === "Completed"){
        actions = (
          <div style={{width: "100%"}}>
          <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "#4a79fa"}} inkBarStyle={{backgroundColor: "#fe923b", color: "#4a79fa"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
            <Tab label="Extend Bounty Deadline" value={0} style={{color: this.state.tabValue === 0?("#2D0874") : "#4a79fa"}}>
              <ExtendDeadlineForm onhandleDeadline={this.handleDeadline} deadlineError={this.state.deadlineError} />
            </Tab>
            <Tab label="Increase Prize" value={3} style={{color: this.state.tabValue === 3? ("#2D0874") : "#4a79fa"}}>
              <IncreasePayoutForm onhandleIncrease={this.handleIncreasePayout} increasePayoutError={this.state.increasePayoutError} symbol={this.state.symbol}/>
            </Tab>
            <Tab label="Kill Bounty" value={1} style={{color: this.state.tabValue === 1? ("#2D0874") : "#4a79fa"}}>
              <KillBountyForm onhandleKill={this.handleKill} />
            </Tab>
            <Tab label="Transfer Ownership" value={2} style={{color: this.state.tabValue === 2? ("#2D0874") : "#4a79fa"}}>
              <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
            </Tab>
          </Tabs>
          </div>
        );
      } else if (this.state.stage === "Expired"){
        actions = (
          <div style={{width: "100%"}}>
          <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "#4a79fa"}} inkBarStyle={{backgroundColor: "#fe923b", color: "#4a79fa"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
            <Tab label="Extend Bounty Deadline" value={0} style={{color: this.state.tabValue === 0?("#2D0874") : "#4a79fa"}}>
              <ExtendDeadlineForm onhandleDeadline={this.handleDeadline} deadlineError={this.state.deadlineError} />
            </Tab>
            <Tab label="Increase Prize" value={3} style={{color: this.state.tabValue === 3? ("#2D0874") : "#4a79fa"}}>
              <IncreasePayoutForm onhandleIncrease={this.handleIncreasePayout} increasePayoutError={this.state.increasePayoutError} symbol={this.state.symbol}/>
            </Tab>
            <Tab label="Kill Bounty" value={1} style={{color: this.state.tabValue === 1? ("#2D0874") : "#4a79fa"}}>
              <KillBountyForm onhandleKill={this.handleKill} />
            </Tab>
            <Tab label="Transfer Ownership" value={2} style={{color: this.state.tabValue === 2? ("#2D0874") : "#4a79fa"}}>
              <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
            </Tab>
          </Tabs>
          </div>
        );

      }

    }
      var categories = [];
      if (this.state.categories){
        for (i = 0; i < this.state.categories.length; i++){

          categories.push(
            <Chip style={{margin: "0px 15px 5px 0px", float: "left", border: "1px solid #2D0874", backgroundColor: "#2D0874", height: "30px"}}
                  labelStyle={{color: "white", lineHeight: "28px"}}
                  key={this.state.categories[i].name}>
              {this.state.categories[i].name}
            </Chip>
          );
        }
      }
    var commentsArray = [];
    var comments;
    for (i = 0; i < this.state.myComments.length; i++){
      commentsArray.push(
        <div style={{display: "block", borderBottom: "0px solid #4a79fa", marginBottom: "15px", overflow: "hidden"}} key={"comment: "+i}>
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
              <p style={{ fontSize: "12px", margin: "4px  0px 4px 10px", display: "inline-block", float: "left"}}><Link style={{color: "#4a79fa"}} target={"_blank"} to={"/user/"+ this.state.myComments[i].from}>{this.state.myComments[i].from}</Link></p>
          </div>
        </div>
      );
    }
    comments = (
      <div style={{paddingTop: "30px", display: "block",  minHeight: "66vh"}}>
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
                <p style={{ fontSize: "10px", margin: "4px  0px 4px 10px", display: "inline-block", float: "left"}}><Link style={{color: "#4a79fa"}} to={"/user/"+ this.state.fulfillments[i].comments[j].from}>{this.state.fulfillments[i].comments[j].from}</Link></p>
              </div>
            );
          }
        }

        fulfillments.push(
          <div style={{display: "block", borderLeft:"1px solid rgb(25, 55, 83)", marginBottom: "15px", overflow: "hidden"}} key={this.state.fulfillments[i].fulfiller+i}>

            <div style={{backgroundColor: "rgb(249, 249, 249)", color: "rgb(25, 55, 83)"}}>
              <div style={{display: "block", overflow: "hidden", padding: "15px", position: "relative"}}>
                <div style={{width: "calc(100% - 100px)", display: "inline-block", float: "left", overflow: "hidden", textOverflow: "ellipsis"}}>
                  <p style={{ fontSize: "14px", margin: "4px  10px 2.5px 0px", display: "inline-block", float: "left"}}><b style={{color:"#fe923b"}}>Bounty Hunter: </b></p>
                  <Blockies
                  seed={this.state.fulfillments[i].fulfiller}
                  size={9}
                  scale={2.5}
                  style={{borderRadius: "10px", display: "inline-block", float: "left"}}
                  />
                  <p style={{ fontSize: "14px", margin: "4px  10px 2.5px 10px", display: "inline-block", float: "left"}}><Link style={{color: "#4a79fa"}} target={"_blank"} to={"/user/"+ this.state.fulfillments[i].fulfiller}>{this.state.fulfillments[i].fulfiller}</Link></p>
                  {this.state.fulfillments[i].fulfiller_email &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px", display: "block", overflow: "hidden"}}><b style={{color: "#fe923b"}}>Contact: </b> <a href={"mailto:"+this.state.fulfillments[i].fulfiller_email} >{this.state.fulfillments[i].fulfiller_email} </a></p>}
                  {this.state.fulfillments[i].sourceDirectoryHash &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px", display: "block", overflow: "hidden"}}><b style={{color: "#fe923b"}}>Associated File: </b> <Link style={{color: "#4a79fa"}} target={"_blank"} to={"https://ipfs.infura.io/ipfs/" + this.state.fulfillments[i].sourceDirectoryHash+"/"+this.state.fulfillments[i].sourceFileName}> {this.state.fulfillments[i].sourceFileName} </Link> </p>}

                  <p style={{ fontSize: "14px", width: "100%", margin: "2.5px 0px", color:"#fe923b", display: "block", overflow: "hidden"}}><b>Submission</b>:</p>
                  <Text style={{ fontSize: "14px", width: "100%", margin: "0px 10px 10px 0px", color: "#fe923b", textDecoration: "none", display: "block", overflow: "hidden"}}>{this.state.fulfillments[i].description}</Text>
                </div>
                <div style={{width: "85px", display: "inline-block", float: "right"}}>
                <Chip style={{float: "right", border: "1px solid #2D0874", backgroundColor:"#2D0874", height: "30px", margin: "5px auto"}}
                      labelStyle={{color: this.state.fulfillments[i].accepted? "#6dFFFF" : "#ffb815", fontSize: "14px", marginTop: "-2px"}}
                      key={this.state.fulfillments[i].accepted? "Accepted" : "Not Accepted"}>
                      {this.state.fulfillments[i].accepted? "Accepted" : "Not Accepted"}
                </Chip>
                  {this.state.stage === "Active" && !this.state.fulfillments[i].accepted && this.state.accounts && this.state.accounts[0] === this.state.issuer &&
                  <FlatButton style={{backgroundColor: "#4A79FA", border:"0px", color: "#152639", float: "right",  margin: "10px", display: "block"}} onClick={this.handleAccept.bind(this,this.state.fulfillments[i].fulfillment_id)}> Accept </FlatButton>}

                </div>
                {this.state.fulfillments[i].commentsOpen &&
                  <form className='Contribute' onSubmit={this.handleCommentOnFulfillment} style={{width: "calc(100% - 15px)", display: "inline-block", paddingTop: "15px"}}>

                    <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "5px", textAlign: "center", fontSize: "16px"}}>Comment on Submission</h4>
                    <input id="comment_index" value={i} style={{display: "none"}}></input>

                    <label htmlFor='comment_description' style={{fontSize: "12px", display: "block", marginTop: "15px"}}>Comment</label>
                    <textarea id='comment_description' cols="60" rows="3" className='ContractCode' type='text' style={{width: "100%", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}></textarea>
                    {this.state.fulfillments[i].commentError &&
                      <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "10px", textAlign: "center"}}>{this.state.fulfillments[i].commentError}</p>}
                    <button type='submit'  className='AddBtn' style={{backgroundColor: "#4a79fa", border:"0px", color: "rgb(21, 38, 57)",  display: "block", padding: "10px 16px", margin: "0 auto", marginTop: "15px", fontSize: "1em", width: "200px", fontWeight: "700"}}>COMMENT</button>
                  </form>

                }
              </div>

            </div>
          </div>
        );
        numPushed++;

      }
      fulBody = (
        <div style={{width: "100%", marginTop: "15px", display: "block", marginBottom: "30px", paddingBottom: "30px", minHeight: "90vh"}}>
          {(this.state.stage === "Active" && !this.state.mine) && (this.state.platform === "gitcoin") &&
            <a target="_blank" href={"https://gitcoin.co/issue/fulfill?sb_id="+this.state.bountyId} style={{width: "100%", marginTop: "15px", position: "relative", cursor: "pointer", textDecoration: "none"}}>
            <div style={{position: "relative", display: "block", width: "100%"}}>
            <SvgDown onClick={this.handleToggleFulfillment} style={{position: "absolute", right: "15px", top: "28px", width: "40px", height: "40px", color: "#f01574", marginTop: "-7px", cursor: "pointer", marginBottom: ""}}/>
              <button type='submit' className='AddBtn' style={{backgroundColor: "#0d023b", cursor: "pointer", paddingTop: "30px", paddingBottom: "30px", border:"0px", width: "100%", margin: "0 auto", marginBottom: "15px", color: "white", display: "block", fontWeight: "600"}}>
                <a style={{color: "#4aeaa7", fontWeight: "600", textDecoration: "none", fontSize: "18px"}} > FULFILL BOUNTY ON GITCOIN</a>
              </button>
              </div>
            </a>
          }
          {(this.state.stage === "Active" && !this.state.mine) && (this.state.platform !== "gitcoin") &&
            <div style={{backgroundColor: "rgb(249, 249, 249)", display: "block", overflow: "hidden", marginBottom: "30px"}}>
              <div style={{width: "calc(100% - 60px)", marginTop: "15px", marginLeft: "15px", marginRight: "15px", position: "relative", padding: "15px"}}>
                {!this.state.fulfillmentOpen? <SvgDown onClick={this.handleToggleFulfillment} style={{position: "absolute", right: "15px", top: "15px", width: "40px", height: "40px", color: "#4A79FA", marginTop: "-7px", cursor: "pointer"}}/>
              : <SvgUp onClick={this.handleToggleFulfillment} style={{position: "absolute", right: "15px", top: "15px", width: "40px", height: "40px", color: "#4A79FA", marginTop: "-7px", cursor: "pointer"}}/>}
                <h3 onClick={this.handleToggleFulfillment} style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center", cursor: "pointer",  fontWeight: "600", color: "rgb(25, 55, 83)"}}>Fulfill the Bounty</h3>
                {this.state.fulfillmentOpen &&

                  <div style={{paddingBottom: "0px"}}>
                    <form className='Fulfill' onSubmit={this.handleFulfill} style={{overflow: "hidden", color: "rgb(25, 55, 83)"}}>
                      <div style={{width: "calc(50% - 15px)", display: "block", overflow: "hidden", float: "left", marginRight: "15px"}}>
                      <label htmlFor='name' style={{fontSize: "12px"}}>Contact Name</label>
                      <input id='name' className='SendAmount' style={{width: "100%", border: "0px", display: "block"}}/>
                      </div>
                      <div style={{width: "calc(50% - 15px)", display: "block", overflow: "hidden", float: "left", marginLeft: "15px"}}>
                      <label htmlFor='contact' style={{fontSize: "12px"}}>Contact Email</label>
                      <input id='contact' className='SendAmount' style={{width: "100%", border: "0px", display: "block"}}/>
                      </div>

                        <div style={{width: "calc(50% - 23px)", display: "block", overflow: "hidden", float: "left", marginRight: "15px"}}>
                          <label style={{fontSize: "12px"}} htmlFor='contract_code'>Associated Files</label>
                          <input id='contract_code' type="file" name="file" onChange={this.handlecaptureFile} style={{width: "0px", display: "block", border: "0px", color: "rgb(25, 55, 83)", height: "0px", padding: "0px", margin: "0px"}}/>
                          <div style={{width: "100%", display: "block", border: "0px", color: "white", height: "20px", padding: "7.5px", paddingTop: "6px", paddingLeft: "0px", borderRadius: "4px"}}>
                            <label htmlFor="contract_code" style={{backgroundColor: "white", color: "#122134", padding: "3px 15px", fontWeight: "700", borderRadius: "0px", marginTop: "-1px"}}> Upload </label>
                            {
                              (this.state.didUploadFile && !this.state.fileUploadFinished)&&
                              <div style={{ float: "right", display: "inline-block", padding: "0px 15px 0px 5px", overflow: "hidden"}}>
                                <Halogen.ClipLoader color={"#fe923b"} size={"15px"} style={{float: "right", width: "15px", height: "15px", display: "inline-block"}}/>
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
                      <button type='submit'  className='AddBtn' style={{backgroundColor: "#4a79fa", border:"0px", color: "white", display: "block", padding: "15px", margin: "0 auto", marginTop: "30px",marginBottom: "15px", fontSize: "1em", width: "200px", fontWeight: "700"}}>SUBMIT</button>

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
           <p style={{fontSize: "18px", textAlign: "center"}}>To perform this action, you need to use a web3 enabled browser. We suggest using the <a href="https://metamask.io" target="_blank" style={{textDecoration: "none", color: "#4a79fa"}}> MetaMask </a> browser extension.</p>
             </div>
         </Dialog>
        <div id={"colourBodyLight"} style={{minHeight: "100vh", position: "relative"}}>
          <Navigation userAddress={this.state.accounts[0] || ""}/>
          <div style={{ overflow: "hidden", width: "100%", maxWidth: "1050px", margin: "0 auto", paddingBottom: "160px", display: "block"}}>

          {(this.state.loadingFulfillments || this.state.loadingBounty)  &&

            <div style={{width: "40px", margin: "0 auto", marginTop: "60px", overflow: "hidden", marginBottom: "60px"}}>
            <Halogen.ScaleLoader color={"rgb(254, 146, 59)"} />
            </div>
          }
          {!(this.state.loadingFulfillments || this.state.loadingBounty)  && this.state.bountyError &&

            <div style={{marginBottom: "0px", boxShadow: "none", borderRadius: "0", padding: "30px", marginTop: "15px", border: "0", backgroundColor: "rgb(249, 249, 249)", borderBottom: "0px solid #4A79FA", color:"#2D0874", paddingTop: "30px", marginLeft: "15px", marginRight: "15px"}} className="ContractCard">
              <h3 className="bountyHeader" style={{margin: "0px 15px 30px 15px", width: "100%", display: "inline", fontSize: "28px", textAlign: "center",  fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden"}}>{"There's Nothing Here!"}</h3>
              <h4 className="bountyHeader" style={{margin: "0px 15px 30px 15px", width: "100%", display: "inline", fontSize: "22px", textAlign: "center",  fontWeight: "500", textOverflow: "ellipsis", overflow: "hidden"}}>{"Maybe someone sent you here by mistake, but this bounty doesn't exist. It's possible someone sent you this link for a bounty on the "}<b style={{fontWeight: "600"}}>{this.state.selectedNetwork == 1?"Rinkeby Testnet" : "Main Ethereum Network"},</b></h4>
              <h4 className="bountyHeader" style={{margin: "0px 15px 30px 15px", width: "100%", display: "inline", fontSize: "22px", textAlign: "center",  fontWeight: "500", textOverflow: "ellipsis", overflow: "hidden"}}>Try changing your MetaMask network to the {this.state.selectedNetwork == 1?"Rinkeby Network" : "Main Ethereum Network"} instead.</h4>
              <h4 className="bountyHeader" style={{margin: "0px 15px 30px 15px", width: "100%", display: "inline", fontSize: "28px", textAlign: "center",  fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden"}}><Link to="/">Go Home</Link></h4>


            </div>
          }
          {!(this.state.loadingFulfillments || this.state.loadingBounty || this.state.bountyError) &&
            <div >
              <div style={{marginBottom: "0px", boxShadow: "none", borderRadius: "0", padding: "30px", marginTop: "15px", border: "0", backgroundColor: "rgb(249, 249, 249)", borderBottom: "0px solid #4A79FA", color:"#2D0874", paddingTop: "30px", marginLeft: "15px", marginRight: "15px"}} className="ContractCard">
                <h3 className="bountyHeader" style={{margin: "0px 15px 30px 15px", width: "100%", display: "inline", fontSize: "28px", textAlign: "center",  fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden"}}> {this.state.title}</h3>

                <div className="bountyPrice" style={{float: "left", display: "inline-block", width: "200px"}}>
                  <div style={{backgroundColor: "rgba(1, 1, 1, 0.05)", display: "block", overflow: "hidden", padding: "15px"}}>
                  <h5 style={{ fontSize: "13px", width: "100%", textAlign: "center", marginTop: "0px", marginBottom: "0px", color: "#8C9899", fontWeight: "200"}}>PRIZE</h5>

                  <h5 style={{ width: "100%", textAlign: "center", marginTop: "7.5px", marginBottom: "0px", color: "#2D0874", fontSize: "32px", fontWeight: "600"}}>{this.state.value}<b style={{color: "#fe923b", fontWeight: "600", lineHeight: "28px"}}>{this.state.symbol? this.state.symbol : 'ETH'}</b></h5>

                  <h5 style={{textAlign: "center", marginTop: "0px", color: "rgb(25, 55, 83)", marginBottom: "15px", fontSize: "16px", fontWeight: "200"}}><b style={{color: "#fe923b", fontWeight: "500"}}>$</b>{numberWithCommas(parseInt((this.state.usdValue )))}</h5>

                    <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", textAlign: "center", marginBottom: "7.5px", color: "#8C9899"}}>Total Balance: {this.state.balance + " " + this.state.symbol}</p>
                  </div>
                  {this.state.stage !== "Expired" &&
                  <form className='Contribute' onSubmit={this.handleContribute} style={{width: "100%", display: "inline-block", marginTop: "30px"}}>
                    <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center",  fontWeight: "600"}}> Contribute to Bounty</h4>
                    <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>Deposit Amount ({this.state.symbol? this.state.symbol: 'ΞTH'})</label>
                    <input id='deposit_amount' className='SendAmount' type='number'  step="any" style={{width: "182px", border: "0px"}}/>
                    {this.state.contributionError &&
                      <p style={{fontSize: "12px", color: "#fe923b", marginTop: "0px", textAlign: "center"}}>{this.state.contributionError}</p>}
                    <button type='submit' className='AddBtn' style={{backgroundColor: "rgba(0, 126, 255, 0)", border:"1px solid rgb(25, 55, 83)", color: "rgb(25, 55, 83)", width: "200px"}}>Contribute</button>
                    <div style={{margin: "0 auto", display: "block", overflow: "hidden", width: "111px"}}>
                      <Link target="_blank" to={"https://twitter.com/home?status=New Bounty: "+ this.state.title.substring(0,80) + (this.state.title.length > 80? "...":"")+"%20https%3A//beta.bounties.network/bounty/v1/"+this.state.bountyId}>
                      <SvgTwitter style={{width: "15px", height: "15px", color: "#4A79FA", padding: "5px", border: "1px solid rgb(25, 55, 83)", borderRadius: "100px", marginTop: "30px", marginRight: "15px"}}
                                  className="iconHover"/>
                      </Link>
                      <Link target="_blank" to={"https://www.facebook.com/sharer/sharer.php?u=https%3A//beta.bounties.network/bounty/"+this.state.bountyId}>
                      <SvgFacebook style={{width: "15px", height: "15px", color: "#4A79FA", padding: "5px", border: "1px solid rgb(25, 55, 83)", borderRadius: "100px", marginTop: "30px", marginRight: "15px"}}
                                  className="iconHover"/>
                      </Link>
                      <Link target="_blank" to={"http://reddit.com/submit?url=https%3A%2F%2Fbeta.bounties.network%2Fbounty%2F"+this.state.bountyId+"&title="+ this.state.title.substring(0,80) + (this.state.title.length > 80? "...":"")}>
                      <SvgReddit style={{width: "15px", height: "15px", color: "#4A79FA", padding: "5px", border: "1px solid rgb(25, 55, 83)", borderRadius: "100px", marginTop: "30px"}}
                                  className="iconHover"/>
                      </Link>
                    </div>
                  </form>
                  }


                </div>
                <div className="bountyDetails" style={{float: "left", display: "inline-block", width: "calc(100% - 260px)", marginLeft: "30px", marginRight: "30px", overflow: "hidden", textOverflow: "ellipsis"}}>
                  <p style={{ fontSize: "14px", margin: "4px  0px 10px 0px", display: "inline-block", float: "left"}}><b style={{color: "#fe923b"}}>Bounty Issuer: </b></p>
                  <Blockies
                  seed={this.state.issuer}
                  size={9}
                  scale={2.5}
                  style={{borderRadius: "10px", display: "inline-block", float: "left"}}
                  />
                  <p style={{ fontSize: "14px", margin: "4px  0px 10px 0px", display: "inline-block", float: "left"}}><Link style={{color: "#4a78fa"}} to={"/user/"+ this.state.issuer}>{ this.state.issuer}</Link></p>


                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px", display: "block", overflow: "hidden"}}><b style={{color: "#fe923b", marginRight: "10px"}}>Bounty Stage:</b> {this.state.stage}</p>

                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px", display: "block", overflow: "hidden"}}><b style={{color: "#fe923b", marginRight: "10px"}}>Deadline:</b> {this.state.deadlineString}</p>

                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "#fe923b", marginRight: "10px"}}>Contact the bounty issuer:</b> <a href={"mailto:"+this.state.contact} >{ this.state.contact}</a></p>
                  {this.state.webLink &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "#fe923b", marginRight: "10px"}}>Link: </b> <Link style={{color: "#4a79fa"}} target={"_blank"} to={this.state.webLink}> {this.state.webLink} </Link> </p>}

                  {this.state.sourceDirectoryHash &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "#fe923b", marginRight: "10px"}}>Associated File: </b> <Link style={{color: "#4a79fa"}} target={"_blank"} to={"https://ipfs.infura.io/ipfs/" + this.state.sourceDirectoryHash + "/"+ this.state.sourceFileName}> {this.state.sourceFileName} </Link> </p>}
                  {this.state.paysTokens &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "#fe923b", marginRight: "10px"}}>Token Contract:</b> <Link style={{color: "#4a79fa"}} target={"_blank"} to={"https://etherscan.io/address/"+ this.state.tokenAddress}>{this.state.tokenAddress}</Link></p>}
                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 10px 0px"}}><b style={{color: "#fe923b", marginRight: "10px"}}>Description: </b> </p>
                  <ReactMarkdown source={this.state.description} />
                  <div style={{margin: "0 auto", display: "block", overflow: "hidden", marginTop: "15px"}}>
                    {categories}
                  </div>
                </div>
                {actions}
            </div>


            <Tabs tabItemContainerStyle={{backgroundColor: "rgb(249,249,249)", color: "#4A79FA"}}
                  inkBarStyle={{backgroundColor: "#fe923b", color: "#4A79FA"}}
                  style={{backgroundColor: "rgba(0,0,0,0)"}}
                  onChange={this.handleMainTabsChange}
                  value={this.state.mainTabValue}
                  tabTemplate={TabTemplate}
                  style={{
                      flex: '1 1 100%',
                      minHeight: "0",
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: "rgba(0,0,0,0)",
                      width: "calc(100% - 30px)",
                      margin: "0 15px"

                  }}
                  contentContainerStyle={{
                      flex: '1 1 100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflowY: 'auto',
                      height: "fixed"
                  }}>
              <Tab label={numPushed+" Submission"+(numPushed !== 1? "s" : "")} value={0} style={{color: this.state.mainTabValue === 0? "#fff" : "#4A79FA", fontSize: "16px", backgroundColor: this.state.mainTabValue === 0? ("#2D0874"): "rgba(10, 22, 40, 0)"}}>
                {fulBody}
              </Tab>
              <Tab label={this.state.myComments.length+" Comment"+(this.state.myComments.length !== 1? "s" : "")} value={1} style={{color: this.state.mainTabValue === 1? "#fff" : "#4A79FA", fontSize: "16px", backgroundColor: this.state.mainTabValue === 1? ("#2D0874") : "rgba(10, 22, 40, 0)"}}>
                {comments}
              </Tab>
            </Tabs>
          </div>
          }
        </div>
        <p style={{textAlign: "center", display: "block", fontSize: "10px", padding: "15px 0px", color: "#2D0874", width: "100%", position: "absolute", bottom: "0px"}}>&copy; Bounties Network, a <a href="https://ConsenSys.net" target="_blank" style={{textDecoration: "none", color: "#2D0874"}}>ConsenSys</a> Formation <br/>
          <a href="/privacyPolicy/" target="_blank" style={{color: "#2D0874"}}>Privacy Policy</a>{" | "}<a href="/terms/" target="_blank" style={{color: "#2D0874"}}>Terms of Service</a>
         </p>
      </div>
    </div>
    )
  }
}

export default BountyPage
