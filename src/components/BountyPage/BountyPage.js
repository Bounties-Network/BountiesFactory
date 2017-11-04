import React, { Component } from 'react'
import './BountyPage.css'


const json = require('../../../contracts.json');

import injectTapEventPlugin from 'react-tap-event-plugin';

const networkId = json.networkId;

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));

const UserCommentsContract = web3.eth.contract(json.interfaces.UserComments).at(json.UserCommentsAddress);
const StandardBounties = web3.eth.contract(json.interfaces.StandardBounties).at(json.standardBountiesAddress);

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

import Dialog from 'material-ui/Dialog';

import {Tabs, Tab} from 'material-ui/Tabs';

import Avatar from 'material-ui/Avatar';

import Halogen from 'halogen';

const ipfsAPI = require('ipfs-api');




class BountyPage extends Component {
  constructor(props) {
    super(props)
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
        txModalOpen: false,
        txLoadingAmount: 0,
        txLoadingMessage: "",
        editSourceFileName: "",
        editSourceFileHash: "",
        noWeb3Error: false

    }
    this.ipfsApi = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: "https"});

    this.getInitialData = this.getInitialData.bind(this);

    this.handleFulfill = this.handleFulfill.bind(this);
    this.handleActivate = this.handleActivate.bind(this);
    this.handleContribute = this.handleContribute.bind(this);
    this.handleAccept = this.handleAccept.bind(this);
    this.handleDeadline = this.handleDeadline.bind(this);
    this.handleKill = this.handleKill.bind(this);
    this.handleMilestoneChange = this.handleMilestoneChange.bind(this);
    this.handleTransfer = this.handleTransfer.bind(this);
    this.handleComment = this.handleComment.bind(this);
    this.handleIncreasePayout = this.handleIncreasePayout.bind(this);
    this.handlecaptureFile = this.handlecaptureFile.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleTabsChange = this.handleTabsChange.bind(this);
    this.handleCloseTxLoading = this.handleCloseTxLoading.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleCaptureEditFile = this.handleCaptureEditFile.bind(this);
    this.saveToIpfsEdit = this.saveToIpfsEdit.bind(this);
    this.handleCloseNoWeb3 = this.handleCloseNoWeb3.bind(this);

    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
  }
  componentDidMount() {
    injectTapEventPlugin();
    window.addEventListener('load',this.getInitialData);

  }

  handleTabsChange(value){
    this.setState({
      tabValue: value,
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
      if (networkId !== web3.version.network){
        console.log("network", networkId, web3.version.network);
          this.setState({modalError: ("Please change your Ethereum network to the " + json.networkName), modalOpen: true});
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
          StandardBounties.getBounty(this.state.bountyId, (err, succ)=> {
            StandardBounties.getBountyData(this.state.bountyId, (err, data)=> {
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
                    StandardBounties.getBountyToken(this.state.bountyId, (err, address)=> {
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
          StandardBounties.getNumFulfillments(this.state.bountyId, (err, succ)=> {
            var total = parseInt(succ, 10);
            console.log("total", total);
            var fulfillments = [];
            for (var j = 0; j < total; j++){
              StandardBounties.getFulfillment(this.state.bountyId, j, (err, succ)=> {
                ipfs.catJSON(succ[2], (err, result)=> {
                  fulfillments.push({
                    accepted: succ[0],
                    fulfiller: succ[1],
                    data: result,
                  });
                  console.log("got fulfillment", fulfillments);

                  if (fulfillments.length === total){
                    this.setState({fulfillments: fulfillments});
                  }
                });
              });
            }
          });
          StandardBounties.getNumBounties((err, succ) => {
            var total = parseInt(succ,10);
            this.setState({total: total});
          });
          UserCommentsContract.numComments((err, succ)=> {
            var total = parseInt(succ, 10);
            var comments = [];

            console.log("total comments: ", total);
            for (var i = 0; i < total; i++){
              UserCommentsContract.getComment( i, (err, succ)=> {
                var from = succ[1];
                var to = succ[2];
                var aboutBounty = succ[3];
                var bountyId = succ[4];
                var date = new Date(parseInt(succ[5], 10)*1000);
                ipfs.catJSON(succ[0], (err, result)=> {
                  comments.push({title: result.title, from: from, to: to, aboutBounty: aboutBounty, bountyId: bountyId, description: result.description, date: date.toUTCString()});
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
    } else {
      /*
      this.setState({modalError: "You must use MetaMask if you would like to use the Bounties.network dapp", modalOpen: true});
      setInterval(function() {
        if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
          this.getInitialData();
        } else {
          console.log("window", window.web3);
        }
      }, 100);*/
      StandardBounties.getBounty(this.state.bountyId, (err, succ)=> {
        StandardBounties.getBountyData(this.state.bountyId, (err, data)=> {
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
                StandardBounties.getBountyToken(this.state.bountyId, (err, address)=> {
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
      StandardBounties.getNumFulfillments(this.state.bountyId, (err, succ)=> {
        var total = parseInt(succ, 10);
        console.log("total", total);
        var fulfillments = [];
        for (var j = 0; j < total; j++){
          StandardBounties.getFulfillment(this.state.bountyId, j, (err, succ)=> {
            ipfs.catJSON(succ[2], (err, result)=> {
              fulfillments.push({
                accepted: succ[0],
                fulfiller: succ[1],
                data: result,
              });
              console.log("got fulfillment", fulfillments);

              if (fulfillments.length === total){
                this.setState({fulfillments: fulfillments});
              }
            });
          });
        }
      });
      StandardBounties.getNumBounties((err, succ) => {
        var total = parseInt(succ,10);
        this.setState({total: total});
      });
      UserCommentsContract.numComments((err, succ)=> {
        var total = parseInt(succ, 10);
        var comments = [];

        console.log("total comments: ", total);
        for (var i = 0; i < total; i++){
          UserCommentsContract.getComment( i, (err, succ)=> {
            var from = succ[1];
            var to = succ[2];
            var aboutBounty = succ[3];
            var bountyId = succ[4];
            var date = new Date(parseInt(succ[5], 10)*1000);
            ipfs.catJSON(succ[0], (err, result)=> {
              comments.push({title: result.title, from: from, to: to, aboutBounty: aboutBounty, bountyId: bountyId, description: result.description, date: date.toUTCString()});
              if (comments.length === total){
                this.setState({comments: comments});
              }
            });
          });
        }
      });
    }

  }

  handleFulfill(evt){
    evt.preventDefault();
    if (this.state.accounts.length === 0){
      this.setState({noWeb3Error: true});
    } else {
      var data = evt.target.bug_description.value;
      if (data === "" && this.state.sourceFileName === ""){
        this.setState({fulfillmentError: "Empty submissions are not allowed!"});
      } else {
        this.setState({fulfillmentError: ""});
        this.setState({txModalOpen: true, txLoadingAmount: 10});
        this.setState({txLoadingMessage: "Please confirm the Ethereum transaction to fulfill the bounty"});

        ipfs.addJSON({description: data, sourceFileName: this.state.sourceFileName, sourceFileHash: this.state.sourceFileHash}, (err, succ)=> {
          this.setState({txLoadingAmount: 40});

          console.log("about to fulfill", this.state.bountyId, succ);
          StandardBounties.fulfillBounty(this.state.bountyId, succ, {from: this.state.accounts[0]}, (err, succ)=> {
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
          StandardBounties.contribute(this.state.bountyId, num, {from: this.state.accounts[0], value: num}, (err, succ)=> {
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

          console.log("newAmount", StandardBounties.address);

          this.state.contract.tokenContract.approve(StandardBounties.address, parseInt(newAmount, 10), {from: this.state.accounts[0]}, (err, succ)=> {
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
                        StandardBounties.contribute(this.state.bountyId, parseInt(newAmount, 10), {from: this.state.accounts[0]}, (err, succ)=> {
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
        StandardBounties.changeBountyData(this.state.bountyId, result, {from: this.state.accounts[0]}, (err, succ)=> {
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

        StandardBounties.changeBountyData(this.state.bountyId, result, {from: this.state.accounts[0]}, (err, succ)=> {
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
        UserCommentsContract.addComment(succ, 0x0, true, this.state.bountyId, {from: this.state.accounts[0]}, (err, succ)=> {
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
      StandardBounties.activateBounty(this.state.bountyId, num, {from: this.state.accounts[0], value: num}, (err, succ)=> {
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

        this.state.contract.tokenContract.approve(StandardBounties.address, parseInt(newAmount, 10), {from: this.state.accounts[0]}, (err, succ)=> {
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
                      StandardBounties.activateBounty(this.state.bountyId, parseInt(newAmount, 10), {from: this.state.accounts[0]},  (err, succ)=> {
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
        StandardBounties.activateBounty(this.state.bountyId, 0, {from: this.state.accounts[0]}, (err, succ)=> {
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
    StandardBounties.transferIssuer(this.state.bountyId, address, {from: this.state.accounts[0]}, (err, succ)=> {
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
        this.state.contract.tokenContract.approve(StandardBounties.address, parseInt(finalDeposit, 10), {from: this.state.accounts[0]}, (err, succ)=> {
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
                      StandardBounties.increasePayout(this.state.bountyId, finalPayout, finalDeposit, {from: this.state.accounts[0], value: finalDeposit}, (err, succ)=> {
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
        StandardBounties.increasePayout(this.state.bountyId, finalPayout, 0, {from: this.state.accounts[0]}, (err, succ)=> {
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
      StandardBounties.increasePayout(this.state.bountyId, finalPayout, finalDeposit, {from: this.state.accounts[0], value: finalDeposit}, (err, succ)=> {
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
    StandardBounties.extendDeadline(this.state.bountyId, date, {from: this.state.accounts[0]}, (err, succ)=> {
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

    StandardBounties.changeDeadline(this.state.bountyId, date, {from: this.state.accounts[0]}, (err, succ)=> {
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
  StandardBounties.killBounty(this.state.bountyId, {from: this.state.accounts[0]}, (err, succ)=> {
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
  StandardBounties.acceptFulfillment(this.state.bountyId, i, {from: this.state.accounts[0]}, (err, succ)=> {
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
  this.setState({ optionsList: optionsList, selectedValue: value});
  this.forceUpdate();

}
handleCloseNoWeb3(){
  this.setState({noWeb3Error: false});

}


  render() {
    var actions;
    var fulBody;
    console.log("requirements", this.state.contract);
    var fileName;
    if (this.state.sourceFileName.length > 38){
      fileName = this.state.sourceFileName.substring(0,38) + "...";
    } else {
      fileName = this.state.sourceFileName;
    }
    if (this.state.contract.mine){
      if (this.state.contract.stage === "Draft"){
        actions=(
          <div style={{marginTop: "15px", width: "100%"}}>
          <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "rgb(101, 197, 170)"}} inkBarStyle={{backgroundColor: "rgb(255, 222, 70)", color: "rgb(101, 197, 170)"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
            <Tab label="Activate Bounty" value={0} style={{color: this.state.tabValue === 0? "#fff" : "rgb(101, 197, 170)"}}>
              <ActivateForm onhandleActivate={this.handleActivate} tokenDetails={this.state.tokenDetails} amount={this.state.contract.value}/>
            </Tab>
            <Tab label="Edit Bounty" value={1} style={{color: this.state.tabValue === 1? "#fff" : "rgb(101, 197, 170)"}}>
              <EditForm
              onHandleEdit={this.handleEdit}
              bountyData={this.state.contract.bountyData}
              selectedValue={this.state.selectedValue}
              onHandleChangeSelected={this.handleSelectChange}
              onHandleCaptureEditFile={this.handleCaptureEditFile}
              sourceFileName={this.state.editSourceFileName}/>
            </Tab>
            <Tab label="Change Deadline" value={2} style={{color: this.state.tabValue === 2? "#fff" : "rgb(101, 197, 170)"}}>
              <ChangeDeadlineForm onhandleChangeDeadline={this.handleChangeDeadline} deadlineError={this.state.deadlineError}/>
            </Tab>
            <Tab label="Transfer Ownership" value={3} style={{color: this.state.tabValue === 3? "#fff" : "rgb(101, 197, 170)"}}>
              <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
            </Tab>
            <Tab label="Increase Reward" value={4} style={{color: this.state.tabValue === 4? "#fff" : "rgb(101, 197, 170)"}}>
              <IncreasePayoutForm onhandleIncrease={this.handleIncreasePayout} increasePayoutError={this.state.increasePayoutError} symbol={this.state.contract.symbol}/>
            </Tab>
          </Tabs>
          </div>
        );
      }  else if (this.state.contract.stage === "Active"){

        actions = (
          <div style={{marginTop: "15px", width: "100%"}}>
          <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "rgb(101, 197, 170)"}} inkBarStyle={{backgroundColor: "rgb(255, 222, 70)", color: "rgb(101, 197, 170)"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
            <Tab label="Extend Bounty Deadline" value={0} style={{color: this.state.tabValue === 0? "#fff" : "rgb(101, 197, 170)"}}>
              <ExtendDeadlineForm onhandleDeadline={this.handleDeadline} deadlineError={this.state.deadlineError}/>
            </Tab>
            <Tab label="Kill Bounty" value={1} style={{color: this.state.tabValue === 1? "#fff" : "rgb(101, 197, 170)"}}>
              <KillBountyForm onhandleKill={this.handleKill} />
            </Tab>
            <Tab label="Transfer Ownership" value={2} style={{color: this.state.tabValue === 2? "#fff" : "rgb(101, 197, 170)"}}>
              <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
            </Tab>
            <Tab label="Increase Reward" value={3} style={{color: this.state.tabValue === 3? "#fff" : "rgb(101, 197, 170)"}}>
              <IncreasePayoutForm onhandleIncrease={this.handleIncreasePayout} increasePayoutError={this.state.increasePayoutError} symbol={this.state.contract.symbol}/>
            </Tab>
          </Tabs>
          </div>
        );
      } else if (this.state.contract.stage === "Dead"){
         actions=(
           <div style={{marginTop: "15px", width: "100%"}}>
           <Tabs tabItemContainerStyle={{backgroundColor: "rgba(0,0,0,0)", color: "rgb(101, 197, 170)"}} inkBarStyle={{backgroundColor: "rgb(255, 222, 70)", color: "rgb(101, 197, 170)"}} style={{backgroundColor: "rgba(0,0,0,0)"}} onChange={this.handleTabsChange} value={this.state.tabValue}>
             <Tab label="Re-activate Bounty" value={0} style={{color: this.state.tabValue === 0? "#fff" : "rgb(101, 197, 170)"}}>
               <ActivateForm onhandleActivate={this.handleActivate} tokenDetails={this.state.tokenDetails} amount={this.state.contract.value}/>
             </Tab>
             <Tab label="Extend Bounty Deadline" value={1} style={{color: this.state.tabValue === 1? "#fff" : "rgb(101, 197, 170)"}}>
               <ExtendDeadlineForm onhandleDeadline={this.handleDeadline} deadlineError={this.state.deadlineError}/>
             </Tab>
             <Tab label="Transfer Ownership" value={2} style={{color: this.state.tabValue === 2? "#fff" : "rgb(101, 197, 170)"}}>
               <TransferOwnershipForm onhandleTransfer={this.handleTransfer} transferError={this.state.transferError} />
             </Tab>
             <Tab label="Increase Reward" value={3} style={{color: this.state.tabValue === 3? "#fff" : "rgb(101, 197, 170)"}}>
               <IncreasePayoutForm onhandleIncrease={this.handleIncreasePayout} increasePayoutError={this.state.increasePayoutError} symbol={this.state.contract.symbol}/>
             </Tab>
           </Tabs>
           </div>

        );
      }

    } else {

        if (this.state.contract.stage === "Active"){

          actions = (
            <div style={{width: "940px", marginTop: "15px", marginLeft: "15px", marginRight: "15px"}}>
              <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px"}}>Fulfill the Bounty</h3>
              <div style={{paddingBottom: "15px"}}>
                <form className='Fulfill' onSubmit={this.handleFulfill} style={{marginBottom: "15px"}}>
                  <label style={{fontSize: "12px"}} htmlFor='contract_code'>Associated Files</label>
                  <input id='contract_code' type="file" name="file" onChange={this.handlecaptureFile} style={{width: "0px", display: "block", border: "0px", color: "white", height: "0px", padding: "0px", margin: "0px"}}/>
                  <div style={{width: "440px", display: "block", border: "0px", color: "white", height: "20px", padding: "7.5px", paddingTop: "6px", paddingLeft: "0px", borderRadius: "4px"}}>
                    <label htmlFor="contract_code" style={{backgroundColor: "white", color: "#122134", padding: "3px 15px", fontWeight: "700", borderRadius: "0px", marginTop: "-1px"}}> Upload </label>
                    <span style={{float: "right", marginRight: "30px"}}> {fileName} </span>
                  </div>
                  <p style={{fontSize: "12px", color: "rgba(265,265,265, 0.55)", marginTop: "5px"}}>any file associated with your submission</p>
                  <input id='bounty_deadline' type='text' defaultValue={0} style={{width: "0.01px", display: "none"}}/>
                  <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>Submission Description and Comments</label>
                  <textarea id='bug_description' cols="60" rows="5" className='ContractCode' type='text' style={{width: "920px", border: "0px"}}></textarea>
                  {this.state.fulfillmentError &&
                    <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.fulfillmentError}</p>}
                    <button type='submit' className='AddBtn' style={{backgroundColor: "#65C5AA", border:"0px", color: "#152639", width: "200px", margin: "0 auto", display: "block"}}>Submit</button>
                </form>
              </div>
            </div>
          );
        }


    }

    if (this.state.fulfillments.length){
      var numPushed = 0;
      var fulfillments = [];
      for (var i = 0; i < this.state.fulfillments.length; i++){
        console.log("fulfillment", this.state.fulfillments[i]);

        fulfillments.push(
          <div style={{display: "block", borderBottom: "0px solid #65C5AA", marginBottom: "15px", overflow: "hidden"}} key={this.state.fulfillments[i].fulfiller+i}>

            <div style={{backgroundColor: "rgba(10, 22, 40, 0.5)", display: "block", overflow: "hidden", padding: "15px"}}>
              <div style={{width: "68%", display: "inline-block", float: "left"}}>
                <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", }}><b style={{color: "#FFDE46"}}>Bounty Hunter: </b>
                <a style={{color: "#65C5AA"}} target={"_blank"} href={"/user/"+ this.state.fulfillments[i].fulfiller}>{this.state.fulfillments[i].fulfiller}</a></p>
                {this.state.fulfillments[i].data.sourceFileHash &&
                <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px"}}><b style={{color: "#FFDE46"}}>Associated File: </b> <a style={{color: "#65C5AA"}} target={"_blank"} href={"https://ipfs.infura.io/ipfs/" + this.state.fulfillments[i].data.sourceFileHash}> {this.state.fulfillments[i].data.sourceFileName} </a> </p>}
                <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", color: "#FFDE46"}}><b>Submission</b>:</p>
                <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", }}>{this.state.fulfillments[i].data.description}</p>

              </div>
              <div style={{width: "30%", display: "inline-block", float: "left", borderRight: "1px solid #65C5AA", paddingRight: "15px"}}>
                <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", textAlign: "right"}}>{this.state.fulfillments[i].accepted? "Accepted" : "Not Accepted"}</p>
                {this.state.contract.stage === "Active" && !this.state.fulfillments[i].accepted && this.state.accounts && this.state.accounts[0] === this.state.contract.issuer && <FlatButton style={{backgroundColor: "#65C5AA", border:"0px", color: "#152639", float: "right"}} onClick={this.handleAccept.bind(this,i)}> Accept </FlatButton>}

              </div>
            </div>
          </div>
        );
        numPushed++;

      }
      fulBody = (
        <div style={{width: "100%", marginTop: "30px", display: "block", marginBottom: "60px", borderBottom: "1px solid #65C5AA", paddingBottom: "30px"}}>
          <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center"}}>{numPushed} Submission{numPushed !== 1? "s" : ""}</h3>
          {fulfillments}
        </div>
      );
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
            <Chip style={{margin: "0px 5px 5px 0px", float: "left", border: "1px solid rgba(0, 126, 255, 0.24)", backgroundColor: "rgba(0, 126, 255, 0.08)", height: "30px"}}
                  labelStyle={{color: "white", lineHeight: "28px"}}
                  key={this.state.contract.bountyData.categories[i]}>
              <Avatar color="rgb(255, 222, 70)" icon={icon} style={{backgroundColor: "rgba(0, 126, 255, 0.24)", height: "28px", width: "28px"}}/>
              {this.state.contract.bountyData.categories[i]}
            </Chip>
          );
        }
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
    var myComments = [];
    for (i = 0; i < this.state.comments.length; i++){
      if (this.state.comments[i].aboutBounty && this.state.comments[i].bountyId == this.state.bountyId){
        myComments.push(this.state.comments[i]);
      }
    }
    var commentsArray = [];
    var comments;

    for (i = 0; i < myComments.length; i++){
      commentsArray.push(
        <div style={{display: "block", borderBottom: "0px solid #65C5AA", marginBottom: "30px", overflow: "hidden"}} key={"comment: "+i}>
          <div style={{backgroundColor: "rgba(10, 22, 40, 0.5)", display: "block", overflow: "hidden", padding: "15px"}}>
              <h5 style={{margin: "15px 0px"}}><b style={{fontSize: "16px"}}>{myComments[i].title}</b></h5>
              <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", }}><b style={{color: "#FFDE46"}}>By: </b>
              <a style={{color: "#65C5AA"}} target={"_blank"} href={"/user/"+ myComments[i].from}>{myComments[i].from}</a></p>
              <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", }}><b style={{color: "#FFDE46"}}>On: </b>{myComments[i].date}</p>
              <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", }}><b style={{color: "#FFDE46"}}>Comment: </b>{myComments[i].description}</p>
          </div>
        </div>
      );
    }
    comments = (
      <div style={{paddingTop: "30px", display: "block"}}>
        <h3 style={{fontFamily: "Open Sans", marginTop: "30px", margin: "0 auto", marginBottom: "15px", textAlign: "center"}}>{myComments.length} Comment{myComments.length !== 1? "s" : ""}</h3>
        {commentsArray}
      </div>
    );
    return (
      <div>
      <Dialog
         title=""
         actions={modalActions}
         modal={true}
         open={this.state.modalOpen}
       >
         {this.state.modalError}
       </Dialog>
       <Dialog
          title=""
          actions={modalActions2}
          modal={true}
          open={this.state.txModalOpen}
        >
          <div style={{width: "50%", display: "block", margin: "0 auto", marginTop: "30px"}}>
          <p style={{fontSize: "14px", textAlign: "center"}}> {this.state.txLoadingMessage}</p>

            <LinearProgress mode="determinate" value={this.state.txLoadingAmount} color="rgb(255, 222, 70)"/>
            </div>
        </Dialog>
        <Dialog
           title=""
           actions={modalActions3}
           modal={true}
           open={this.state.noWeb3Error}
         >
           <div style={{width: "75%", display: "block", margin: "0 auto", marginTop: "30px"}}>
           <p style={{fontSize: "18px", textAlign: "center"}}>To perform this action, you need to use a web3 enabled browser. We suggest using the <a href="https://metamask.io" target="_blank" style={{textDecoration: "none", color: "#65C5AA"}}> Metamask </a> browser extension.</p>
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

          <FlatButton href="/newBounty/" style={{backgroundColor: "#65C5AA", border:"0px", color: "#152639", width: "150px", marginTop: '18px', float: "right", marginRight: "60px"}} > New Bounty </FlatButton>

          </div>

          <div style={{ display: "block", overflow: "hidden", width: "1050px", margin: "0 auto", paddingBottom: "160px"}}>

            <div style={{float: "left", display: "block", margin: "0 15px", width: "1000px"}}>
            { this.state.loading &&

              <div style={{marginLeft: "480px", marginTop: "60px", overflow: "hidden", marginBottom: "60px"}}>
              <Halogen.ScaleLoader color={"#65C5AA"} />
              </div>
            }
              <div style={{ marginBottom: "15px", boxShadow: "none", borderRadius: "0", padding: "15px", marginTop: "15px", border: "0", backgroundColor: "rgba(10, 22, 40, 0.5)", borderBottom: "0px solid #65C5AA", color :"white", paddingTop: "30px"}} className="ContractCard">
              <h3 style={{margin: "0px 15px 30px 15px", width: "100%", display: "inline", fontSize: "28px", textAlign: "center"}}> {this.state.contract.bountyData.title}</h3>

                <div style={{float: "left", display: "inline-block", width: "200px", marginLeft: "7.5px", marginRight: "7.5px"}}>
                  <div style={{backgroundColor: "rgba(10, 22, 40, 0.5)", display: "block", overflow: "hidden", padding: "15px", marginLeft: "7.5px", marginRight: "7.5px"}}>
                  <h5 style={{ fontSize: "12px", width: "100%", textAlign: "center", marginTop: "7.5px", marginBottom: "7.5px"}}>Payout</h5>
                    <h1 style={{textAlign: "center", marginTop: "7.5px", marginBottom: "7.5px"}}>{this.state.contract.value}</h1>
                    <h5 style={{ fontSize: "12px", width: "100%", textAlign: "center", marginTop: "7.5px", marginBottom: "7.5px"}}>{this.state.contract.symbol? this.state.contract.symbol: 'ΞTH'}</h5>
                    <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", textAlign: "center", marginBottom: "7.5px"}}><b style={{color: "#FFDE46", fontWeight: "500"}}>Total Balance:</b> {this.state.contract.balance + " " + this.state.contract.symbol}</p>
                  </div>
                </div>
                <div style={{float: "left", display: "inline-block", paddingLeft: "15px", width: "485px"}}>


                  <p style={{ fontSize: "14px", width: "100%", margin: "0px 0px 5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "500"}}>Bounty Stage:</b> {this.state.contract.stage}</p>
                  <p style={{ fontSize: "14px", width: "100%", margin: "5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "500"}}>Deadline:</b> {this.state.contract.deadline}</p>

                  <p style={{ fontSize: "14px", width: "100%", margin: "5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "500"}}>Contact the bounty issuer:</b> { this.state.contract.bountyData.contact}</p>
                  <p style={{ fontSize: "14px", width: "100%", margin: "5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "500"}}>Bounty Issuer:</b> <a style={{color: "#65C5AA"}} target={"_blank"} href={"/user/"+ this.state.contract.issuer}>{ this.state.contract.issuer}</a></p>
                  {this.state.contract.bountyData.sourceFileHash &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "500"}}>Associated File: </b> <a style={{color: "#65C5AA"}} target={"_blank"} href={"https://ipfs.infura.io/ipfs/" + this.state.contract.bountyData.sourceFileHash}> {this.state.contract.bountyData.sourceFileName} </a> </p>}
                  {this.state.contract.paysTokens &&
                  <p style={{ fontSize: "14px", width: "100%", margin: "5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "500"}}>Token Contract:</b> <a style={{color: "#65C5AA"}} target={"_blank"} href={"https://etherscan.io/address/"+ this.state.contract.tokenContract.address}>{this.state.contract.tokenContract.address}</a></p>}
                  <p style={{ fontSize: "14px", width: "100%", margin: "5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "500"}}>Description: </b> {this.state.contract.bountyData.description}  </p>
                  <div style={{margin: "0 auto", display: "block", overflow: "hidden"}}>
                    {categories}
                  </div>
                </div>
                <div style={{float: "left", display: "inline-block", paddingLeft: "15px", width: "210px", marginRight: "15px"}}>
                  <form className='Contribute' onSubmit={this.handleContribute} style={{width: "100%", display: "inline-block"}}>
                    <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px"}}> Contribute to the Bounty</h4>
                    <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>Deposit Amount ({this.state.contract.symbol? this.state.contract.symbol: 'ΞTH'})</label>
                    <input id='deposit_amount' className='SendAmount' type='number'  step="any" style={{width: "192px", border: "0px"}}/>
                    {this.state.contributionError &&
                      <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.state.contributionError}</p>}
                    <button type='submit' className='AddBtn' style={{backgroundColor: "rgba(255, 255, 255, 0.18)", border:"0px", color: "white"}}>Contribute</button>

                  </form>
                </div>

                {actions}





            </div>
            {fulBody}
            <form className='Contribute' onSubmit={this.handleComment} style={{width: "940px", display: "inline-block", backgroundColor: "rgba(10, 22, 40, 0.5)", padding: "30px"}}>
              <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center"}}>Add Comment</h4>
              <label htmlFor='comment_title' style={{fontSize: "12px", display: "block"}}>Title</label>
              <input id='comment_title' className='SendAmount' type='text' style={{width: "920px", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}/>
              <label htmlFor='comment_description' style={{fontSize: "12px", display: "block", marginTop: "15px"}}>Description</label>
              <textarea id='comment_description' cols="60" rows="3" className='ContractCode' type='text' style={{width: "920px", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}></textarea>
              {this.state.commentError &&
                <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "10px", textAlign: "center"}}>{this.state.commentError}</p>}
              <button type='submit'  className='AddBtn' style={{backgroundColor: "rgba(255, 255, 255, 0.18)", border:"0px", color: "white",  display: "block", padding: "16px", margin: "0 auto", marginTop: "15px", fontSize: "1em", width: "200px"}}>Comment</button>
            </form>
            {comments}
          </div>
        </div>
        <p style={{textAlign: "center", fontSize: "10px", padding: "15px", color: "rgba(256,256,256,0.75)"}}>&copy; Bounties Network, a ConsenSys Formation <br/>
        This software provided without any guarantees. <b> Use at your own risk</b> while it is in public beta.</p>
      </div>
    </div>
    )
  }
}

export default BountyPage
