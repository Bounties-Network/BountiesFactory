import React, { Component } from 'react'
import './MyContractCard.css'


import SvgArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right';

class MyContractCard extends Component {
  render() {

    var url = ("/bounty/" + this.props.bountyId);
    var title;
    if (this.props.data.title.length > 22){
      title = this.props.data.title.substring(0,22) + "...";
    } else {
      title = this.props.data.title;
    }
    return (
      <a  href={url} style={{textDecoration: "none", padding: "0px", width: "225px"}}>
      <div style={{width: "215px", marginBottom: "0px", boxShadow: "none", borderRadius: "0", padding: "15px", color: "white", border: "0", borderBottom: "1px solid rgba(101, 197, 170, 0.5)"}} className="ContractCard">
        <div style={{float: "left", display: "inline-block", width: "190px"}}>
          <h4 style={{margin: "0px", width: "100%", fontSize: "14px"}}>{title}</h4>
          <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "500"}}>Balance:</b> {this.props.balance + " "+this.props.symbol} | <b style={{color: "#FFDE46", fontWeight: "500"}}>Stage: </b>{this.props.stage}</p>
        </div>
        <a style={{marginTop: "11px", color: "#16e5cd", textAlign: "right"}}> <SvgArrow style={{color: "#16e5cd", fontSize: "44px"}}/></a>

      </div>
      </a>
    )
  }
}

export default MyContractCard
