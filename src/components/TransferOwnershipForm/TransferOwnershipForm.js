import React, { Component } from 'react'
import './TransferOwnershipForm.css'

class TransferOwnershipForm extends Component {
  render() {
    return (
      <div style={{width: "467px", display: "inline-block", paddingRight: "15px", borderRight: "1px solid #65C5AA", marginTop: "30px"}}>
      <form className='Transfer' onSubmit={this.props.onhandleTransfer} style={{width: "100%", display: "inline-block"}}>
        <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px"}}> Transfer Ownership of Bounty</h3>
        <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>{"New Issuer's Address"}</label>
        <input id='newAddress' className='SendAmount' type='text' style={{width: "448px", border: "0px"}}/>
        {this.props.transferError &&
          <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.props.transferError}</p>}
        <button type='submit' className='AddBtn' style={{width: "100%", backgroundColor: "rgba(255, 255, 255, 0.18)", border:"0px"}}>Transfer</button>

      </form>
      </div>
    )
  }
}

export default TransferOwnershipForm
