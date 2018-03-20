import React, { Component } from 'react'
import './KillBountyForm.css'

class KillBountyForm extends Component {
  render() {
    return (
      <div style={{width: "467px", paddingLeft: "15px", paddingRight: "15px", display: "block", margin: "0 auto", marginTop: "15px", marginBottom: "15px"}}>
        <form className='Activate' onSubmit={this.props.onhandleKill} style={{width: "100%", display: "inline-block"}}>
          <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center", fontWeight: "600"}}> Kill Bounty</h3>
          <p style={{ fontSize: "12px", width: "100%", textAlign: "center", margin: "25px 0px 32px 0px"}}> This will return all funds to you, and disable the ability for individuals to submit deliverables for consideration</p>
          <button type='submit' className='AddBtn' style={{width: "100%", backgroundColor: "#f52a34", border:"0px", color: "#152639"}}>Kill</button>
        </form>
      </div>
    )
  }
}

export default KillBountyForm
