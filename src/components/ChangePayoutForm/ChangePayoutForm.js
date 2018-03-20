import React, { Component } from 'react'
import './ChangePayoutForm.css'

class ChangePayoutForm extends Component {
  render() {
    return (
      <div style={{width: "467px", display: "block", paddingLeft: "15px", margin: "0 auto", paddingRight: "15px", marginTop: "15px", marginBottom: "15px"}}>
        <form className='Activate' onSubmit={this.props.onhandleChange} style={{width: "100%", display: "inline-block"}}>
          <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center", fontWeight: "600"}}>Change Prize</h3>
          <p style={{fontSize: "12px", color: "rgba(265,265,265, 0.55)", marginTop: "-10px", marginBottom: "15px"}}>You must have a sufficient balance to pay out your reward at least once</p>
          <label htmlFor='payout_amount' style={{fontSize: "12px"}}>{"New Prize Amount (" +this.props.symbol + ")"}</label>
          <input id='newPayout' className='SendAmount' type='number' step="any" style={{width: "450px", border: "0px"}}/>
          {this.props.changePayoutError &&
            <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.props.changePayoutError}</p>}
          <button type='submit' className='AddBtn' style={{width: "100%", backgroundColor: "#f52a34", border:"0px", color: "#152639"}}>Change Reward</button>
        </form>
      </div>
    )
  }
}

export default ChangePayoutForm
