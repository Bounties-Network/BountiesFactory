import React, { Component } from 'react'
import './IncreasePayoutForm.css'

class IncreasePayoutForm extends Component {
  render() {
    return (
      <div style={{width: "467px", display: "block", paddingLeft: "15px", margin: "0 auto", paddingRight: "15px", marginTop: "30px", marginBottom: "15px"}}>
        <form className='Activate' onSubmit={this.props.onhandleIncrease} style={{width: "100%", display: "inline-block"}}>
          <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center"}}>Increase Reward</h3>
          <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>{"Deposit Amount (" +this.props.symbol + ")"}</label>
          <input id='newDeposit' className='SendAmount' type='number' step="any" style={{width: "450px", border: "0px"}}/>
          <p style={{fontSize: "12px", color: "rgba(265,265,265, 0.55)", marginTop: "-10px", marginBottom: "15px"}}>You must have a sufficient balance to pay out your reward at least once</p>
          <label htmlFor='payout_amount' style={{fontSize: "12px"}}>{"New Payout Amount"}</label>
          <input id='newPayout' className='SendAmount' type='number' step="any" style={{width: "450px", border: "0px"}}/>
          {this.props.increasePayoutError &&
            <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.props.increasePayoutError}</p>}
          <button type='submit' className='AddBtn' style={{width: "100%", backgroundColor: "#65C5AA", border:"0px"}}>Increase</button>
        </form>
      </div>
    )
  }
}

export default IncreasePayoutForm
