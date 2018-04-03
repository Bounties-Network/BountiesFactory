import React, { Component } from 'react'
import './ContractCard.css'

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));

import { Link } from 'react-router';
import Chip from 'material-ui/Chip';
import SvgArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import Blockies from 'react-blockies';
const BigNumber = require('bignumber.js');

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

class ContractCard extends Component {
  render() {
    var categories = [];
    categories.push(
      <Chip style={{margin: "4px 9px 0px 0px", float: "left", border: "0px solid rgba(173, 187, 188,0.15)", backgroundColor: "rgba(173, 187, 188,0.15)", height: "20px"}}
            labelStyle={{color: "rgb(45, 8, 116)", fontSize: "11px", marginTop: "-5px"}}
            key={this.props.numFul+ this.props.numFul===1? " SUBMISSION":" SUBMISSIONS"}>
        <b style={{fontWeight: "500"}}>{this.props.numFul}</b><b style={{color:  "#2D0874", fontWeight: "200", marginLeft: "5px"}}>{this.props.numFul===1? " SUBMISSION":" SUBMISSIONS"}</b>
      </Chip>
    );
    if (this.props.categories){
      for (var i = 0; i < this.props.categories.length; i++){
        categories.push(
          <Chip style={{margin: "4px 9px 0px 0px", float: "left", border: "1px solid rgba(45, 8, 116,0.5)", backgroundColor: "rgba(0, 126, 255, 0)", height: "20px"}}
                labelStyle={{color:  "#2D0874", fontSize: "11px", marginTop: "-6px"}}
                key={this.props.categories[i].name}
                onClick={this.props.handleAddCategory.bind(this, this.props.categories[i].normalized_name)}
                className="Chip">
            <b className="Chip" style={{fontWeight: "300", }}>{this.props.categories[i].name}</b>
          </Chip>
        );
      }
    }

    var reward;

    if (this.props.symbol.length == 0 || this.props.symbol == "ETH"){
      reward = web3.fromWei(parseInt(this.props.value, 10), 'ether')
    } else {

      var decimals = parseInt(this.props.decimals, 10);
      var newAmount = new BigNumber(this.props.value, 10);
      var decimalToMult = new BigNumber(10, 10);
      var decimalUnits = new BigNumber(decimals, 10);
      decimalToMult = decimalToMult.pow(decimalUnits);
      newAmount = newAmount.div(decimalToMult);
      reward = newAmount.toString();
    }

    var url = ("/bounty/v1/"+ this.props.bountyId);
    return (
      <div style={{float: "left", width: "100%", marginBottom: "15px", display: "flex", overflow: "hidden"}}>
        <div style={{width: "100%", marginBottom: "0px",boxShadow: "none", borderRadius: "0", padding: "15px", backgroundColor: "rgb(249, 249, 249)", color: "white", borderLeft: "1px solid rgb(52,74,212)", borderWidth: "0px 0px 0px 1px", display: "flex", justifyContent: "center", alignItems: "center"}} className="ContractCard">

          <div style={{float: "left", display: "inline-block", width: "calc(100% - 135px)", paddingRight: "15px"}}>
            <Link style={{color: "#2D0874", textDecoration: "none"}} to={url}>
              <h4 style={{margin: "0px", width: "100%", marginBottom: "2px", fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden"}}> {this.props.title}</h4>
              </Link>
            <div style={{display: "block", width: "440px", overflow: "hidden"}}>
            <p style={{ fontSize: "12px", margin: "6px 0px", float: "left", display: "inline-block"}}>
              <b style={{color: "rgb(56, 89, 115)", fontWeight: "500"}}>By:  </b>
            </p>
            <Blockies
            seed={this.props.issuer}
            size={9}
            scale={2.5}
            style={{borderRadius: "10px", display: "inline-block", float: "left"}}
            />
            <p style={{ fontSize: "12px", width: "125px", margin: "6px 0px", float: "left", display: "inline-block"}}>
              <Link style={{color: "rgb(74, 121, 250)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", width: "100px"}}
                  to={"/user/"+ this.props.issuer}>
                    { this.props.issuer.substring(0,6)+"..."+this.props.issuer.substring(this.props.issuer.length-4,this.props.issuer.length)}
              </Link>
            </p>

            </div>
            <div style={{display: "block", overflow: "hidden", float: "left", width: "100%"}} className="chipset">
              {categories}
            </div>

          </div>
          <div style={{float: "right", marginTop: "0px"}}>

            <div style={{overflow: "hidden", display: "block",  width: "120px",}}>
            <h5 style={{ fontSize: "13px", width: "100%", textAlign: "center", marginTop: "0px", marginBottom: "0px", color: "#8C9899", fontWeight: "600"}}>PRIZE</h5>

            <h5 style={{ width: "100%", textAlign: "center", marginTop: "0px", marginBottom: "0px", color: "#2D0874", fontSize: "24px", fontWeight: "600"}}><b style={{color: "#fe923b", fontWeight: "6s00", lineHeight: "28px", fontSize: "18px"}}>$</b>{numberWithCommas(parseInt(this.props.usdValue))}</h5>

            <h1 style={{textAlign: "center", marginTop: "0px", marginBottom: "0px", color: "#8C9899", fontSize: "12px", fontWeight: "200"}}>{reward}{this.props.symbol? this.props.symbol : 'ETH'}</h1>

            <h5 style={{ fontSize: "11px", width: "100%", textAlign: "center", marginTop: "10px", marginBottom: "0px", color:"#8C9899", fontWeight: "200"}}>{this.props.dateString}</h5>

            </div>
          </div>

        </div>
          <Link style={{}} to={url}>
            <div className={ "SideArrowLight"} style={{float: "right", display: "flex", justifyContent: "center", alignItems: "center", width: "39px",   color: "#fe923b", textAlign: "right", height: "100%"}}>
              <SvgArrow style={{color:"#2D0874", fontSize: "44px", display: "inline-block"}}/>
            </div>
          </Link>

        </div>
    )
  }
}

export default ContractCard
