import React, { Component } from 'react'
import './BountiesFacts.css'

class BountiesFacts extends Component {

  render() {
    return (
      <div style={{width: "100px", float: "left", display: "inline-block", borderLeft: "1px solid #65C5AA", paddingLeft: "15px", height: "45px", marginTop: "20px"}}>
      <span style={{fontSize: "12px", color: "#FFDE46"}}><h2 style={{fontSize: "18px", marginBottom: "0px", marginTop: "0px", color: "white"}}> {this.props.total}</h2>Live Bounties</span>
      </div>
    )
  }
}

export default BountiesFacts
