import React, { Component } from 'react'
import './PrivacyPolicy.css'

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));

const json = require('../../../contracts.json');
const networkId = json.networkId;

const Buffer = require('buffer/').Buffer;

const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const ipfsAPI = require('ipfs-api');

var ipfsNew = ipfsAPI({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});



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




class PrivacyPolicy extends Component {
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
      standardBountiesAddress = json.mainNet.standardBountiesAddress;
      userCommentsAddress = json.mainNet.userCommentsAddress;
      networkName = "Main Network";
      localStorage.setItem('ethereumNetwork', "MainNet");
    } else {
      if (stored === "MainNet"){
        providerLink = "https://mainnet.infura.io";
        requiredNetwork = 1;
        standardBountiesAddress = json.mainNet.standardBountiesAddress;
        userCommentsAddress = json.mainNet.userCommentsAddress;
        networkName = "Main Network";


      } else if (stored === "Rinkeby"){
        providerLink = "https://rinkeby.infura.io";
        requiredNetwork = 4;
        standardBountiesAddress = json.rinkeby.standardBountiesAddress;
        userCommentsAddress = json.rinkeby.userCommentsAddress;
        networkName = "Rinkeby Network";
      }

    }
    web3.setProvider(new Web3.providers.HttpProvider(providerLink));

    console.log("localStorage.getItem('lightMode')", localStorage.getItem('lightMode'));
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
      lightMode:   localStorage.getItem('lightMode') === null? true : localStorage.getItem('lightMode') == "true",

    }
    this.handleToggleLightMode = this.handleToggleLightMode.bind(this);

  }
  componentDidMount() {


  }
  handleToggleLightMode(){
    var lightMode = !this.state.lightMode;
    this.setState({lightMode: lightMode});
    localStorage.setItem('lightMode', lightMode);

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
    document.title = "Bounties Explorer | Privacy Policy";

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
        <div id={this.state.lightMode? "colourBodyLight": "colourBodyDark"} style={{minHeight: "100vh", position: "relative", overflow: "hidden"}}>
          <div style={{position: "fixed", bottom: "15px", left: "15px", display: "block", overflow: "hidden", width: "100px"}} className="CornerEmoji">
          <div onClick={this.handleToggleLightMode} style={{backgroundImage:  this.state.lightMode? `url(${darkMoon})`:`url(${lightMoon})`, height: "28px", width: "28px", backgroundSize: "contain", backgroundRepeat: "no-repeat", display: "block", float: "left"}}>
          </div>
          </div>
          <div style={{overflow: "hidden"}} className="navBar">
            <a href="/" style={{width: "276px", overflow: "hidden", display: "block", padding: "1em 0em 1em 0em", margin: "0 auto"}}>
              <div style={{backgroundImage:  `url(${logo})`, height: "3em", width: "14em", backgroundSize: "contain", backgroundRepeat: "no-repeat", display: "block", float: "left", marginLeft: "57px"}}>
              </div>
            </a>
            <span style={{backgroundSize: 'cover', backgroundRepeat: 'no-repeat', borderRadius: '50%', boxShadow: 'inset rgba(255, 255, 255, 0.6) 0 2px 2px, inset rgba(0, 0, 0, 0.3) 0 -2px 6px'}} />

          </div>
            <div style={{display: "block", overflow: "hidden", width: "1050px", padding: "15px", margin: "0 auto", marginBottom: "75px", marginTop: "15px", backgroundColor: this.state.lightMode? "rgb(249,249,249)":"rgba(10, 22, 40, 0.5)", border: "0px", borderBottom: "0px solid #16e5cd", color:this.state.lightMode? "rgb(25, 55, 83)":"white"}} className="ContractCard">
              <h3 style={{fontFamily: "Open Sans", margin: "15px", textAlign: "Center",width: "1000px", fontWeight: "600", fontSize: "28px"}}>Privacy Policy</h3>
              <p>
                Last updated: December 1, 2017
              </p>
              <p>
                The Bounties development team is extremely passionate about enhancing trust through bounties in a decentralized world and takes consumer privacy very seriously. This privacy policy (“Privacy Policy”), along with our Terms of Use, describes how we collect, use, disclose, and store the information you provide to us. The Privacy Policy applies to the website, products, and services (collectively, “Services”) on or in which it is posted, linked, or referenced.
              </p>
              <p>
                This Privacy Policy covers:
              </p>
              <ul>
                <li style={{listStyleType:"disc"}}>Information that we receive from you when you interact with our Services;</li>
                <li style={{listStyleType:"disc"}}>How we use and process the information that we receive;</li>
                <li style={{listStyleType:"disc"}}>If and why personal information may be disclosed to third parties; and</li>
                <li style={{listStyleType:"disc"}}>Your choices regarding the collection and processing of your Personal Information.</li>
              </ul>
              <p>
                Please note that this Privacy Policy does not apply to information collected through third-party websites or services that you may access through the Services or that you submit to us through email, text message or other electronic message or offline.
              </p>
              <h4>User consent</h4>
              <p>
                By using the Services, you accept the terms of this Privacy Policy and our Terms of Use, and consent to our collection, use, disclosure, and retention of your information as described in this Privacy Policy. If you have not done so already, please also review our Terms of Use. The Terms of Use contain provisions that limit our liability to you and require you to resolve any dispute with us on an individual basis and not as part of any class or representative action. IF YOU DO NOT AGREE WITH ANY PART OF THIS PRIVACY POLICY OR OUR TERMS OF USE, THEN PLEASE DO NOT USE ANY OF THE SERVICES.
              </p>
              <h4>Effective date and changes to this policy</h4>
              <p>
                The Effective Date of this Privacy Policy is set forth at the top of this webpage. Whenever possible, we will provide you with advance written notice of our changes to this Privacy Policy. We will not make retroactive changes that reduce your privacy rights unless we are legally required to do so. Your continued use of the Services after the Effective Date constitutes your acceptance of the amended Privacy Policy. The amended Privacy Policy supersedes all previous versions.
              </p>
              <h4>Information we collect in connection with accessing our Service</h4>
              <ul>
                <li style={{listStyleType:"disc"}}>Optional Profile Information: username, photographs, contact information, Github profile link, social media profile links, description of skills and past experiences</li>
                <li style={{listStyleType:"disc"}}>Email</li>
                <li style={{listStyleType:"disc"}}>Ethereum Wallet Address</li>
                <li style={{listStyleType:"disc"}}>Device and OS Information</li>
                <li style={{listStyleType:"disc"}}>Carrier Information</li>
                <li style={{listStyleType:"disc"}}>Location Information</li>
                <li style={{listStyleType:"disc"}}>Application Version Information & History</li>
              </ul>
              <h4>How we use information we collect</h4>
              <p>
                We use the information we collect from our services to provide, maintain, and improve the Services, to develop new Services, and to protect the Services and our users.
              </p>
              <h4>How and when is information shared?</h4>
              <p>
                Bounties does not share personal information with companies, organizations and individuals outside of the Bounties community or our affiliate companies unless one of the following circumstances applies:
              </p>
              <p>
                <i>With your consent</i>
              </p>
              <p>
                We will share personal information with companies, organizations or individuals outside of the Services when we have your consent to do so. We require opt-in consent for the sharing of any sensitive personal information as well as .
              </p>
              <p>
                <i>For external processing</i>
              </p>
              <p>
                The internet is a complex highway system and until the emergence of the fully decentralizing Web 3.0, information must be processed along those rails in some instances. We make reasonable efforts to limit the exposure of any personal information to external processors.
              </p>
              <p>
                <i>For legal reasons</i>
              </p>
              <p>
                When permitted or required by law, we may share information with additional third parties for purposes including response to legal process. To the extent such activity is permissive in nature, we will endeavor to provide adequate notice in the instance of such disclosures. To the extent disclosures are required, we will still endeavor to provide notice where possible.
              </p>
              <p>
                We may also disclose information about you if we determine that disclosure is reasonably necessary to enforce our terms and conditions or protect our operations or users.
              </p>
              <p>
                If Bounties is involved in a merger, acquisition or asset sale, we will transfer any personal information to such third parties following notice and a reasonable opportunity for users to object to the transfer of such personal information.
              </p>

              <h4>{"How information is retained and secured [Layman's: We try really hard to keep your info secure]"}</h4>
              <p>
Of the information Bounties collects, we store the information publicly on IPFS and we retain information as long as it is necessary and relevant for our operations. In addition, we retain personal information to comply with applicable law where required, prevent fraud, resolve disputes, troubleshoot problems, assist with any investigation, enforce our Terms of Use, and other actions permitted by law.
              </p>
              <p>
We employ industry standard security measures designed to protect the security of all information submitted through the Services. However, the security of information transmitted through the internet can never be guaranteed. We are not responsible for any interception or interruption of any communications through the internet or for changes to or losses of data. Users of the Services are responsible for maintaining the security of any password, biometrics, user ID or other form of authentication involved in obtaining access to password protected or secure areas of any of our digital services. In order to protect you and your data, we may suspend your use of any of the Services, without notice, pending an investigation, if any breach of security is suspected.
              </p>
              <h4>Your choices [If you disagree with how we collect, process, store, and transmit your information, your only choice at this time is to not use Bounties]</h4>
              <p>
              With regard to information we collect, you have sole discretion whether to provide such information. Once provided, this information may be transmitted and shared in accordance with the terms of this policy unless and until you provide us notice to delete your personal information in writing at contact@boutnies.network. Users acknowledge that we will make reasonable efforts to delete such information as is technically possible. You acknowledge that the inherent nature of blockchain networks will make many records impossible to delete.
</p>
<p>
              Some personal information is automatically collected via the use of data analytics tools. If you object to this collection, your only choice is to not use the Services.

              </p>
              <h4>Linked Services [Bounties will be a gateway to the decentralized Web 3.0. Our policies only cover the gateway, not what you find on the other side.]</h4>
              <p>
The Services may provide access or interaction with third-party websites and services (“Third Party Services”) with which we have no affiliation. We do not endorse any Third Party Service or the quality or accuracy of information presented on it. If you decide to visit a Third Party Service, you are subject to its privacy policy and practices and not this Privacy Policy. We encourage you to carefully review the legal and privacy notices of all other digital services that you visit.
              </p>
              <h4>Special Provisions [Bounties is for those of legal age of majority!]</h4>
              <p>
              The Services are not intended for use by children. If you are under the age of majority in your place of residence, you may use the Services only with the consent of or under the supervision of your parent or legal guardian. Consistent with the requirements of the Children's Online Privacy Protection Act (COPPA), if we learn that we have received any information directly from a child under age 13 without first receiving his or her parent's verified consent, we will use that information only to respond directly to that child (or his or her parent or legal guardian) to inform the child that he or she cannot use the Services and subsequently we will delete that information.
              </p>
              <p>
              Under California Civil Code Section 1789.3, California users are entitled to the following consumer rights notice: California residents may reach the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs by mail at 1625 North Market Blvd., Sacramento, CA 95834, or by telephone at (916) 445-1254 or (800) 952-5210.
              </p>




            </div>
            <p style={{textAlign: "center", display: "block", fontSize: "10px", padding: "15px 0px", color: this.state.lightMode? "rgb(25, 55, 83)":"rgba(256,256,256,0.75)", width: "100%", position: "absolute", bottom: "0px"}}>&copy; Bounties Network, a <a href="https://ConsenSys.net" target="_blank" style={{textDecoration: "none", color: this.state.lightMode? "rgb(25, 55, 83)":"#16e5cd"}}>ConsenSys</a> Formation <br/>
             <a href="/privacyPolicy/" target="_blank" style={{color: this.state.lightMode? "rgb(25, 55, 83)":"rgba(256,256,256,0.75)"}}>Privacy Policy</a>{" | "}<a href="/terms/" target="_blank" style={{color: this.state.lightMode? "rgb(25, 55, 83)":"rgba(256,256,256,0.75)"}}>Terms of Service</a>
             </p>
        </div>

      </div>
    )
  }
}

export default PrivacyPolicy
