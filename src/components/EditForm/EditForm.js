import React, { Component } from 'react'
import './EditForm.css'
import Select from 'react-select';

import Halogen from 'halogen';
import SvgCheck from 'material-ui/svg-icons/action/check-circle';

class EditForm extends Component {
  render() {
    var fileName;
    if (this.props.sourceFileName.length > 38){
      fileName = this.props.sourceFileName.substring(0,38) + "...";
    } else {
      fileName = this.props.sourceFileName;
    }
    console.log("selected", this.props.selectedValue);
    return (
      <div style={{width: "467px", display: "block", paddingRight: "15px", paddingLeft: "15px", margin: "0 auto", marginTop: "15px", marginBottom: "15px"}}>
      <form className='Activate' onSubmit={this.props.onHandleEdit} style={{width: "100%", display: "inline-block"}}>
        <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center",  fontWeight: "600"}}> Edit your Bounty</h3>
        <label style={{fontSize: "12px"}} htmlFor='contract_title'>Title</label>
        <input id='title' style={{border: "none", width: "450px"}} className='SendAmount' type='text' defaultValue={this.props.title}/>
        {this.props.titleError &&
          <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.props.titleError}</p>}
          <label style={{fontSize: "12px", display: "block"}} htmlFor='contract_description'>Description</label>
          <textarea rows="3" id='description' className='SendAmount' type='text'  defaultValue={this.props.description} style={{width: "445px", marginBottom: "15px", fontSize: "16px", padding: "10px", border: "none"}}/>
          {this.props.descriptionError &&
            <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.props.descriptionError}</p>}
          <label style={{fontSize: "12px", display: "block"}} htmlFor='contact_info'>Contact Info</label>
          <input id="contact" style={{width: "450px", border: "none"}} defaultValue={this.props.contact}></input>
          <label style={{fontSize: "12px", display: "block"}} htmlFor='contract_code'>Associated Files</label>
          <input id='contract_code' type="file" name="file" onChange={this.props.onHandleCaptureEditFile} style={{width: "0px", display: "block", border: "0px", color: "white", height: "0px", padding: "0px", margin: "0px"}}/>
          <div style={{width: "452px", display: "block", border: "1px solid rgb(25, 55, 83)", color: "white", height: "20px", padding: "7.5px", paddingTop: "6px", paddingLeft: "4px", borderRadius: "4px", marginBottom: "15px"}}>
            <label htmlFor="contract_code" style={{backgroundColor: "white", color: "#122134", padding: "3px 15px", fontWeight: "700", borderRadius: "4px", marginTop: "-1px"}}> Upload </label>
            {
              (this.props.didUploadFile && !this.props.fileUploadFinished)&&
              <div style={{ float: "right", display: "inline-block", padding: "0px 15px 0px 5px", overflow: "hidden"}}>
                <Halogen.ClipLoader color={"#f52a34"} size={"15px"} style={{float: "right", width: "15px", height: "15px", display: "inline-block"}}/>
              </div>

            }
            {
              (this.props.didUploadFile && this.props.fileUploadFinished)&&
              <div style={{ float: "right", display: "inline-block", padding: "3px 15px 0px 5px", overflow: "hidden"}}>
              <SvgCheck style={{color: "rgb(22, 229, 205)", float: "right", width: "15px", height: "15px", display: "inline-block"}}/>
              </div>

            }
            <span style={{float: "right", marginRight: "30px"}}> {fileName} </span>
          </div>
          <label style={{fontSize: "12px"}} >Bounty Category</label>
          <Select.Creatable multi simpleValue disabled={this.props.disabled} value={this.props.selectedValue} placeholder="Select task categories" options={this.props.categoryOptions} onChange={this.props.onHandleChangeSelected} style={{width: "466px", marginBottom: "15px", border: "1px solid rgb(25, 55, 83)"}}/>
          {this.props.containsCode && (
            <div style={{float: "left", display: "inline-block"}}>
              <label style={{fontSize: "12px", textAlign: "left", display: "block"}} htmlFor='token_address'>Github Link</label>
              <input id='github_link' style={{border: "none", width: "450px"}} defaultValue={this.props.webURL} className='SendAmount' type='text'/>
              <p style={{fontSize: "12px", color: "rgba(265,265,265, 0.55)", marginTop: "-10px", marginBottom: "15px"}}>a github link to a relevant repository</p>
            </div>
          )}
        <button type='submit' className='AddBtn' style={{width: "100%", backgroundColor: "#f52a34", border:"0px", color: "white", fontWeight: "600"}}>SUBMIT EDITS</button>
      </form>
      </div>
    )
  }
}

export default EditForm
