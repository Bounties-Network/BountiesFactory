import React, { Component } from 'react'
import './ChangeDeadlineForm.css'

class ChangeDeadlineForm extends Component {
  render() {
    return (
      <div style={{width: "467px", paddingLeft: "15px", paddingRight: "15px", display: "block", margin: "0 auto", marginTop: "15px", marginBottom: "15px"}}>
        <form className='Activate' onSubmit={this.props.onhandleDeadlineChange} style={{width: "100%"}}>
          <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center",  fontWeight: "600"}}> Change Bounty Deadline</h3>
          <label style={{fontSize: "12px"}} htmlFor='bounty_deadline'>Updated Deadline (UTC)</label>
          <input id='bounty_deadline' defaultValue={this.props.dateNum} type='datetime-local' style={{width: "450px", border: "0px", height: "22px"}}/>
          {this.props.deadlineError &&
            <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.props.deadlineError}</p>}
          <button type='submit' className='AddBtn' style={{width: "100%", backgroundColor: "#f52a34", border:"0px"}}>Extend</button>

        </form>
      </div>
    )
  }
}

export default ChangeDeadlineForm
