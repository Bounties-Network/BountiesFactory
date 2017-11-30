import React, { Component } from 'react'
import './BountiesFacts.css'

class BountiesFacts extends Component {

  render() {
    return (
      <div style={{width: "100px", float: "right", display: "inline-block", borderRight: "1px solid #16e5cd", paddingRight: "15px", height: "30px", marginTop: "30px", marginRight: "30px"}}>

      <h2 style={{fontSize: "18px", marginBottom: "0px", marginTop: "0px", color: "white", textAlign: "right"}}> {this.props.total}</h2>
      <span style={{fontSize: "12px", color: "#FFDE46", textAlign: "right"}}>
      Live Bounties
      </span>
      </div>
    )
  }
}

export default BountiesFacts
