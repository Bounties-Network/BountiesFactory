import React, { Component } from 'react'
import './AllBountiesPage.css'


import Web3 from 'web3';

const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));
const json = require('../../../contracts.json');
const networkId = json.networkId;
const StandardBounties = web3.eth.contract(json.interfaces.StandardBounties).at(json.standardBountiesAddress);


const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const BN = require(`bn.js`);
const utf8 = require('utf8');

import logo from './images/logo.svg';
import FlatButton from 'material-ui/FlatButton';
import BountiesFacts from 'components/BountiesFacts/BountiesFacts';
import AccountFacts from 'components/AccountFacts/AccountFacts';

import ContractList from 'components/ContractList/ContractList';

import Dialog from 'material-ui/Dialog';




class AllBountiesPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalError: "",
      modalOpen: false,
      loadingInitial: true,
      accounts: [],
      contracts: [],
      bounties: [],
      total: 0,
      totalMe: 0,
      loading: true,
      myBountiesLoading: true
    }

    this.getInitialData = this.getInitialData.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.getBounty = this.getBounty.bind(this);
  }
  componentDidMount() {

  this.getInitialData();

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


  getInitialData(){
    if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
      // Use Mist/MetaMask's provider
      web3.setProvider(window.web3.currentProvider);
      if (networkId !== web3.version.network){
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
          var bounties = [];
          StandardBounties.getNumBounties((err, succ)=> {
            var total = parseInt(succ, 10);
            this.setState({total: total});
            for (var i = 0; i < total; i++){
              this.getBounty(i, bounties, total);

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
  getBounty(bountyId, bounties, total){
    StandardBounties.getBounty(bountyId, (err, succ)=> {
      StandardBounties.getBountyData(bountyId, (err, data)=> {
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
            var balance = web3.fromWei(parseInt(succ[6], 10), 'ether');
            bounties.push({
              bountyId: bountyId,
              issuer: succ[0],
              deadline: newDate.toUTCString(),
              value: value,
              paysTokens: succ[3],
              stage: stage,
              owedAmount: parseInt(succ[5], 10),
              balance: balance,
              bountyData: result,
              symbol: "ETH"
            });
            if (bounties.length === total){
              this.setState({bounties: bounties, loading: false});
            }
          } else {
            StandardBounties.getBountyToken(bountyId, (err, address)=> {
              var HumanStandardToken = web3.eth.contract(json.interfaces.HumanStandardToken).at(address);
              HumanStandardToken.symbol((err, symbol)=> {
                HumanStandardToken.decimals((err, dec)=> {

                  var decimals = parseInt(dec, 10);
                  var newAmount = succ[2];
                  var decimalToMult = new BN(10, 10);
                  var decimalUnits = new BN(decimals, 10);
                  decimalToMult = decimalToMult.pow(decimalUnits);
                  newAmount = newAmount.div(decimalToMult);

                  var balance = succ[6];
                  balance = balance.div(decimalToMult);

                  bounties.push({
                    bountyId: bountyId,
                    issuer: succ[0],
                    deadline: newDate.toUTCString(),
                    value: parseInt(newAmount, 10),
                    paysTokens: succ[3],
                    stage: stage,
                    owedAmount: parseInt(succ[5], 10),
                    balance: parseInt(balance, 10),
                    bountyData: result,
                    symbol: this.toUTF8(symbol)
                  });
                  if (bounties.length === total){
                    this.setState({bounties: bounties, loading: false});
                  }
                });
              });

            });

          }

        });

      });

    });

  }

  render() {
    var newList = [];
    for (var i = 0; i < this.state.bounties.length; i++){
      if (this.state.bounties[i].issuer === this.state.accounts[0]){
        newList.push(this.state.bounties[i]);
      }
    }
    var totalMe = newList.length;
    var activeList = [];
    for (i = 0; i < this.state.bounties.length; i++){
      if (this.state.bounties[i].stage === "Active"){
        activeList.push(this.state.bounties[i]);
      }
    }
    var recentList = [];
    for (var j = 0; j < this.state.bounties.length; j++){
        recentList.push(this.state.bounties[j]);
    }
    console.log("lists", this.state.bounties);
    const modalActions = [
    <FlatButton
      label="Retry"
      primary={true}
      onClick={this.handleClose}
    />
  ];

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
      <div id="colourBody" style={{minHeight: "100vh"}}>
      <div style={{overflow: "hidden"}}>
        <a href="/" style={{width: "276px", overflow: "hidden", display: "inline-block", float: "left", padding: "1.25em 0em"}}>
          <div style={{backgroundImage: `url(${logo})`, height: "3em", width: "14em", backgroundSize: "contain", backgroundRepeat: "no-repeat", display: "block", float: "left", marginLeft: "44px"}}>
          </div>
        </a>
        <BountiesFacts total={this.state.total}/>
        <AccountFacts total={totalMe}/>
        <span style={{backgroundSize: 'cover', backgroundRepeat: 'no-repeat', borderRadius: '50%', boxShadow: 'inset rgba(255, 255, 255, 0.6) 0 2px 2px, inset rgba(0, 0, 0, 0.3) 0 -2px 6px'}} />
        <FlatButton href="/newBounty/" style={{backgroundColor: "#65C5AA", border:"0px", color: "#152639", width: "150px", marginTop: '18px', float: "right", marginRight: "60px"}} > New Bounty </FlatButton>
      </div>
        <div style={{ display: "block", overflow: "hidden", width: "1050px", margin: "0 auto", paddingBottom: "120px"}}>

        <div style={{width: "744px", margin: "0 auto", display: "block"}}>
          {recentList.length !== 0 && <ContractList list={recentList} acc={this.state.accounts[0]} loading={this.state.loading} title={'All Bounties'}/>}
        </div>
      </div>


      </div>
    </div>

    )
  }
}

export default AllBountiesPage
