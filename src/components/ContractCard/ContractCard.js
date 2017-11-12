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



class ContractCard extends Component {
  render() {
    var categories = [];
    if (this.props.data.categories){
      for (var i = 0; i < this.props.data.categories.length; i++){
        categories.push(
          <Chip style={{margin: "4px 9px 0px 0px", float: "left", border: "1px solid rgba(22, 229, 205, 0.25)", backgroundColor: "rgba(0, 126, 255, 0)", height: "20px"}}
                labelStyle={{color: "#adbbbc", fontSize: "11px", marginTop: "-6px"}}
                key={this.props.data.categories[i]}>
            {this.props.data.categories[i]}
          </Chip>
        );
      }
    }

    var reward = "" + this.props.value;
    var url = ("/bounty/" + this.props.bountyId);
//
    return (
      <div style={{float: "left", display: "block", width: "630px", marginBottom: "15px", display: "flex"}}>
        <div style={{width: "560px", marginBottom: "0px",boxShadow: "none", borderRadius: "0", padding: "15px", backgroundColor: "#12293f", color: "white", border: "1px solid #16e5cd", borderWidth: "0 0 0 1px", display: "flex", justifyContent: "center", alignItems: "center"}} className="ContractCard">

          <div style={{float: "left", display: "inline-block", width: "430px", padding: "5px"}}>
            <a style={{color: "white", textDecoration: "none"}} href={url}><h4 style={{margin: "0px", width: "360px", marginBottom: "2px"}}> {this.props.data.title}</h4></a>
            <div style={{display: "block", width: "440px", overflow: "hidden"}}>
            <p style={{ fontSize: "12px", margin: "6px 0px", float: "left", display: "inline-block"}}>
              <b style={{color: "#FFDE46", fontWeight: "500"}}>Issuer:  </b>
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


            <p style={{ fontSize: "12px",margin: "2.5px 0px", float: "left", display :"inline-block"}}><b style={{color: "#adbbbc", fontWeight: "200"}}>BALANCE </b> {" "+this.props.balance + " " + this.props.symbol}</p>
            <p style={{ fontSize: "12px", margin: "2.5px 0px", marginLeft:" 15px", float: "left", display :"inline-block"}}><b style={{fontWeight: "200"}}>{this.props.numFul}</b><b style={{color: "#adbbbc", fontWeight: "200", marginLeft: "5px"}}>{this.props.numFul===1? " SUBMISSION   ":" SUBMISSIONS   "}</b>

            </p>
            <div style={{display: "block", overflow: "hidden", float: "left", width: "100%"}}>
              {categories}
            </div>

          </div>
          <div style={{float: "right", marginTop: "0px"}}>

            <div style={{overflow: "hidden", display: "block",  width: "120px",}}>
            <h1 style={{textAlign: "center", marginTop: "0px", marginBottom: "0px", color: "#ffFFFF", fontSize: reward.length > 6? "24px":"28px"}}>{reward}</h1>
            <h5 style={{ fontSize: "17px", width: "100%", textAlign: "center", marginTop: "0px", marginBottom: "0px", color: "#FFDE46"}}>{this.props.symbol? this.props.symbol : 'ETH'}</h5>
            <h5 style={{ fontSize: "13px", width: "100%", textAlign: "center", marginTop: "0px", marginBottom: "0px", color: "#8C9899", fontWeight: "200"}}>PRIZE</h5>
            <h5 style={{ fontSize: "11px", width: "100%", textAlign: "center", marginTop: "10px", marginBottom: "0px", color: "#d0d0d0", fontWeight: "200"}}>{this.props.dateString}</h5>

            </div>
          </div>

        </div>
          <a style={{}} href={url}>
            <div className={"SideArrow"} style={{float: "right", display: "flex", justifyContent: "center", alignItems: "center", width: "39px",   color: "#16e5cd", textAlign: "right", height: "100%"}}>
              <SvgArrow style={{color: "#16e5cd", fontSize: "44px", display: "inline-block"}}/>
            </div>
          </a>
        </div>
    )
  }
}

export default ContractCard
