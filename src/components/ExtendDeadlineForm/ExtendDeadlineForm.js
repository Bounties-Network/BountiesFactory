import React, { Component } from 'react'
import './ExtendDeadlineForm.css'

class ExtendDeadlineForm extends Component {

  render() {
    return (
      <div style={{width: "467px", display: "inline-block", paddingRight: "15px", borderRight: "1px solid #65C5AA", float: "left", marginTop: "30px"}}>
        <form className='Activate' onSubmit={this.props.onhandleDeadline} style={{width: "100%", display: "inline-block"}}>
          <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px"}}> Extend Bounty Deadline</h3>
          <label style={{fontSize: "12px"}} htmlFor='bounty_deadline'>Updated Deadline (UTC)</label>
          <input id='bounty_deadline' type='datetime-local' style={{width: "448px", border: "0px"}}/>
          <button type='submit' className='AddBtn' style={{width: "100%", backgroundColor: "rgba(255, 255, 255, 0.18)", border:"0px"}}>Extend</button>

        </form>
      </div>
    )
  }
}

export default ExtendDeadlineForm
