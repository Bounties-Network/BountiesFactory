import React, { Component } from 'react'
import './ContractList.css'

import ContractCard from 'components/ContractCard/ContractCard'
import Halogen from 'halogen';

class ContractList extends Component {
  render() {

    var contractsList;
    var acc = this.props.acc;
    if (this.props.list){
      var handleAddCategory = this.props.handleAddCategory;
      contractsList = this.props.list.map(function (contract, i){

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
                      />
        );
      });
    }
    var error;
    if (this.props.list.length === 0){
      error = (<p style={{fontSize: "12px", textAlign: "center", color: "#FFDE46", width: "100%"}}>There are no bounties here!</p>)
    }
    return (
      <div className='ContractList'>
      <h3 style={{fontFamily: "Open Sans", marginTop: "31px", marginBottom: "31px", textAlign: "center", color: "white", width: "100%"}}> {this.props.title}</h3>
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
