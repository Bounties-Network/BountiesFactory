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
import Blockies from 'react-blockies';


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

class ContractCard extends Component {
  render() {
    var categories = [];
    categories.push(
      <Chip style={{margin: "4px 9px 0px 0px", float: "left", border: "0px solid rgba(173, 187, 188,0.15)", backgroundColor: "rgba(173, 187, 188,0.15)", height: "20px"}}
            labelStyle={{color:  this.props.lightMode? "rgb(25, 55, 83)":"#e9e9e9", fontSize: "11px", marginTop: "-5px"}}
            key={this.props.numFul+ this.props.numFul===1? " SUBMISSION":" SUBMISSIONS"}>
        <b style={{fontWeight: "500"}}>{this.props.numFul}</b><b style={{color:  this.props.lightMode? "rgb(25, 55, 83)":"#bababa", fontWeight: "200", marginLeft: "5px"}}>{this.props.numFul===1? " SUBMISSION":" SUBMISSIONS"}</b>
      </Chip>
    );
    if (this.props.data.categories){
      for (var i = 0; i < this.props.data.categories.length; i++){
        categories.push(
          <Chip style={{margin: "4px 9px 0px 0px", float: "left", border: this.props.lightMode?  "1px solid rgba(25, 55, 83,0.5)":"1px solid rgba(22, 229, 205, 0.25)", backgroundColor: "rgba(0, 126, 255, 0)", height: "20px"}}
                labelStyle={{color:  this.props.lightMode? "rgb(25, 55, 83)":"#bababa", fontSize: "11px", marginTop: "-6px"}}
                key={this.props.data.categories[i]}
                onClick={this.props.handleAddCategory.bind(this, this.props.data.categories[i])}
                className="Chip">
            <b className="Chip" style={{fontWeight: "300", }}>{this.props.data.categories[i]}</b>
          </Chip>
        );
      }
    }

    var reward = "" + this.props.value;
    var url = ("/bounty/v"+ this.props.version+"/"+ this.props.bountyId);
console.log("stage", this.props.stage);//
    return (
      <div style={{float: "left", display: "block", width: "630px", marginBottom: "15px", display: "flex"}}>
        <div style={{width: "560px", marginBottom: "0px",boxShadow: "none", borderRadius: "0", padding: "15px", backgroundColor: this.props.lightMode? "rgb(249, 249, 249)":"#12293f", color: "white", borderLeft: this.props.lightMode? "1px solid rgb(56, 90, 116)":"1px solid #16e5cd", borderWidth: "0px 0px 0px 1px", display: "flex", justifyContent: "center", alignItems: "center"}} className="ContractCard">

          <div style={{float: "left", display: "inline-block", width: "430px", padding: "5px"}}>
            <a style={{color: this.props.lightMode? "rgb(25, 55, 83)":"white", textDecoration: "none"}} href={url}><h4 style={{margin: "0px", width: "360px", marginBottom: "2px", fontWeight: "600"}}> {this.props.data.title}</h4></a>
            <div style={{display: "block", width: "440px", overflow: "hidden"}}>
            <p style={{ fontSize: "12px", margin: "6px 0px", float: "left", display: "inline-block"}}>
              <b style={{color: this.props.lightMode?"rgb(56, 89, 115)":"#FFDE46", fontWeight: "500"}}>By:  </b>
            </p>
            <Blockies
            seed={this.props.issuer}
            size={9}
            scale={2.5}
            style={{borderRadius: "10px", display: "inline-block", float: "left"}}
            />
            <p style={{ fontSize: "12px", width: "125px", margin: "6px 0px", float: "left", display: "inline-block"}}>
              <a style={{color: "#16e5cd", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", width: "100px"}}
                  href={"/user/"+ this.props.issuer}>
                    { this.props.issuer.substring(0,6)+"..."+this.props.issuer.substring(this.props.issuer.length-4,this.props.issuer.length)}
              </a>
            </p>

            </div>
            <div style={{display: "block", overflow: "hidden", float: "left", width: "100%"}} className="chipset">
              {categories}
            </div>

          </div>
          <div style={{float: "right", marginTop: "0px"}}>

            <div style={{overflow: "hidden", display: "block",  width: "120px",}}>
            <h5 style={{ fontSize: "13px", width: "100%", textAlign: "center", marginTop: "0px", marginBottom: "0px", color: "#8C9899", fontWeight: "200"}}>PRIZE</h5>

            <h5 style={{ fontSize: "13px", width: "100%", textAlign: "center", marginTop: "0px", marginBottom: "0px", color:  this.props.lightMode? "rgb(25, 55, 83)":"white", fontSize: "24px", fontWeight: "600"}}><b style={{color: "#FFDE46", fontWeight: "200", lineHeight: "28px"}}>$</b>{numberWithCommas(parseInt((reward* this.props.price)))}</h5>

            <h1 style={{textAlign: "center", marginTop: "0px", marginBottom: "0px", color: this.props.lightMode? "#8C9899":"#d0d0d0", fontSize: "12px", fontWeight: "200"}}>{reward} {this.props.symbol? this.props.symbol : 'ETH'}</h1>

            <h5 style={{ fontSize: "11px", width: "100%", textAlign: "center", marginTop: "10px", marginBottom: "0px", color: this.props.lightMode? "#8C9899":"#d0d0d0", fontWeight: "200"}}>{this.props.dateString}</h5>

            </div>
          </div>

        </div>
          <a style={{}} href={url}>
            <div className={ this.props.lightMode? "SideArrowLight":"SideArrow"} style={{float: "right", display: "flex", justifyContent: "center", alignItems: "center", width: "39px",   color: "#16e5cd", textAlign: "right", height: "100%"}}>
              <SvgArrow style={{color: this.props.lightMode? "rgb(25, 55, 83)":"#16e5cd", fontSize: "44px", display: "inline-block"}}/>
            </div>
          </a>
        </div>
    )
  }
}

export default ContractCard
