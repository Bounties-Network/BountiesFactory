import React, { Component } from 'react'
import './ContractList.css'

import ContractCard from 'components/ContractCard/ContractCard'
import Halogen from 'halogen';
import SvgDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import SvgUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';

class ContractList extends Component {
  constructor(props) {
    super(props)
  }


  render() {

    var sortByValue = this.props.sortBy === "Value";
    var sortByCreated = this.props.sortBy === "Created";
    var sortByExpiry = this.props.sortBy === "Expiry";

    var givenList = this.props.list;

    var prices = this.props.prices;

    var contractsList;
    var acc = this.props.acc;
    if (this.props.list){
      var handleAddCategory = this.props.handleAddCategory;
      contractsList = givenList.map(function (contract, i){
        console.log("contract.tokenSymbol", contract.tokenSymbol);
        return (
        <ContractCard data={contract.bountyData}
                      title={contract.title}
                      categories={contract.data_categories}
                      contractAddress={contract.contractAddr}
                      bountyAddress={contract.bountyAddr}
                      contractHash={contract.hash}
                      contractAuthor={contract.issuer}
                      issuerContact={contract.issuerContact}
                      attestations={contract.attestations}
                      key={i}
                      shouldOpen={contract.shouldOpen}
                      value={contract.fulfillmentAmount}
                      stage={contract.stage}
                      issuer={contract.issuer}
                      mine={contract.mine}
                      acc={acc}
                      balance={contract.balance}
                      tokenDetails={contract.tokenDetails}
                      bountyId={contract.bounty_id}
                      symbol={contract.tokenSymbol}
                      deadline={contract.deadline}
                      numFul={contract.numFul}
                      dateString={contract.dateString}
                      handleAddCategory={handleAddCategory}
                      price={prices[contract.tokenSymbol? contract.tokenSymbol:"ETH"]}
                      stage={contract.stage}
                      version={"v1"}
                      usdValue={contract.usd_price}
                      numFul={contract.fulfillment_count}
                      decimals={contract.tokenDecimals}
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
                  color: "rgba(36,61,81, 1)",
                  marginLeft: "15px"}}> SORT BY: </p>
      <p onClick={this.props.handleToggleSort.bind(this, "Value")}
      style={{display: "inline-block",
                float: "left",
                fontSize: "12px",
                fontWeight: "600",
                marginTop: "0px",
                marginBottom: "5px",
                color: (sortByValue? "rgb(243, 243, 243)": "rgba(36,61,81, 1)") ,
                marginLeft: "15px",
                border: "1px solid",
                padding: "0px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                borderColor: (sortByValue?  "rgba(36,61,81, 1)" : "rgba(36,61,81, 1)"),
                backgroundColor: (sortByValue?  "rgba(36,61,81, 1)" : "rgba(140, 152, 153, 0)"),
                position: "relative",
                paddingRight: sortByValue?  "20px" : "10px"}}> Value
                {

                  this.props.descending? <SvgDown style={{color: "rgba(243,243,243, 1)" , float: "right", position: "absolute", marginTop: "-1px", width: "20px", height: "20px", display: !sortByValue?  "none" : ""}}/>:
                                              <SvgUp style={{color: "rgba(243,243,243, 1)" , float: "right", position: "absolute", marginTop: "-2px", width: "20px", height: "20px", display: !sortByValue?  "none" : ""}}/>

                }</p>
      <p onClick={this.props.handleToggleSort.bind(this, "Created")}
      style={{display: "inline-block",
                float: "left",
                fontSize: "12px",
                fontWeight: "600",
                marginTop: "0px",
                marginBottom: "5px",
                cursor: "pointer",
                color: (sortByCreated? "rgb(243, 243, 243)": "rgba(36,61,81, 1)") ,
                marginLeft: "15px",
                border: "1px solid",
                padding: "0px 10px",
                borderRadius: "4px",
                borderColor: (sortByCreated?  "rgba(36,61,81, 1)" : "rgba(36,61,81, 1)") ,
                backgroundColor: (sortByCreated?  "rgba(36,61,81, 1)" : "rgba(140, 152, 153, 0)"),
                position: "relative",
                paddingRight: sortByCreated?  "20px" : "10px"}}> Creation
                {

                  this.props.descending? <SvgDown style={{color: "rgba(243,243,243, 1)" , float: "right", position: "absolute", marginTop: "-1px", width: "20px", height: "20px", display: !sortByCreated?  "none" : ""}}/>:
                                              <SvgUp style={{color: "rgba(243,243,243, 1)" , float: "right", position: "absolute", marginTop: "-2px", width: "20px", height: "20px", display: !sortByCreated?  "none" : ""}}/>

                }</p>
      <p onClick={this.props.handleToggleSort.bind(this, "Expiry")}
      style={{display: "inline-block",
                float: "left",
                fontSize: "12px",
                fontWeight: "600",
                marginTop: "0px",
                marginBottom: "5px",
                color: (sortByExpiry? "rgb(243, 243, 243)": "rgba(36,61,81, 1)"),
                marginLeft: "15px",
                cursor: "pointer",
                border: "1px solid",
                padding: "0px 10px",
                borderRadius: "4px",
                borderColor: (sortByExpiry?  "rgba(36,61,81, 1)" : "rgba(36,61,81, 1)") ,
                backgroundColor: (sortByExpiry?  "rgba(36,61,81, 1)" : "rgba(140, 152, 153, 0)"),
                position: "relative",
                paddingRight: sortByExpiry?  "20px" : "10px"}}> Expiry
                {

                  this.props.descending? <SvgDown style={{color: "rgba(243,243,243, 1)" , float: "right", position: "absolute", marginTop: "-1px", width: "20px", height: "20px", display: !sortByExpiry?  "none" : ""}}/>:
                                              <SvgUp style={{color: "rgba(243,243,243, 1)" , float: "right", position: "absolute", marginTop: "-2px", width: "20px", height: "20px", display: !sortByExpiry?  "none" : ""}}/>
                }</p>

      </div>

      {this.props.loading &&
        <div style={{width: "100%"}}>
          <div style={{marginLeft: "296px", marginTop: "60px", overflow: "hidden", }}>
          <Halogen.ScaleLoader color={"#16e5cd"} />
          </div>
        </div>
      }
        {contractsList}
        {!this.props.loading && error}
        {!this.props.loading && !this.props.loadingMore && this.props.next &&

          <a onClick={this.props.handleGetMore} style={{color: "rgb(25, 55, 83)", margin: "0 auto", cursor: "pointer"}}> SEE MORE...</a>
        }
        {this.props.loadingMore &&
          <div style={{width: "100%"}}>
            <div style={{marginLeft: "296px", marginTop: "10px", overflow: "hidden", }}>
            <Halogen.ScaleLoader color={"#16e5cd"} />
            </div>
          </div>
        }
      </div>
    )
  }
}

export default ContractList
