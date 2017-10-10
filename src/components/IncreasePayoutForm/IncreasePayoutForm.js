import React, { Component } from 'react'
import './IncreasePayoutForm.css'

class IncreasePayoutForm extends Component {
  render() {
    return (
      <div style={{width: "467px", display: "inline-block", paddingLeft: "15px", float: "right", marginTop: "30px"}}>
        <form className='Activate' onSubmit={this.props.onhandleIncrease} style={{width: "100%", display: "inline-block"}}>
          <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px"}}>Increase Payout</h3>
          <label htmlFor='deposit_amount' style={{fontSize: "12px"}}>{"New Payout Amount"}</label>
          <input id='newPayout' className='SendAmount' type='number' step="any" style={{width: "450px", border: "0px"}}/>
          {this.props.increasePayoutError &&
            <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.props.increasePayoutError}</p>}
          <button type='submit' className='AddBtn' style={{width: "100%", backgroundColor: "rgba(255, 255, 255, 0.18)", border:"0px"}}>Increase</button>
        </form>
      </div>
    )
  }
}

export default IncreasePayoutForm
