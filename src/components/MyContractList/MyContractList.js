import React, { Component } from 'react'
import './MyContractList.css'

import MyContractCard from 'components/MyContractCard/MyContractCard'
import Halogen from 'halogen';

class MyContractList extends Component {
  render() {
    var contractsList;
    var acc = this.props.acc;
    if (this.props.list){
      contractsList = this.props.list.map(function (contract, i){
        return (
        <MyContractCard data={contract.bountyData}
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
                      />
        );
      });
    }
    var error;
    if (this.props.list.length === 0){
      error = (<p style={{fontSize: "12px", color: "#FFDE46", textAlign: "center", width: "100%"}}>You have not created any bounties yet!</p>)
    }
    return (
      <div className='ContractList'>
      <h3 style={{fontFamily: "Open Sans", marginTop: "31px", marginBottom: "31px", textAlign: "center", color: "white", width: "100%"}}>My Bounties</h3>
      {this.props.loading &&
        <div style={{width: "100%"}}>
          <div style={{marginLeft: "100px", marginTop: "60px", overflow: "hidden", }}>
          <Halogen.ScaleLoader color={"#f52a34"} />

          </div>
          <p style={{fontSize: "12px", textAlign: "center", color: "#FFDE46"}}> Loading from the blockchain... </p>
        </div>
      }
        <div style={{ backgroundColor: "rgba(10, 22, 40, 0.75)"}}>
        {contractsList}

        </div>
        {!this.props.loading &&error}
      </div>
    )
  }
}

export default MyContractList
