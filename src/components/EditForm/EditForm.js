import React, { Component } from 'react'
import './EditForm.css'
import Select from 'react-select';

const CATEGORIES = [
  { label: 'Code', value: 'Code' },
  { label: 'Bugs', value: 'Bugs' },
  { label: 'Questions', value: 'Questions' },
  { label: 'Graphic Design', value: 'Graphic Design' },
  { label: 'Social Media', value: 'Social Media' },
  { label: 'Content Creation', value: 'Content Creation' },
  { label: 'Translations', value: 'Translations'},
  { label: 'Surveys', value: 'Surveys'}
];
class EditForm extends Component {
  render() {
    var fileName;
    if (this.props.sourceFileName.length > 38){
      fileName = this.props.sourceFileName.substring(0,38) + "...";
    } else {
      fileName = this.props.sourceFileName;
    }
    return (
      <div style={{width: "467px", display: "block", paddingRight: "15px", paddingLeft: "15px", margin: "0 auto", marginTop: "15px", marginBottom: "15px"}}>
      <form className='Activate' onSubmit={this.props.onHandleEdit} style={{width: "100%", display: "inline-block"}}>
        <h3 style={{fontFamily: "Open Sans", marginTop: "0", margin: "0 auto", marginBottom: "15px", textAlign: "center"}}> Edit your Bounty</h3>
        <label style={{fontSize: "12px"}} htmlFor='contract_title'>Title</label>
        <input id='title' style={{border: "none", width: "450px"}} className='SendAmount' type='text' defaultValue={this.props.bountyData.title}/>
        {this.props.titleError &&
          <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.props.titleError}</p>}
          <label style={{fontSize: "12px", display: "block"}} htmlFor='contract_description'>Description</label>
          <textarea rows="3" id='description' className='SendAmount' type='text'  defaultValue={this.props.bountyData.description} style={{width: "445px", marginBottom: "15px", fontSize: "16px", padding: "10px"}}/>
          {this.props.descriptionError &&
            <p style={{fontSize: "12px", color: "#fa4c04", marginTop: "0px", textAlign: "center"}}>{this.props.descriptionError}</p>}
          <label style={{fontSize: "12px", display: "block"}} htmlFor='contact_info'>Contact Info</label>
          <input id="contact" style={{width: "450px", border: "none"}} defaultValue={this.props.bountyData.contact}></input>
          <label style={{fontSize: "12px", display: "block"}} htmlFor='contract_code'>Associated Files</label>
          <input id='contract_code' type="file" name="file" onChange={this.props.onHandleCaptureEditFile} style={{width: "0px", display: "block", border: "0px", color: "white", height: "0px", padding: "0px", margin: "0px"}}/>
          <div style={{width: "455px", display: "block", border: "1px solid white", color: "white", height: "20px", padding: "7.5px", paddingTop: "6px", paddingLeft: "4px", borderRadius: "4px", marginBottom: "15px"}}>
            <label htmlFor="contract_code" style={{backgroundColor: "white", color: "#122134", padding: "3px 15px", fontWeight: "700", borderRadius: "4px", marginTop: "-1px"}}> Upload </label>
            <span style={{float: "right", marginRight: "30px"}}> {fileName} </span>
          </div>
          <label style={{fontSize: "12px"}} >Bounty Category</label>
          <Select multi simpleValue disabled={this.props.disabled} value={this.props.selectedValue} placeholder="Select task categories" options={CATEGORIES} onChange={this.props.onHandleChangeSelected} style={{width: "470px", marginBottom: "15px"}}/>
        <button type='submit' className='AddBtn' style={{width: "100%", backgroundColor: "#16e5cd", border:"0px", color: "#152639"}}>Submit Edits</button>
      </form>
      </div>
    )
  }
}

export default EditForm
