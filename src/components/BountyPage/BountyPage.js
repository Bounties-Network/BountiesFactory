import React, { Component } from 'react'
import './BountyPage.css'


const json = require('../../../contracts.json');

const networkId = json.networkId;

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));

const BountyFactoryContract = web3.eth.contract(json.interfaces.BountyFactory).at(json.registryAddress);
const UserCommentsContract = web3.eth.contract(json.interfaces.UserComments).at(json.UserCommentsAddress);

const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const BN = require(`bn.js`);

const utf8 = require('utf8');

import logo from '../AppContainer/images/logo.svg';


import BountiesFacts from 'components/BountiesFacts/BountiesFacts';
import AccountFacts from 'components/AccountFacts/AccountFacts';

import ActivateForm from 'components/ActivateForm/ActivateForm';
import ChangeDeadlineForm from 'components/ChangeDeadlineForm/ChangeDeadlineForm';
import TransferOwnershipForm from 'components/TransferOwnershipForm/TransferOwnershipForm';
import ExtendDeadlineForm from 'components/ExtendDeadlineForm/ExtendDeadlineForm';
import KillBountyForm from 'components/KillBountyForm/KillBountyForm';

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

import Dialog from 'material-ui/Dialog';

import Avatar from 'material-ui/Avatar';

import Halogen from 'halogen';





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
      commentsAbout: [],
      contract: {
                bountyAddr: this.props.params.id,
                bountyData: {
                  title: "",
                  sourceFileName: "",
                  sourceFileHash: "",
                  description: "",
                  requirements: []
                },
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
        bountyContract: web3.eth.contract(json.interfaces.StandardBounty).at(this.props.params.id)

    }

    this.getInitialData = this.getInitialData.bind(this);

    this.handleFulfill = this.handleFulfill.bind(this);
    this.handleActivate = this.handleActivate.bind(this);
    this.handleContribute = this.handleContribute.bind(this);
    this.handleAccept = this.handleAccept.bind(this);
    this.handlePayment = this.handlePayment.bind(this);
    this.handleDeadline = this.handleDeadline.bind(this);
    this.handleKill = this.handleKill.bind(this);
    this.handleMilestoneChange = this.handleMilestoneChange.bind(this);
    this.handleComment = this.handleComment.bind(this);

    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
  }
  componentDidMount() {
  this.getInitialData();
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



      var bountyContract = this.state.bountyContract;
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
        web3.eth.getBalance(bountyContract.address , (cerr, succ) => {

          var balance = web3.fromWei(parseInt(succ, 10), 'ether');

          bountyContract.totalFulfillmentAmounts((cerr, succ)=> {
            var value = parseInt(succ, 10);
            bountyContract.getBounty((cerr, succ) => {

                ipfs.catJSON(succ[3], (err, result) => {

                  var stage = parseInt(succ[1], 10);

                  if (stage === 0){
                    stage = "Draft";
                  } else if (stage === 1){
                    stage = "Active";
                  } else if (stage === 2){
                    stage = "Dead";
                  }

                  var date = new Date(parseInt(succ[2], 10)*1000);

                  var bounty = {
                    issuer: succ[0],
                    stage: stage,
                    deadline: date.toUTCString(),
                    bountyData: result,
                    value: value,
                    bountyAddr: bountyContract.address,
                    mine: (succ[0] === accs[0]),
                    balance: balance,
                  }
                  var tokenDetails;
                  if (bounty.bountyData.isToken !== "0"){
                    var tokenContract = web3.eth.contract(json.interfaces.HumanStandardToken).at(bounty.bountyData.isToken);
                    tokenContract.name((err, succ)=> {
                      var name = succ;
                      tokenContract.symbol((err, succ)=> {
                        var symbol = this.toUTF8(succ);
                        tokenContract.decimals((err, succ)=> {
                          var decimals = parseInt(succ, 10);
                          tokenContract.balanceOf(bountyContract.address, (err, succ)=> {
                            var newAmount = succ;
                            var decimalToMult = new BN(10, 10);
                            var decimalUnits = new BN(decimals, 10);
                            decimalToMult = decimalToMult.pow(decimalUnits);
                            newAmount = newAmount.div(decimalToMult);

                            tokenDetails = {name: name, symbol: symbol, balance: parseInt(newAmount, 10), decimals: decimals};
                            this.setState({tokenDetails: tokenDetails, tokenContract: tokenContract});
                          });
                        });
                      });
                    });
                  }
                  this.setState({contract: bounty, accounts: accs, loading: false, selectedMilestone: bounty.bountyData.requirements[0].title, tokenDetails: tokenDetails});

                });

            });

          });


          bountyContract.getNumMilestones((cerr, succ) => {
            var num = parseInt(succ, 10);
            var fulfillments = [];
            for (var i = 0; i < num; i++){
              fulfillments.push([]);
            }
            this.setState({fulfillments: fulfillments});

            for (i = 0; i < num; i++){
              this.getFulfillments(i, bountyContract);

            }
          });

        });
          BountyFactoryContract.getInstantiationCount(accs[0], (err, succ) => {
            var total = parseInt(succ,10);
            this.setState({totalMe: total});
          });
          BountyFactoryContract.getInstanceCount((err, succ) => {
            var total = parseInt(succ,10);
            this.setState({total: total});
          });

          UserCommentsContract.numCommentsAboutUser(this.state.bountyContract.address, (err, succ)=> {
            var total = parseInt(succ, 10);
            var comments = [];
            for (var i = 0; i < total; i++){
              UserCommentsContract.commentsAboutUser(this.state.bountyContract.address, i, (err, succ)=> {
                var from = succ[1];
                var to = succ[2];
                var date = new Date(parseInt(succ[3], 10)*1000)
                ipfs.catJSON(succ[0], (err, result)=> {
                  comments.push({title: result.title, description: result.description, from: from, to: to, date: date.toUTCString()});
                  if (comments.length === total){
                    this.setState({commentsAbout: comments});
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
      this.setState({modalError: "You must use MetaMask if you would like to use the Bounties.network dapp", modalOpen: true});
    }

  }

  getFulfillments(i, bountyContract){

    bountyContract.getNumFulfillments(i, (err, succ)=> {
      var total = parseInt(succ, 10);
      var fulfillments = [];
      for (var j = 0; j < total; j++){
        bountyContract.getFulfillment(i,j, (err, succ)=> {
          console.log("got ful", succ);
          ipfs.catJSON(succ[3], (err, result)=> {
            fulfillments.push({
              paid: succ[0],
              accepted: succ[1],
              fulfiller: succ[2],
              data: result.description,
            });
            if (fulfillments.length === total){
              var totalFul = this.state.fulfillments;
              totalFul[i] = fulfillments;
              this.setState({fulfillments: totalFul});
            }
          });

        });
      }
    });
  }

  handleFulfill(evt){
    evt.preventDefault();

    var data = evt.target.bug_description.value;
    var bountyContract = this.state.bountyContract;
    var index = 0;
    for (var i = 0; i < this.state.contract.bountyData.requirements.length; i++){
      if (this.state.contract.bountyData.requirements[i].title === this.state.selectedMilestone){
        index = i;
      }
    }

    ipfs.addJSON({description: data}, (err, succ)=> {
      bountyContract.fulfillBounty(succ, index, {from: this.state.accounts[0]}, (cerr, succ)=> {
        window.location.reload();
      });
    });



  }
  handleContribute(evt){
    evt.preventDefault();

    var amount = evt.target.deposit_amount.value;
    var bountyContract = this.state.bountyContract;
    var num = web3.toWei(amount ,'ether');


    bountyContract.contribute(num, {from: this.state.accounts[0], value: num}, (cerr, succ)=> {
      window.location.reload();
    });

  }

  handleComment(evt){
    evt.preventDefault();

    var title = evt.target.comment_title.value;
    var description = evt.target.comment_description.value;


    ipfs.addJSON({title: title, description: description}, (err, succ)=> {
      UserCommentsContract.addComment(succ, this.state.bountyContract.address, {from: this.state.accounts[0]}, (cerr, succ)=> {

        window.location.reload();
      });
    })
  }

  handleActivate(evt){
    evt.preventDefault();

    var amount = evt.target.deposit_amount.value;

    if (this.state.tokenDetails){
      var bountyContract = this.state.bountyContract;
      if (amount !== 0){
        var padding = Array(this.state.tokenDetails.decimals+1).join("0");
        var stringAmount = "" + amount + padding;
        this.state.tokenContract.approve(this.state.bountyContract.address, stringAmount, {from: this.state.accounts[0]}, (err, succ)=> {
          bountyContract.activateBounty(stringAmount, {from: this.state.accounts[0]}, (cerr, succ)=> {
            console.log('succ', cerr, succ);
          });
        });
      } else {
        bountyContract.activateBounty(0, {from: this.state.accounts[0]}, (cerr, succ)=> {
          console.log('succ', cerr, succ);
        });
      }


    } else {
      var num = web3.toWei(amount ,'ether');

      this.state.bountyContract.activateBounty(num, {from: this.state.accounts[0], value: num}, (cerr, succ)=> {
        console.log('succ', cerr, succ);
        window.location.reload();
      });
    }



}

handleTransfer(evt){
  evt.preventDefault();

  var address = evt.target.newAddress.value;
  var bountyContract = this.state.bountyContract;

  bountyContract.transferIssuer(address, {from: this.state.accounts[0]}, (cerr, succ)=> {
    window.location.reload();
  });


}

handleDeadline(evt){
  evt.preventDefault();

  var deadline = evt.target.bounty_deadline.value;
  var deadline2 = new Date(deadline + "z");
  var date = deadline2.getTime()/1000|0;
  var bountyContract = this.state.bountyContract;

  bountyContract.extendDeadline(date, {from: this.state.accounts[0]}, (cerr, succ)=> {
    window.location.reload();
  });


}
handleDeadlineChange(evt){
  evt.preventDefault();

  var deadline = evt.target.bounty_deadline.value;
  var deadline2 = new Date(deadline + "z");
  var date = deadline2.getTime()/1000|0;
  var bountyContract = this.state.bountyContract;

  bountyContract.changeDeadline(date, {from: this.state.accounts[0]}, (cerr, succ)=> {
    window.location.reload();
  });


}
handleKill(evt){
  evt.preventDefault();

  var bountyContract = this.state.bountyContract;

  bountyContract.killBounty({from: this.state.accounts[0]}, (cerr, succ)=> {

  });


}

handleAccept(i, j){
  var bountyContract = this.state.bountyContract;

  bountyContract.acceptFulfillment(i, j, {from: this.state.accounts[0]}, (cerr, succ)=> {
    window.location.reload();
  });

}

handlePayment(i, j){
  var bountyContract = this.state.bountyContract;

  bountyContract.fulfillmentPayment(i, j, {from: this.state.accounts[0]}, (cerr, succ)=> {
    window.location.reload();
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



  render() {
    var actions;
    var fulBody;
    console.log("requirements", this.state.contract.bountyData);

    if (this.state.contract.mine){
      if (this.state.contract.stage === "Draft"){
        actions=(
          <div style={{marginTop: "15px", width: "100%"}}>
            <ActivateForm onhandleActivate={this.handleActivate} tokenDetails={this.state.tokenDetails} amount={web3.fromWei(this.state.contract.value, 'ether')}/>
            <ChangeDeadlineForm onhandleChangeDeadline={this.handleChangeDeadline} />
            <TransferOwnershipForm onhandleTransfer={this.handleTransfer} />
          </div>
        );
      }  else if (this.state.contract.stage === "Active"){

        actions = (
          <div>
            <ExtendDeadlineForm onhandleDeadline={this.handleDeadline} />
            <KillBountyForm onhandleKill={this.handleKill} />
            <TransferOwnershipForm onhandleTransfer={this.handleTransfer} />
          </div>
        );
      } else if (this.state.contract.stage === "Dead"){
         actions=(
          <div style={{marginTop: "15px", width: "100%"}}>
            <ActivateForm onhandleActivate={this.handleActivate} tokenDetails={this.state.tokenDetails} amount={web3.fromWei(this.state.contract.value, 'ether')}/>
            <ExtendDeadlineForm onhandleDeadline={this.handleDeadline} />
            <TransferOwnershipForm onhandleTransfer={this.handleTransfer} />
          </div>
        );
      }

    } else {

        if (this.state.contract.stage === "Active"){
          var requirementsForms = [];
          var selectors = [];


          for (var i = 0; i < this.state.contract.bountyData.requirements.length; i++){
            selectors.push(<option value={this.state.contract.bountyData.requirements[i].title} key={i}> {this.state.contract.bountyData.requirements[i] && this.state.contract.bountyData.requirements[i].title} </option>);
            if (this.state.selectedMilestone === this.state.contract.bountyData.requirements[i].title){
              requirementsForms.push(
                <div style={{paddingBottom: "15px"}} key={i}>
                  <form className='Fulfill' onSubmit={this.handleFulfill} style={{marginBottom: "15px"}}>
                  <p style={{fontSize: "12px", color: "rgba(265,265,265, 0.85)", marginBottom: "15px"}}>
                    <b style={{color: "#FFDE46", fontWeight: "200"}}>Bounty Payout: </b>
                    {this.state.contract.bountyData.requirements[i].payout + (this.state.tokenDetails? this.state.tokenDetails.symbol : 'ETH')}
                  </p>
                    <p style={{fontSize: "12px", color: "rgba(265,265,265, 0.85)", marginBottom: "15px"}}>
                      <b style={{color: "#FFDE46", fontWeight: "200", margin: "2.5px 0px"}}>Requirements: </b>
                      {this.state.contract.bountyData.requirements[i].description}
                    </p>
                    <input id='bounty_deadline' type='text' defaultValue={0} style={{width: "0.01px", display: "none"}}/>
                    <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>Submission Description and Comments</label>
                    <textarea id='bug_description' cols="60" rows="5" className='ContractCode' type='text' style={{width: "920px", border: "0px"}}></textarea>
                      <button type='submit' className='AddBtn' style={{backgroundColor: "#65C5AA", border:"0px", color: "#152639", width: "200px", margin: "0 auto", display: "block"}}>Submit</button>
                  </form>
                </div>
              );
            }


          }
          var selector = (
            <select onChange={this.handleMilestoneChange} style={{fontSize: "16px", backgroundColor: "rgba(0, 126, 255, 0.24)", border:"0px", height: "30px", color: "rgb(101, 197, 170)", width: "400px"}}>
            {selectors}
            </select>
          );

          actions = (
            <div style={{width: "940px", marginTop: "15px", marginLeft: "15px", marginRight: "15px"}}>
              <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px"}}>Fulfill a Milestone</h3>
              {selector}
              {requirementsForms}
            </div>
          );
        }


    }

    if (this.state.fulfillments.length){
      var numPushed = 0;
      var fulfillments = [];
      for (i = 0; i < this.state.fulfillments.length; i++){
        for (var j = 0; j < this.state.fulfillments[i].length; j++){
          fulfillments.push(
            <div style={{display: "block", borderBottom: "0px solid #65C5AA", marginBottom: "30px", overflow: "hidden"}} key={this.state.contract.bountyData.requirements[i] && this.state.contract.bountyData.requirements[i].title+j}>

              <div style={{backgroundColor: "rgba(10, 22, 40, 0.5)", display: "block", overflow: "hidden", padding: "15px"}}>
                <div style={{width: "60%", display: "inline-block", float: "left"}}>
                  <h5 style={{margin: "15px 0px"}}><b style={{color: "#FFDE46"}}>Milestone</b>: {this.state.contract.bountyData.requirements[i] && this.state.contract.bountyData.requirements[i].title}</h5>
                  <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", }}><b style={{color: "#FFDE46"}}>Bounty Hunter</b>: {this.state.fulfillments[i][j].fulfiller}</p>
                </div>
                <div style={{width: "10%", display: "inline-block", float: "left", borderRight: "1px solid #65C5AA", paddingRight: "15px"}}>
                  <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", textAlign: "right"}}>{this.state.fulfillments[i][j].accepted? "Accepted" : "Not Yet Accepted"}</p>
                  <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", textAlign: "right"}}>{this.state.fulfillments[i][j].paid? "Paid" : "Not Paid"}</p>
                </div>
                <div style={{width: "20%", display: "inline-block", float: "left"}}>
                  {this.state.fulfillments[i][j].accepted && !this.state.fulfillments[i][j].paid && this.state.accounts && this.state.accounts[0] === this.state.fulfillments[i][j].fulfiller && <FlatButton style={{backgroundColor: "#65C5AA", border:"0px", color: "#152639", float: "right", width: "150px"}} onClick={this.handlePayment.bind(this,i,j)}>Claim Payment</FlatButton>}
                  {this.state.contract.stage === "Active" && !this.state.fulfillments[i][j].accepted && this.state.accounts && this.state.accounts[0] === this.state.contract.issuer && <FlatButton style={{backgroundColor: "#65C5AA", border:"0px", color: "#152639", float: "right"}} onClick={this.handleAccept.bind(this,i,j)}> Accept </FlatButton>}
                </div>
                <div style={{width: "100%", display: "inline-block", float: "left", marginBottom: "15px"}}>
                  <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", color: "#FFDE46"}}><b>Submission</b>:</p>
                  <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", }}>{this.state.fulfillments[i][j].data}</p>
                </div>
              </div>
            </div>
          );
          numPushed++;
        }
      }
      fulBody = (
        <div style={{width: "100%", marginTop: "30px", display: "block", marginBottom: "60px", borderBottom: "1px solid #65C5AA", paddingBottom: "30px"}}>
          <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center"}}>{numPushed} Total Submission{numPushed !== 1? "s" : ""}</h3>
          {fulfillments}
        </div>
      );
    }


      var reward = web3.fromWei(this.state.contract.value, 'ether');

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
            <Chip style={{margin: "15px 5px", float: "left", border: "1px solid rgba(0, 126, 255, 0.24)", backgroundColor: "rgba(0, 126, 255, 0.08)"}}
                  labelStyle={{color: "white"}}
                  key={this.state.contract.bountyData.categories[i]}>
              <Avatar color="rgb(255, 222, 70)" icon={icon} style={{backgroundColor: "rgba(0, 126, 255, 0.24)" }}/>
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
    var commentsArray = [];
    var comments;

    for (i = 0; i < this.state.commentsAbout.length; i++){
      commentsArray.push(
        <div style={{display: "block", borderBottom: "0px solid #65C5AA", marginBottom: "30px", overflow: "hidden"}} key={"comment: "+i}>
          <div style={{backgroundColor: "rgba(10, 22, 40, 0.5)", display: "block", overflow: "hidden", padding: "15px"}}>
              <h5 style={{margin: "15px 0px"}}><b style={{color: "#FFDE46", fontSize: "16px"}}>{this.state.commentsAbout[i].title}</b></h5>
              <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", }}><b style={{color: "#FFDE46"}}>By: </b>{this.state.commentsAbout[i].from}</p>
              <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", }}><b style={{color: "#FFDE46"}}>On: </b>{this.state.commentsAbout[i].date}</p>
              <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", }}><b style={{color: "#FFDE46"}}>Comment: </b>{this.state.commentsAbout[i].description}</p>
          </div>
        </div>
      );
    }
    comments = (
      <div style={{paddingTop: "30px", display: "block"}}>
        <h3 style={{fontFamily: "Open Sans", marginTop: "30px", margin: "0 auto", marginBottom: "15px", textAlign: "center"}}>{this.state.commentsAbout.length} Comment{this.state.commentsAbout.length !== 1? "s" : ""}</h3>
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
        <div id="colourBody">
          <div style={{overflow: "hidden"}}>
            <a href="/" style={{width: "276px", overflow: "hidden", display: "inline-block", float: "left", padding: "1.25em 0em"}}>
              <div style={{backgroundImage: `url(${logo})`, width: "14em", backgroundSize: "contain", backgroundRepeat: "no-repeat",  height: "3em", float: "left", marginLeft: "44px", display: "block"}}>
              </div>
            </a>
          <BountiesFacts total={this.state.total}/>
          <AccountFacts total={this.state.totalMe}/>
          <span style={{backgroundSize: 'cover', backgroundRepeat: 'no-repeat', borderRadius: '50%', boxShadow: 'inset rgba(255, 255, 255, 0.6) 0 2px 2px, inset rgba(0, 0, 0, 0.3) 0 -2px 6px'}} />

          <FlatButton href="/newBounty/" style={{backgroundColor: "#65C5AA", border:"0px", color: "#152639", width: "150px", marginTop: '18px', float: "right", marginRight: "60px"}} > New Bounty </FlatButton>

          </div>
          <div style={{ display: "block", overflow: "hidden", width: "1050px", margin: "0 auto", paddingBottom: "160px"}}>
            <div style={{float: "left", display: "block", margin: "0 15px", width: "1000px"}}>
              <div style={{ marginBottom: "15px", boxShadow: "none", borderRadius: "0", padding: "15px", marginTop: "15px", border: "0", backgroundColor: "rgba(10, 22, 40, 0.5)", borderBottom: "0px solid #65C5AA", color :"white", paddingTop: "30px"}} className="ContractCard">
                <div style={{float: "left", display: "inline-block", width: "200px", marginLeft: "7.5px", marginRight: "7.5px"}}>
                  <div style={{backgroundColor: "rgba(10, 22, 40, 0.5)", display: "block", overflow: "hidden", padding: "15px", marginLeft: "7.5px", marginRight: "7.5px"}}>
                    <h1 style={{textAlign: "center", marginTop: "7.5px", marginBottom: "7.5px"}}>{reward}</h1>
                    <h5 style={{ fontSize: "12px", width: "100%", textAlign: "center", marginTop: "7.5px", marginBottom: "7.5px"}}>{this.state.tokenDetails? this.state.tokenDetails.symbol : 'ETH'}</h5>
                    <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", textAlign: "center", marginBottom: "7.5px"}}><b style={{color: "#FFDE46", fontWeight: "200"}}>Balance:</b> {this.state.tokenDetails? this.state.tokenDetails.balance : this.state.contract.balance}</p>
                  </div>
                </div>
                <div style={{float: "left", display: "inline-block", paddingLeft: "30px", width: "470px"}}>
                  <h3 style={{margin: "0px", width: "100%"}}> {this.state.contract.bountyData.title}</h3>
                  <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "200"}}>Bounty Stage:</b> {this.state.contract.stage}</p>
                  <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "200"}}>Deadline:</b> {this.state.contract.deadline}</p>

                  <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "200"}}>Bounty deployed at:</b>  <a style={{color: "#65C5AA"}} target={"_blank"} href={"https://rinkeby.etherscan.io/address/"+ this.state.contract.bountyAddr}>{ this.state.contract.bountyAddr}</a></p>
                  <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "200"}}>Contact the bounty issuer:</b> { this.state.contract.bountyData.contact}</p>
                  <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "200"}}>Issuer Address:</b> <a style={{color: "#65C5AA"}} target={"_blank"} href={"https://rinkeby.etherscan.io/address/"+ this.state.contract.issuerContact}>{ this.state.contract.issuer}</a></p>
                  <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "200"}}>Associated File: </b> <a style={{color: "#65C5AA"}} target={"_blank"} href={"https://ipfs.infura.io/ipfs/" + this.state.contract.bountyData.sourceFileHash}> {this.state.contract.bountyData.sourceFileName} </a> </p>
                </div>
                <div style={{float: "left", display: "inline-block", paddingLeft: "15px", width: "210px", marginRight: "15px"}}>
                  <form className='Contribute' onSubmit={this.handleContribute} style={{width: "100%", display: "inline-block"}}>
                    <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px"}}> Contribute to the Bounty</h4>
                    <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>Deposit Amount ({this.state.tokenDetails? this.state.tokenDetails.symbol + " tokens" : 'ΞTH'})</label>
                    <input id='deposit_amount' className='SendAmount' type='text'  style={{width: "192px", border: "0px"}}/>
                    <button type='submit' className='AddBtn' style={{backgroundColor: "rgba(255, 255, 255, 0.18)", border:"0px", color: "white"}}>Contribute</button>

                  </form>
                </div>
                <div style={{margin: "0 auto"}}>
                  {categories}
                </div>
                <div style={{width: "100%"}}>
                <p style={{ fontSize: "12px", width: "940px", margin: "0px 15px 15px 15px", padding: "0px"}}>
                  <b style={{color: "#FFDE46", fontWeight: "200"}}>Description: </b><br/>{ this.state.contract.bountyData.description}
                </p>

                </div>
            {actions}


            </div>
            { this.state.loading &&

              <div style={{marginLeft: "480px", marginTop: "60px", overflow: "hidden"}}>
              <Halogen.ScaleLoader color={"#65C5AA"} />
              </div>
            }

            {fulBody}
            <form className='Contribute' onSubmit={this.handleComment} style={{width: "940px", display: "inline-block", backgroundColor: "rgba(10, 22, 40, 0.5)", padding: "30px"}}>
              <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center"}}>Add Comment</h4>
              <label htmlFor='comment_title' style={{fontSize: "12px", display: "block"}}>Title</label>
              <input id='comment_title' className='SendAmount' type='text' style={{width: "920px", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}/>
              <label htmlFor='comment_description' style={{fontSize: "12px", display: "block", marginTop: "15px"}}>Description</label>
              <textarea id='comment_description' cols="60" rows="3" className='ContractCode' type='text' style={{width: "920px", border: "0px", display: "block", padding: "8px", fontSize: "1em"}}></textarea>
              <button type='submit'  className='AddBtn' style={{backgroundColor: "rgba(255, 255, 255, 0.18)", border:"0px", color: "white",  display: "block", padding: "16px", margin: "0 auto", marginTop: "15px", fontSize: "1em", width: "200px"}}>Comment</button>
            </form>
            {comments}
          </div>
        </div>
      </div>
    </div>
    )
  }
}

export default BountyPage
