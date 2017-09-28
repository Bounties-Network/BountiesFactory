import React, { Component } from 'react'
import './TokenBrowser.css'

import Web3 from 'web3';


const json = require('../../../contracts.json');
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));

const tokenContract = web3.eth.contract(json.interfaces.HumanStandardToken).at(json.tokenAddress);

const BN = require(`bn.js`);

const utf8 = require('utf8');

import logo from './images/logo.svg';





class TokenBrowser extends Component {
  constructor(props) {
    super(props)
    this.state = {
      metamaskError: "",
      loadingInitial: true,
      accounts: [],
      contracts: [],
      bounties: [],
      total: 0,
      totalMe: 0,
      sourceFileName: "",
      sourceFileHash: "",
      invariantsFileName: "",
      invariantsFileHash: "",
      loading: true,
      tokenDetails: {name: "", symbol: "", balance: 0, decimals: 0},
      leaderboard: []
    }

    this.getInitialData = this.getInitialData.bind(this);
    this.handleTransfer = this.handleTransfer.bind(this);
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



  getInitialData(){
    if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
      // Use Mist/MetaMask's provider
      web3.setProvider(window.web3.currentProvider);

      web3.eth.getAccounts(function(err, accs){
        if (err){
          console.log ('error fetching accounts', err);
        } else {
          this.setState({accounts: accs});
          var account = web3.eth.accounts[0];
          setInterval(function() {
            if (web3.eth.accounts[0] !== account) {
              account = web3.eth.accounts[0];
              window.location.reload();
            }
          }, 100);
          var tokenDetails;
          tokenContract.decimals((err, succ)=> {
            var decimals = parseInt(succ, 10);
            tokenContract.symbol((err, succ)=> {
              var symbol = this.toUTF8(succ);
              tokenContract.name((err, succ)=> {
                var name = succ;
                tokenContract.balanceOf(accs[0], (err, succ)=> {
                  var newAmount = succ;
                  var decimalToMult = new BN(10, 10);
                  var decimalUnits = new BN(decimals, 10);
                  decimalToMult = decimalToMult.pow(decimalUnits);
                  newAmount = newAmount.div(decimalToMult);

                  tokenDetails = {name: name, symbol: symbol, balance: parseInt(newAmount, 10), decimals: decimals};
                  this.setState({tokenDetails: tokenDetails});

                });
              });
            });
            tokenContract.getTotalTokenHolders((err, succ)=> {
              var total = parseInt(succ, 10);
              var leaderboard = [];
              for (var i = 0; i < total; i++){
                tokenContract.tokenHolders(i, (err, succ)=> {
                  var address = succ;
                  tokenContract.balanceOf(address, (err, succ)=> {

                    var newAmount = succ;
                    var decimalToMult = new BN(10, 10);
                    var decimalUnits = new BN(decimals, 10);
                    decimalToMult = decimalToMult.pow(decimalUnits);
                    newAmount = newAmount.div(decimalToMult);
                    var finalAmount = parseInt(newAmount, 10);
                    leaderboard.push({address: address, balance: finalAmount});
                    if (leaderboard.length === total){
                      this.setState({leaderboard: leaderboard});
                    }

                  });
                });
              }
            });

          });
        }
      }.bind(this));
    } else {
      this.setState({metamaskError: "Please ensure you are using metamask"});
    }


  }
  handleTransfer(evt){
    evt.preventDefault();

    var address = evt.target.newAddress.value;
    var amount = evt.target.amount.value;
    var padding = Array(this.state.tokenDetails.decimals+1).join("0");
    var stringAmount = "" + amount + padding;

    tokenContract.transfer(address, stringAmount, {from: this.state.accounts[0]}, (cerr, succ)=> {

    });


  }

  render() {

    var leaderboard = [];
    for (var i = 0; i< this.state.leaderboard.length; i++){
      leaderboard.push(
        <div style={{width: "600px", display: "inline-block"}} key={i}>
          <div style={{width: "30px", display: "inline-block", float: "left"}}>
          <h2 style={{margin: "20px 0px"}}>{i+1}</h2>
          </div>
          <div style={{width: "400px", display: "inline-block", float: "left", paddingTop: "26px", paddingBottom: "26px"}}>
          <span >{this.state.leaderboard[i].address}</span>
          </div>
          <div style={{width: "110px", display: "inline-block", float: "left", textAlign: "right", paddingTop: "26px", paddingBottom: "26px"}}>
          <span style={{fontWeight: "700", color: "#65C5AA", textAlign: "right"}}>{this.state.leaderboard[i].balance}</span>
          </div>
        </div>
      );
    }


    return (
      <div>

      <div id="colourBody">
      <div style={{overflow: "hidden"}}>
        <a href="/" style={{width: "276px", overflow: "hidden", display: "inline-block", float: "left", padding: "1.25em 0em"}}>
          <div style={{backgroundImage: `url(${logo})`, height: "3em", width: "14em", backgroundSize: "contain", backgroundRepeat: "no-repeat", float: "left", marginLeft: "44px", display: "block"}}>
          </div>
        </a>
        <div style={{width: "400px", float: "left", display: "inline-block", marginLeft: "15px", borderLeft: "1px solid #65C5AA", paddingLeft: "15px", height: "45px", marginTop: "20px"}}>
        <span style={{fontSize: "12px", color: "#FFDE46"}}><h2 style={{fontSize: "18px", marginBottom: "0px", marginTop: "0px", color: "white"}}>Token Contract:</h2>{tokenContract.address}</span>
        </div>

        <div style={{width: "450px", float: "right", display: "inline-block", marginRight: "30px", paddingLeft: "30px", height: "45px", marginTop: "20px", textAlign: "right"}}>
        <span style={{color: "#65C5AA", textAlign: "right", fontSize: "14px"}}>"Be hearty in your approbation, and lavish in your praise."
        <br/>
        <a href="https://www.amazon.com/How-Win-Friends-Influence-People/dp/0671027034" style={{fontSize: "12px", color: "#FFDE46", textAlign: "right"}}>- Dale Carnegie</a></span>
        </div>


      </div>
        <div style={{ display: "block", overflow: "hidden", width: "1050px", margin: "0 auto", paddingBottom: "120px"}}>

        <div style={{width: "376px", float: "left", display: "block", marginRight: "15px", backgroundColor: "rgba(256,256,256,0.95)", padding: "30px", color: "black"}}>
          <h2 style={{fontSize: "49px", marginTop: "15px", marginBottom: "15px", color: "black", textAlign: "center"}}>
            🌮 TOKEN
          </h2>
          <h3 style={{color: "black", fontSize: "24px", fontWeight: "700"}}><b style={{fontSize: "18px", textAlign: "left", fontWeight: "200"}}> Your Balance:</b>
          {"   " + this.state.tokenDetails.balance + " 🌮s"}
          </h3>

          <form className='Transfer' onSubmit={this.handleTransfer} style={{width: "100%", display: "inline-block", borderTop: "1px solid black", paddingTop: "30px"}}>
            <h4 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", fontWeight: "200", fontSize: "18px"}}>Gift Someone 🌮 s:</h4>
            <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>To</label>
            <input id='newAddress' className='SendAmount' type='text' style={{width: "346px", border: "0px", fontSize: "14px", padding: "15px", marginBottom: "15px"}}/>
            <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>Amount</label>
            <input id='amount' className='SendAmount' type='text' style={{width: "346px", border: "0px", fontSize: "14px", padding: "15px", marginBottom: "15px"}}/>
            <button type='submit' className='AddBtn' style={{width: "100%", backgroundColor: "#FFDE46", border:"0px", fontWeight: "700", fontSize: "14px", padding: "15px"}}>Transfer</button>

          </form>


        </div>
        <div style={{width: "539px", float: "left", display: "block", backgroundColor: "rgba(256,256,256,0.95)", padding: "30px", color: "black"}}>
        <h2 style={{fontSize: "29px", marginTop: "15px", marginBottom: "15px", color: "black", textAlign: "center"}}>
          🌮 Leaderboard
        </h2>
        {leaderboard}
        </div>
      </div>


      </div>
    </div>

    )
  }
}

export default TokenBrowser
