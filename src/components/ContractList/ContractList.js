import React, { Component } from 'react'
import './ContractList.css'

import ContractCard from 'components/ContractCard/ContractCard'
import Halogen from 'halogen';
import SvgDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import SvgUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';

class ContractList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      sortByCreated: true,
      sortByValue: false,
      sortByExpiry: false,
      createdDescending: true,
      valueDescending: true,
      expiryDescending: true,

    }

    this.handleToggleSort = this.handleToggleSort.bind(this);


  }

handleToggleSort(newSort){
var sortByCreated = false;
var sortByValue = false;
var sortByExpiry = false;
var createdDescending = true;
var valueDescending =  true;
var expiryDescending = true;

if (newSort === "Created" && this.state.sortByCreated === true){
  sortByCreated = true;
  createdDescending = !this.state.createdDescending;
} else if (newSort === "Value" && this.state.sortByValue === true){
  sortByValue = true;
  valueDescending = !this.state.valueDescending;

} else if (newSort === "Expiry" && this.state.sortByExpiry === true){
  sortByExpiry = true;
  expiryDescending = !this.state.expiryDescending;
} else if (newSort === "Created"){
  sortByCreated = true;
} else if (newSort === "Value"){
  sortByValue = true;
} else if (newSort === "Expiry"){
  sortByExpiry = true;
}
console.log("about to set state", {sortByCreated: sortByCreated,
                sortByValue: sortByValue,
                sortByExpiry: sortByExpiry,
                createdDescending: createdDescending,
                valueDescending: valueDescending,
                expiryDescending: expiryDescending});
this.setState({sortByCreated: sortByCreated,
                sortByValue: sortByValue,
                sortByExpiry: sortByExpiry,
                createdDescending: createdDescending,
                valueDescending: valueDescending,
                expiryDescending: expiryDescending});

}

  render() {

    var givenList = this.props.list;
    console.log("given list", givenList);
    givenList.sort(function(b1, b2){
      return (b1.version - b2.version);
    });
    var prices = this.props.prices;


    if (this.state.sortByCreated){
      if (this.state.createdDescending){
        givenList.sort(function(b1, b2){
          if (b2.version !== b1.version){
            return (b2.version - b1.version);
          }
          return (b2.bountyId - b1.bountyId);
        });
      } else {
        givenList.sort(function(b1, b2){
          if (b2.version !== b1.version){
            return (b1.version - b2.version);
          }
          return (b1.bountyId - b2.bountyId);
        });
      }
    } else if (this.state.sortByExpiry){
      if (this.state.expiryDescending){
        givenList.sort(function(b1, b2){
          return (b2.dateNum - b1.dateNum);
        });
      } else {
        givenList.sort(function(b1, b2){
          return (b1.dateNum - b2.dateNum);
        });
      }
    } else if (this.state.sortByValue){
      if (this.state.valueDescending){
        givenList.sort(function(b1, b2){
          return (prices[b2.symbol]*b2.value - prices[b1.symbol]*b1.value);
        });
      } else {
        givenList.sort(function(b1, b2){
          return (prices[b1.symbol]*b1.value - prices[b2.symbol]*b2.value);
        });
      }
    }

    var contractsList;
    var acc = this.props.acc;
    if (this.props.list){
      var handleAddCategory = this.props.handleAddCategory;
      var lightMode = this.props.lightMode;
      contractsList = givenList.map(function (contract, i){

        return (
        <ContractCard data={contract.bountyData}
                      contractAddress={contract.contractAddr}
                      bountyAddress={contract.bountyAddr}
                      contractHash={contract.hash}
                      contractAuthor={contract.issuer}
                      issuerContact={contract.issuerContact}
                      attestations={contract.attestations}
                      key={i}
                      shouldOpen={contract.shouldOpen}
                      value={contract.value}
                      stage={contract.stage}
                      issuer={contract.issuer}
                      mine={contract.mine}
                      numFulfillments={contract.numFulfillments}
                      acc={acc}
                      balance={contract.balance}
                      tokenDetails={contract.tokenDetails}
                      bountyId={contract.bountyId}
                      symbol={contract.symbol}
                      deadline={contract.deadline}
                      numFul={contract.numFul}
                      dateString={contract.dateString}
                      handleAddCategory={handleAddCategory}
                      price={prices[contract.symbol]}
                      lightMode={lightMode}
                      stage={contract.stage}
                      version={contract.version}
                      />
        );
      });
    }
    var error;
    if (givenList.length === 0){
      error = (<p style={{fontSize: "12px", textAlign: "center", color: "#FFDE46", width: "100%"}}>There are no bounties here!</p>)
    }
    return (
      <div className='ContractList'>
      <div style={{display: "block", width: "60%", margin: "0 auto", overflow: "hidden", marginBottom: "14px", marginTop: "14px"}}>
      <p style={{display: "inline-block",
                  float: "left",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginTop: "1px",
                  marginBottom: "5px",
                  color: this.props.lightMode? "rgba(36,61,81, 1)":"rgb(140, 152, 153)",
                  marginLeft: "15px"}}> SORT BY: </p>
      <p onClick={this.handleToggleSort.bind(this, "Value")}
      style={{display: "inline-block",
                float: "left",
                fontSize: "12px",
                fontWeight: "600",
                marginTop: "0px",
                marginBottom: "5px",
                color: this.props.lightMode? (this.state.sortByValue? "rgb(243, 243, 243)": "rgba(36,61,81, 1)") : (this.state.sortByValue? "rgba(36,61,81, 1)" : "rgb(208, 208, 208)"),
                marginLeft: "15px",
                border: "1px solid",
                padding: "0px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                borderColor: this.props.lightMode? (this.state.sortByValue?  "rgba(36,61,81, 1)" : "rgba(36,61,81, 1)") : (this.state.sortByValue?  "rgba(36,61,81, 1)" : "rgba(140, 152, 153, 0.5)"),
                backgroundColor: this.props.lightMode? (this.state.sortByValue?  "rgba(36,61,81, 1)" : "rgba(140, 152, 153, 0)"):(this.state.sortByValue?  "rgb(208, 208, 208)" : "rgba(140, 152, 153, 0)"),
                position: "relative",
                paddingRight: this.state.sortByValue?  "20px" : "10px"}}> Value
                {

                  this.state.valueDescending? <SvgDown style={{color: this.props.lightMode? "rgba(243,243,243, 1)" : "rgba(36,61,81, 1)", float: "right", position: "absolute", marginTop: "-1px", width: "20px", height: "20px", display: !this.state.sortByValue?  "none" : ""}}/>:
                                              <SvgUp style={{color: this.props.lightMode? "rgba(243,243,243, 1)" : "rgba(36,61,81, 1)", float: "right", position: "absolute", marginTop: "-2px", width: "20px", height: "20px", display: !this.state.sortByValue?  "none" : ""}}/>

                }</p>
      <p onClick={this.handleToggleSort.bind(this, "Created")}
      style={{display: "inline-block",
                float: "left",
                fontSize: "12px",
                fontWeight: "600",
                marginTop: "0px",
                marginBottom: "5px",
                cursor: "pointer",
                color: this.props.lightMode? (this.state.sortByCreated? "rgb(243, 243, 243)": "rgba(36,61,81, 1)") : (this.state.sortByCreated? "rgba(36,61,81, 1)" : "rgb(208, 208, 208)"),
                marginLeft: "15px",
                border: "1px solid",
                padding: "0px 10px",
                borderRadius: "4px",
                borderColor: this.props.lightMode? (this.state.sortByCreated?  "rgba(36,61,81, 1)" : "rgba(36,61,81, 1)") : (this.state.sortByCreated?  "rgba(36,61,81, 1)" : "rgba(140, 152, 153, 0.5)"),
                backgroundColor: this.props.lightMode? (this.state.sortByCreated?  "rgba(36,61,81, 1)" : "rgba(140, 152, 153, 0)"):(this.state.sortByCreated?  "rgb(208, 208, 208)" : "rgba(140, 152, 153, 0)"),
                position: "relative",
                paddingRight: this.state.sortByCreated?  "20px" : "10px"}}> Creation
                {

                  this.state.createdDescending? <SvgDown style={{color: this.props.lightMode? "rgba(243,243,243, 1)" : "rgba(36,61,81, 1)", float: "right", position: "absolute", marginTop: "-1px", width: "20px", height: "20px", display: !this.state.sortByCreated?  "none" : ""}}/>:
                                              <SvgUp style={{color: this.props.lightMode? "rgba(243,243,243, 1)" : "rgba(36,61,81, 1)", float: "right", position: "absolute", marginTop: "-2px", width: "20px", height: "20px", display: !this.state.sortByCreated?  "none" : ""}}/>

                }</p>
      <p onClick={this.handleToggleSort.bind(this, "Expiry")}
      style={{display: "inline-block",
                float: "left",
                fontSize: "12px",
                fontWeight: "600",
                marginTop: "0px",
                marginBottom: "5px",
                color: this.props.lightMode? (this.state.sortByExpiry? "rgb(243, 243, 243)": "rgba(36,61,81, 1)") : (this.state.sortByExpiry? "rgba(36,61,81, 1)" : "rgb(208, 208, 208)"),
                marginLeft: "15px",
                cursor: "pointer",
                border: "1px solid",
                padding: "0px 10px",
                borderRadius: "4px",
                borderColor: this.props.lightMode? (this.state.sortByExpiry?  "rgba(36,61,81, 1)" : "rgba(36,61,81, 1)") : (this.state.sortByExpiry?  "rgba(36,61,81, 1)" : "rgba(140, 152, 153, 0.5)"),
                backgroundColor: this.props.lightMode? (this.state.sortByExpiry?  "rgba(36,61,81, 1)" : "rgba(140, 152, 153, 0)"):(this.state.sortByExpiry?  "rgb(208, 208, 208)" : "rgba(140, 152, 153, 0)"),
                position: "relative",
                paddingRight: this.state.sortByExpiry?  "20px" : "10px"}}> Expiry
                {

                  this.state.expiryDescending? <SvgDown style={{color: this.props.lightMode? "rgba(243,243,243, 1)" : "rgba(36,61,81, 1)", float: "right", position: "absolute", marginTop: "-1px", width: "20px", height: "20px", display: !this.state.sortByExpiry?  "none" : ""}}/>:
                                              <SvgUp style={{color: this.props.lightMode? "rgba(243,243,243, 1)" : "rgba(36,61,81, 1)", float: "right", position: "absolute", marginTop: "-2px", width: "20px", height: "20px", display: !this.state.sortByExpiry?  "none" : ""}}/>

                }</p>

      </div>

      {this.props.loading &&
        <div style={{width: "100%"}}>
          <div style={{marginLeft: "296px", marginTop: "60px", overflow: "hidden", }}>
          <Halogen.ScaleLoader color={"#16e5cd"} />
          </div>
          <p style={{fontSize: "12px", textAlign: "center", color: "#FFDE46"}}> Loading from the blockchain... </p>
        </div>
      }
        {contractsList}
        {!this.props.loading && error}
      </div>
    )
  }
}

export default ContractList
