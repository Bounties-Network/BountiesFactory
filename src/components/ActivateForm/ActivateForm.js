import React, { Component } from 'react'
import './ActivateForm.css'

class ActivateForm extends Component {
  render() {
    return (
      <div style={{width: "467px", display: "inline-block", paddingRight: "15px", borderRight: "1px solid #65C5AA", marginTop: "30px"}}>
      <form className='Activate' onSubmit={this.props.onhandleActivate} style={{width: "100%", display: "inline-block"}}>
        <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px"}}> Activate your Bounty</h3>
        <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>Deposit Amount ({this.props.tokenDetails? this.props.tokenDetails.symbol + " tokens" : 'ΞTH'})</label>
        <input id='deposit_amount' className='SendAmount' type='text' style={{width: "450px", border: "0px"}} defaultValue={this.props.amount}/>
        <button type='submit' className='AddBtn' style={{width: "100%", backgroundColor: "#65C5AA", border:"0px", color: "#152639"}}>Activate</button>
      </form>
      </div>
    )
  }
}

export default ActivateForm
