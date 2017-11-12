import React, { Component } from 'react'
import './MilestoneInput.css'

import CancelIcon from 'material-ui/svg-icons/navigation/cancel';


class MilestoneInput extends Component {
  render() {
    return (
      <div>
        <div style={{display: "inline-block", width: "950px"}}>
          <div style={{width: "70px", float: "left", display: "inline-block"}}>
          <h3 style={{color: "rgb(255, 222, 70)", fontSize: "48px", marginTop: "0px", textAlign: "left", paddingRight: "15px"}}>{(this.props.index + 1)}</h3>
          </div>
          <div style={{width: "500px", marginRight: "15px", float: "left", display: "inline-block"}}>

            <label style={{fontSize: "12px", display: "block"}} htmlFor='milestone_title'>Title</label>

            <input key={"title"+this.props.index} id={'milestone_title'+this.props.index} type="text" style={{border: "none", width: "490px", backgroundColor: "rgba(256,256,256,0.2)", color: "white"}} value={this.props.milestone.title} onChange={(e)=>{this.props.onmilestoneChange(e, "title", this.props.index)}}/>
            <label style={{fontSize: "12px", display: "block"}} htmlFor='milestone_description'>Requirements</label>
            <textarea key={"description"+this.props.index} rows="6"
            id={'milestone_description'+this.props.index}
            type="email"
            value={this.props.milestone.description}
            style={{width: "490px", marginBottom: "15px", fontSize: "11px", padding: "10px", backgroundColor: "rgba(256,256,256,0.2)", color: "white", border: "none"}}
            onChange={(e)=>{this.props.milestoneChange(e, "description", this.props.index)}}/>
          </div>
          <div style={{width: "280px", marginLeft: "25px", float: "left", display: "inline-block"}}>
            <label style={{fontSize: "12px",  display: "block"}} htmlFor='bounty_amount_0'>Payout</label>
            <input type="text" id={'bounty_amount'+this.props.index}
            key={'bounty_amount'+this.props.index}
            style={{border: "none", backgroundColor: "rgba(256,256,256,0.2)", color: "white", textAlign: "right", width: "265px"}}
            defaultValue={this.props.milestone.payout}
            onChange={(e)=>{this.props.milestoneChange(e, "payout", this.props.index)}}/>
          </div>
          <div style={{width: "30px", float: "left", display: "inline-block"}}>
            <a onClick={(e)=>{this.props.onremove(e, this.props.index)}} >
            <CancelIcon color="rgb(255, 222, 70)" hoverColor="#16e5cd" style={{marginTop: "15px", marginLeft: "15px"}}/>
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default MilestoneInput
