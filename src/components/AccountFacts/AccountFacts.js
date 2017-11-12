import React, { Component } from 'react'
import './AccountFacts.css'

class AccountFacts extends Component {
  render() {
    return (
      <div style={{width: "200px", float: "left", display: "inline-block", marginLeft: "15px", borderLeft: "1px solid #16e5cd", paddingLeft: "15px", height: "45px", marginTop: "20px"}}>
      <span style={{fontSize: "12px", color: "#FFDE46"}}><h2 style={{fontSize: "18px", marginBottom: "0px", marginTop: "0px", color: "white"}}> {this.props.total}</h2>Deployed By You</span>
      </div>
    )
  }
}

export default AccountFacts
