import React, { Component } from 'react'
import './ActivateForm.css'

class ActivateForm extends Component {
  render() {
    return (
      <div style={{width: "467px", display: "block", paddingRight: "15px", paddingLeft: "15px", margin: "0 auto", marginTop: "30px", marginBottom: "15px"}}>
      <form className='Activate' onSubmit={this.props.onhandleActivate} style={{width: "100%", display: "inline-block"}}>
        <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center", fontWeight: "600"}}> Activate your Bounty</h3>
        <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>Deposit Amount ({this.props.tokenDetails? this.props.tokenDetails.symbol + " tokens" : 'ΞTH'})</label>
        <input id='deposit_amount' className='SendAmount' type='text' style={{width: "450px", border: "0px"}} defaultValue={this.props.amount}/>
        <button type='submit' className='AddBtn' style={{width: "100%", backgroundColor: "#4a79fa", border:"0px", color: "white", fontWeight: "600"}}>ACTIVATE</button>
      </form>
      </div>
    )
  }
}

export default ActivateForm
