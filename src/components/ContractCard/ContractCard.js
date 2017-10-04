import React, { Component } from 'react'
import './ContractCard.css'


import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import SvgBug from 'material-ui/svg-icons/action/bug-report';
import SvgCode from 'material-ui/svg-icons/action/code';
import SvgGraphic from 'material-ui/svg-icons/image/brush';
import SvgContent from 'material-ui/svg-icons/editor/format-indent-increase';
import SvgTranslations from 'material-ui/svg-icons/action/language';
import SvgSocial from 'material-ui/svg-icons/social/share';
import SvgQuestion from 'material-ui/svg-icons/action/question-answer';
import SvgSurvey from 'material-ui/svg-icons/editor/drag-handle';
import SvgArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right';



class ContractCard extends Component {
  render() {
    var categories = [];
    if (this.props.data.categories){
      for (var i = 0; i < this.props.data.categories.length; i++){
        var icon;
        if (this.props.data.categories[i] === "Bugs"){
          icon=(<SvgBug style={{width: "10px", height: "10px"}}/>);
        } else if (this.props.data.categories[i] === "Code"){
          icon=(<SvgCode  style={{width: "10px", height: "10px"}}/>);
        } else if (this.props.data.categories[i] === "Surveys"){
          icon=(<SvgSurvey />);
        } else if (this.props.data.categories[i] === "Graphic Design"){
          icon=(<SvgGraphic  style={{width: "10px", height: "10px"}}/>);
        } else if (this.props.data.categories[i] === "Questions"){
          icon=(<SvgQuestion  style={{width: "10px", height: "10px"}}/>);
        } else if (this.props.data.categories[i] === "Social Media"){
          icon=(<SvgSocial  style={{width: "10px", height: "10px"}}/>);
        } else if (this.props.data.categories[i] === "Content Creation"){
          icon=(<SvgContent  style={{width: "10px", height: "10px"}}/>);
        } else if (this.props.data.categories[i] === "Translations"){
          icon=(<SvgTranslations  style={{width: "10px", height: "10px"}}/>);
        }
        categories.push(
          <Chip style={{margin: "5px 5px", float: "left", border: "1px solid rgba(0, 126, 255, 0.24)", backgroundColor: "rgba(0, 126, 255, 0.08)", height: "24px"}}
                labelStyle={{color: "white", fontSize: "11px", marginTop: "-4px"}}
                key={this.props.data.categories[i]}>
            <Avatar color="rgb(255, 222, 70)" icon={icon}  style={{backgroundColor: "rgba(0, 126, 255, 0.24)" , display: 'inline-block', height: "22px", width: "22px"}}/>
            {this.props.data.categories[i]}
          </Chip>
        );
      }
    }

    var reward = this.props.value;
    var url = ("/bounty/" + this.props.bountyId);
    return (
      <a href={url} style={{textDecoration: "none", padding: "0px", width: "700px"}}>
        <div style={{width: "100%", marginBottom: "15px", boxShadow: "none", borderRadius: "0", padding: "15px", backgroundColor: "rgba(10, 22, 40, 0.5)", color: "white", border: "0"}} className="ContractCard">
          <div style={{float: "left", display: "inline-block", width: "150px", marginLeft: "-7.5px", marginRight: "7.5px"}}>
            <h1 style={{textAlign: "center", marginTop: "7.5px", marginBottom: "7.5px", color: "#65C5AA"}}>{reward}</h1>
            <h5 style={{ fontSize: "12px", width: "100%", textAlign: "center", marginTop: "7.5px", marginBottom: "7.5px"}}>{this.props.symbol? this.props.symbol : 'ETH'}</h5>
            <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px", textAlign: "center"}}><b style={{color: "#FFDE46", fontWeight: "200"}}>Balance:</b> {this.props.balance}</p>
          </div>
          <div style={{float: "left", display: "inline-block", width: "510px", border: "1px solid #65C5AA", borderWidth: "0 0 0 1px", paddingLeft: "15px", marginTop: "15px"}}>
            <h4 style={{margin: "0px", width: "100%"}}> {this.props.data.title}</h4>
            <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "200"}}>Bounty Stage: </b>{this.props.stage}</p>
            <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "200"}}>Bounty deployed by:  </b><a target={"_blank"} style={{color: "#65C5AA"}} href={"https://rinkeby.etherscan.io/address/"+ this.props.issuer}>{ this.props.issuer}</a></p>
            <p style={{ fontSize: "12px", width: "100%", margin: "2.5px 0px"}}><b style={{color: "#FFDE46", fontWeight: "200"}}>Contact the bounty issuer: </b>{this.props.data.contact}</p>
          </div>
          <a style={{marginTop: "59px", color: "#65C5AA", textAlign: "right"}}> <SvgArrow style={{color: "#65C5AA", fontSize: "44px"}}/></a>
          <div style={{display: "block", margin: "0 auto"}}>
            {categories}
          </div>
        </div>
      </a>
    )
  }
}

export default ContractCard
