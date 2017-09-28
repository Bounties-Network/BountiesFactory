import React, { Component } from 'react'
import './NewBounty.css'

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));


const json = require('../../../contracts.json');
const networkId = json.networkId;

const Buffer = require('buffer/').Buffer;

const BountyFactoryContract = web3.eth.contract(json.interfaces.BountyFactory).at(json.registryAddress);

const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const ipfsAPI = require('ipfs-api');

import { browserHistory } from 'react-router';

import logo from '../AppContainer/images/logo.svg';
import FlatButton from 'material-ui/FlatButton';
import MilestoneInput from 'components/MilestoneInput/MilestoneInput';

import BountiesFacts from 'components/BountiesFacts/BountiesFacts';
import AccountFacts from 'components/AccountFacts/AccountFacts';

import Select from 'react-select';
import Dialog from 'material-ui/Dialog';



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

const bugMilestones = [
  {
    title: "Critical Bug",
    payout: 0,
    description: `These issues are directly exploitable bugs or security vulnerabilities. Left unaddressed these issues are highly likely or guaranteed to cause major problems or potentially a full failure in the operations of the contract.

    eg. a bug that enables a bad actor to outright steal the funds held in a contract`,
    difficulty: 5,
  },
  {
    title: "Major Bug",
    payout: 0,
    description: `These issues will be bugs or security vulnerabilities which may not be directly exploitable, or may require a certain condition to arise in order to be exploited. Left unaddressed these issues are highly likely to cause problems with the operation of the contract or lead to a situation which allows the system to be subverted in some way.

    eg. a bug that enables a bad actor to make an invalid state transition`,
    difficulty: 4,
  },
  {
    title: "Medium Bug",
    payout: 0,
    description: `These issues are generally objective in nature but do not represent actual bugs or security problems, and should be addressed unless there is a clear reason not to.

    eg. a contract is susceptible to a griefing attack which complicates the lives of its users`,
    difficulty: 3,
  },
  {
    title: "Minor Bug",
    payout: 0,
    description: `These issues are generally subjective in nature, or potentially deal with topics like "best practices" or "readability". Minor issues in general will not indicate an actual problem or bug in code, so maintainers should use their own judgement as to whether addressing these issues improves the codebase.

    eg. using constants instead of an enum type for error codes`,
    difficulty: 2,
  },
];




class NewBounty extends Component {
  constructor(props) {
    super(props)
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
      sourceFileHash: ""
    }
    this.ipfsApi = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: "https"});


    this.getInitialData = this.getInitialData.bind(this);
    this.handleSubmitContract = this.handleSubmitContract.bind(this);
    this.handlecaptureFile = this.handlecaptureFile.bind(this);
    this.handleTokenChange = this.handleTokenChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleMilestoneChange = this.handleMilestoneChange.bind(this);
    this.handleMilestoneValuesChange = this.handleMilestoneValuesChange.bind(this);
    this.handleRemoveMilestone = this.handleRemoveMilestone.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);

  }
  componentDidMount() {
    //  this.getContractData();
    this.getInitialData();


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
      console.log("Successfully connected to MetaMask")
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

              BountyFactoryContract.getInstantiationCount(accs[0], (cerr, succ) => {
                var total = parseInt(succ,10);
                this.setState({totalMe: total});
              });
              BountyFactoryContract.getInstanceCount((cerr, succ) => {
                var total = parseInt(succ,10);
                this.setState({total: total});
              });

            }
          }
        }.bind(this));




      }
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
    var tokenAddress= "0";
    if (evt.target.token_address){
      tokenAddress = evt.target.token_address.value;
    }
    var deadline = new Date(oldDeadline + "z");
    var date = deadline.getTime()/1000|0;
    date +=  "";

    var submit = {title: title,
      description: description,
      sourceFileHash: this.state.sourceFileHash,
      sourceFileName: this.state.sourceFileName,
      contact: info,
      isToken: tokenAddress,
      requirements: this.state.milestones,
      categories: this.state.optionsList,

    };
    var totalRewards = 0;
    var rewards = [];
    for (var j = 0; j < this.state.milestones.length; j++){
      var rew = parseInt(web3.toWei(this.state.milestones[j].payout, 'ether'), 10);
      totalRewards += rew;
      rewards.push(rew);
    }
    ipfs.addJSON(submit, (err, result)=> {
      BountyFactoryContract.create(date, result, rewards, totalRewards, 0x0, tokenAddress, {from: this.state.accounts[0]}, (cerr, succ)=> {
        if (cerr){
          console.log('error:', cerr);
        }
        browserHistory.push('/');
      });

    });



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
    let ipfsId

    const buffer = Buffer.from(reader.result);
    this.ipfsApi.add(buffer)
    .then((response) => {
      console.log("response", response);

      ipfsId = response[0].hash;
      console.log("response", ipfsId);

      this.setState({sourceFileHash: ipfsId});


    }).catch((err) => {
      console.error(err)
    })
  }
  handleTokenChange(evt){
    this.setState({payoutMethod: evt.target.value});
  }

  handleSelectChange (value) {
    var optionsList = value.split(",");
    if (this.state.optionsList.indexOf("Bugs") < 0){
      if (optionsList.indexOf("Bugs") >= 0){

        var newMilestones = this.state.milestones;

        newMilestones.push(bugMilestones[0]);
        newMilestones.push(bugMilestones[1]);
        newMilestones.push(bugMilestones[2]);
        newMilestones.push(bugMilestones[3]);
        this.setState({milestones: newMilestones, numMilestones: (this.state.numMilestones + 4)});
      }
    }
    this.setState({ optionsList: optionsList, value: value});
    this.forceUpdate();

  }
  handleMilestoneChange (evt) {
    this.setState({numMilestones: evt.target.value});
    if (this.state.milestones.length < evt.target.value){
      var newMilestones = this.state.milestones;
      for (var i = 0; i < (evt.target.value - this.state.milestones.length); i++){
        newMilestones.push({
          payout: 0,
          title: "Title for milestone ",
          description: "Description for milestone ",
          difficulty: 0
        });
      }
      this.setState({milestones: newMilestones});
    } else if (this.state.milestones.length > evt.target.value){
      newMilestones = this.state.milestones.slice(0, evt.target.value);
      this.setState({milestones: newMilestones});
    }
  }

  handleMilestoneValuesChange(evt, type, i){
    var newMilestones = this.state.milestones.slice();

    if (type === "payout"){
      newMilestones[i].payout = evt.target.value;
    } else if (type === "title"){
      newMilestones[i].title = evt.target.value;
    } else if (type === "description"){
      newMilestones[i].description = evt.target.value;
    } else if (type === "difficulty"){
      newMilestones[i].difficulty = evt.target.value;
    }
    this.setState({milestones: newMilestones});
  }
  handleRemoveMilestone(evt, i){

    var newMilestones = this.state.milestones.slice();
    newMilestones.splice(i,1)
    var newNumMilestones = newMilestones.length;
    this.setState({milestones: newMilestones, numMilestones: newNumMilestones});
  }




  render() {
    var milestones = [];
    for (var i = 0; i < (this.state.milestones.length); i++){
      milestones.push(
        <MilestoneInput milestone={this.state.milestones[i]}
        onmilestoneChange={this.handleMilestoneValuesChange}
        onremove={this.handleRemoveMilestone}
        index={i}
        key={i}/>

      );

    }
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
            <div style={{backgroundImage: `url(${logo})`, height: "3em", width: "14em", backgroundSize: "contain", backgroundRepeat: "no-repeat", float: "left", marginLeft: "44px", display: "block"}}>
            </div>
            </a>
            <BountiesFacts total={this.state.total}/>
            <AccountFacts total={this.state.totalMe}/>
            <span style={{backgroundSize: 'cover', backgroundRepeat: 'no-repeat', borderRadius: '50%', boxShadow: 'inset rgba(255, 255, 255, 0.6) 0 2px 2px, inset rgba(0, 0, 0, 0.3) 0 -2px 6px'}} />


            </div>
            <div style={{ display: "block", overflow: "hidden", width: "1050px", margin: "0 auto", paddingBottom: "160px"}}>
            <div style={{float: "left", display: "block", margin: "0 15px", width: "1000px"}}>
              <div style={{ marginBottom: "15px", boxShadow: "none", borderRadius: "0", padding: "15px", marginTop: "30px", border: "0", backgroundColor: "rgba(10, 22, 40, 0.5)", borderBottom: "0px solid #65C5AA", color :"white"}} className="ContractCard">

                <h3 style={{fontFamily: "Open Sans", margin: "24px", textAlign: "Center", fontWeight: "500", width: "100%"}}>Create a New Bounty</h3>

                  <form className='AddProject' onSubmit={this.handleSubmitContract} style={{padding: "15px", color: "white"}}>
                    <label style={{fontSize: "12px", display: "block"}} htmlFor='contract_title'>Title</label>
                    <input id='contract_title' style={{border: "none", width: "920px"}} className='SendAmount' type='text' ref={(i) => { if(i) { this.contract_title = i}}} />
                    <label style={{fontSize: "12px", display: "block"}} htmlFor='contract_description'>Description</label>
                    <textarea rows="3" id='contract_description' className='SendAmount' type='text' ref={(i) => { if(i) { this.contract_description = i}}} style={{width: "915px", marginBottom: "15px", fontSize: "16px", padding: "10px"}}/>
                    <div>
                      <div style={{display: "inline-block"}}>
                        <div style={{width: "440px", marginRight: "15px", float: "left", display: "inline-block"}}>
                          <label style={{fontSize: "12px"}} >Bounty Category</label>
                          <Select multi simpleValue disabled={this.state.disabled} value={this.state.value} placeholder="Select task categories" options={CATEGORIES} onChange={this.handleSelectChange} />
                          <p style={{fontSize: "12px", color: "rgba(265,265,265, 0.55)", marginTop: "5px", marginBottom: "15px"}}>the types of tasks being bountied</p>
                        </div>
                        <div style={{width: "440px", marginLeft: "25px", float: "left", display: "inline-block"}}>
                          <label style={{fontSize: "12px"}} htmlFor='bounty_deadline'>Number of Milestones</label>
                          <input id='num_milestones' style={{border: "none", width: "440px"}} type='number' value={this.state.numMilestones} onChange={this.handleMilestoneChange}/>
                          <p style={{fontSize: "12px", color: "rgba(265,265,265, 0.55)", marginTop: "-10px", marginBottom: "15px"}}>the deadline for submitting any bugs</p>                    </div>
                        </div>
                      </div>
                      <div style={{display: "inline-block"}}>
                        <div style={{width: "440px", marginRight: "15px", float: "left", display: "inline-block"}}>
                          <label style={{fontSize: "12px"}} htmlFor='contract_code'>Associated Files</label>
                          <input id='contract_code' type="file" name="file" onChange={this.handlecaptureFile} style={{width: "0px", display: "block", border: "0px", color: "white", height: "0px", padding: "0px", margin: "0px"}}/>
                          <div style={{width: "440px", display: "block", border: "1px solid white", color: "white", height: "20px", padding: "7.5px", paddingTop: "6px", paddingLeft: "4px", borderRadius: "4px"}}>
                            <label htmlFor="contract_code" style={{backgroundColor: "white", color: "#122134", padding: "3px 15px", fontWeight: "700", borderRadius: "4px", marginTop: "-1px"}}> Upload </label>
                            <span style={{float: "right", marginRight: "30px"}}> {fileName} </span>
                          </div>
                          <p style={{fontSize: "12px", color: "rgba(265,265,265, 0.55)", marginTop: "5px"}}>any files required by bounty hunters</p>
                        </div>
                      <div style={{width: "440px", marginLeft: "25px", float: "left", display: "inline-block"}}>
                        <label style={{fontSize: "12px"}} htmlFor='contact_info'>Contact Info</label>
                        <input id="contact_info" ref={(i)=>{ if(i) { this.contact_info = i}}} style={{width: "440px", border: "none"}}></input>
                        <p style={{fontSize: "12px", color: "rgba(265,265,265, 0.55)", marginTop: "-10px", marginBottom: "15px"}}>for bounty hunters to be able to contact you off-chain</p>
                      </div>
                      <div style={{width: "440px", marginRight: "15px", float: "left", display: "inline-block"}}>
                        <label style={{fontSize: "12px"}} >Payout Method</label>
                        <select onChange={this.handleTokenChange} style={{fontSize: "16px", backgroundColor: "rgba(255, 255, 255, 0)", border:"1px solid white", color: "white", width: "457px", height: "40px", display: "block"}}>
                          <option value="ETH">ETH</option>
                          <option value="ERC">ERC20 Token </option>
                        </select>
                        <p style={{fontSize: "12px", color: "rgba(265,265,265, 0.55)", marginTop: "10px", marginBottom: "15px"}}>the token which will be used to pay out the reward</p>
                      </div>
                      <div style={{width: "440px", marginLeft: "25px", float: "left", display: "inline-block"}}>
                        <label style={{fontSize: "12px"}} htmlFor='bounty_deadline'>Bounty Deadline (UTC)</label>
                        <input id='bounty_deadline' style={{border: "none", width: "440px"}} type='datetime-local' ref={(i)=>{ if(i) { this.BountyDeadline = i}}} />
                        <p style={{fontSize: "12px", color: "rgba(265,265,265, 0.55)", marginTop: "-10px", marginBottom: "15px"}}>the deadline for submitting any bugs</p>
                      </div>
                      {this.state.payoutMethod === "ERC" && (
                        <div style={{float: "left", display: "inline-block"}}>
                          <label style={{fontSize: "12px", textAlign: "left", display: "block"}} htmlFor='token_address'>Token Address</label>
                          <input id='token_address' style={{border: "none", width: "920px"}} className='SendAmount' type='text'/>
                          <p style={{fontSize: "12px", color: "rgba(265,265,265, 0.55)", marginTop: "-10px", marginBottom: "15px"}}>the address of the token you plan to use</p>
                        </div>
                      )}
                    </div>
                    <div style={{width: "100%", display: "block"}}>
                      <h4 style={{textAlign: "center", width: "100%", color: "rgb(255, 222, 70)", fontWeight: "500", fontSize: "18px", display: "block"}}>Milestones</h4>
                      <div style={{paddingBottom: "15px", marginBottom: "15px", width: "100%"}}>
                        {milestones}
                      </div>
                    </div>
                    <button type='submit' className='AddBtn' style={{backgroundColor: "rgb(101, 197, 170)", border:"0px", width: "200px", margin: "0 auto", color: "rgb(21, 38, 57)", display: "block"}}>Create</button>
                  </form>

              </div>
            </div>
          </div>
        </div>
        <div style={{overflow: "hidden", width: "100%", height: "300px", backgroundColor: "#28252b", marginBottom: "0"}}>

        </div>
      </div>
    )
  }
}

export default NewBounty
