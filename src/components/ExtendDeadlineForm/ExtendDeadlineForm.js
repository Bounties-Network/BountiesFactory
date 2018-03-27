import React, { Component } from 'react'
import './ExtendDeadlineForm.css'

class ExtendDeadlineForm extends Component {

  render() {
    return (
      <div style={{width: "467px", paddingLeft: "15px", paddingRight: "15px", display: "block", margin: "0 auto", marginTop: "15px", marginBottom: "15px"}}>
        <form className='Activate' onSubmit={this.props.onhandleDeadline} style={{width: "100%", display: "inline-block"}}>
          <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center",  fontWeight: "600"}}> Extend Bounty Deadline</h3>
          <label style={{fontSize: "12px"}} htmlFor='bounty_deadline'>Updated Deadline (UTC)</label>
          <input id='bounty_deadline' defaultValue={this.props.dateNum} type='datetime-local' style={{width: "450px", border: "0px", height: "22px"}}/>
          {this.props.deadlineError &&
            <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.props.deadlineError}</p>}
          <button type='submit' className='AddBtn' style={{width: "100%", backgroundColor: "#4a79fa", border:"0px", color: "white", fontWeight: "600"}}>EXTEND</button>

        </form>
      </div>
    )
  }
}

export default ExtendDeadlineForm
