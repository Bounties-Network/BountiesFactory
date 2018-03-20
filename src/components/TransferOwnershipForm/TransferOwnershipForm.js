import React, { Component } from 'react'
import './TransferOwnershipForm.css'

class TransferOwnershipForm extends Component {
  render() {
    return (
      <div style={{width: "467px", display: "block", paddingRight: "15px", paddingLeft: "15px", margin: "0 auto", marginTop: "15px", marginBottom: "15px"}}>
      <form className='Transfer' onSubmit={this.props.onhandleTransfer} style={{width: "100%", display: "inline-block"}}>
        <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center", fontWeight: "600"}}> Transfer Ownership of Bounty</h3>
        <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>{"New Issuer's Address"}</label>
        <input id='newAddress' className='SendAmount' type='text' style={{width: "450px", border: "0px"}}/>
        {this.props.transferError &&
          <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.props.transferError}</p>}
        <button type='submit' className='AddBtn' style={{width: "100%", backgroundColor: "#f52a34", border:"0px", color: "#152639"}}>Transfer</button>

      </form>
      </div>
    )
  }
}

export default TransferOwnershipForm
