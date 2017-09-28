import React, { Component } from 'react'
import './MyContractCard.css'


import SvgArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right';

class MyContractCard extends Component {
  render() {

    var url = ("/bounty/" + this.props.bountyAddress);
    var title;
    if (this.props.data.title.length > 46){
      title = this.props.data.title.substring(0,46) + "...";
    } else {
      title = this.props.data.title;
    }
    return (
      <a  href={url} style={{textDecoration: "none", padding: "0px", width: "245px"}}>
      <div style={{width: "100%", marginBottom: "15px", boxShadow: "none", borderRadius: "0", padding: "15px", backgroundColor: "rgba(10, 22, 40, 0.75)", color: "white", border: "0", borderLeft: "1px solid #65C5AA"}} className="ContractCard">
        <div style={{float: "left", display: "inline-block", width: "200px", paddingLeft: "15px", marginTop: "15px"}}>
          <h4 style={{margin: "0px", width: "100%"}}> {title}</h4>
          <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "200"}}>Balance:</b> {this.props.balance + (this.props.tokenDetails.symbol? this.props.tokenDetails.symbol : 'ETH')}</p>
          <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "200"}}>Bounty Stage: </b>{this.props.stage}</p>

        </div>
        <a style={{marginTop: "27px", color: "#65C5AA", textAlign: "right"}}> <SvgArrow style={{color: "#65C5AA", fontSize: "44px"}}/></a>

      </div>
      </a>
    )
  }
}

export default MyContractCard
