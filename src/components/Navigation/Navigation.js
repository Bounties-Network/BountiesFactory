import React, { Component } from 'react'
import './Navigation.css'

import SvgMenu from 'material-ui/svg-icons/navigation/menu';
import SvgClose from 'material-ui/svg-icons/navigation/close';

import { Link } from 'react-router';

import logo from '../AppContainer/images/logo.svg';
import logoBounties from '../AppContainer/images/logo-bounties.svg';

import FlatButton from 'material-ui/FlatButton';

import ResponsiveMenu from 'react-responsive-navbar';

class Navigation extends Component {
  render() {
    return (
      <div style={{overflow: "hidden"}} className="navBar">
        <Link to="/" style={{width: "18em", overflow: "hidden", float: "left",  position: "absolute", top: "15px", left: "30px"}}>
          <div className={"bountiesLogo mobileHidden"} style={{backgroundImage:  `url(${logoBounties})`, height: "3em", width: "18em", backgroundSize: "contain", backgroundRepeat: "no-repeat", display: "block", float: "left"}}>
          </div>
        </Link>
        <Link to="/" style={{width: "18em", overflow: "hidden", display: "block", padding: "1em 0em 1em 0em", margin: "0 auto"}}>
          <div style={{backgroundImage:  `url(${logo})`, height: "3em", width: "18em", backgroundSize: "contain", backgroundRepeat: "no-repeat", display: "block", float: "left"}}>
          </div>
        </Link>
        <span style={{backgroundSize: 'cover', backgroundRepeat: 'no-repeat', borderRadius: '50%', boxShadow: 'inset rgba(255, 255, 255, 0.6) 0 2px 2px, inset rgba(0, 0, 0, 0.3) 0 -2px 6px'}} />

        <div style={{float: "right", display: "block", height: "0px"}}>
          <ResponsiveMenu
            menuOpenButton={<SvgMenu className={"buttonGlow"} style={{color: "white", position: "absolute", right: "30px", top: "30px"}}/>}
            menuCloseButton={<SvgClose className={"buttonGlow"} style={{color: "white", position: "absolute", right: "30px", top: "30px"}}/>}
            changeMenuOn="1050px"
            largeMenuClassName="largeNav"
            smallMenuClassName="smallNav"
            menu={
              <ul>
                <li className="mobileShow" style={{display: "none"}}>
                  <FlatButton style={{backgroundColor: "rgba(0,0,0,0)", border: "0px solid white", color: "white", width: "120px", float: "right", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "30px"}} > <Link to="/" className={"buttonGlow"} style={{textDecoration: "none", color: "white"}}> Home </Link></FlatButton>
                </li>
              {this.props.userAddress.length > 0 &&
                <li>
                  <FlatButton style={{backgroundColor: "rgba(0,0,0,0)", border: "0px solid white", color: "white", width: "120px", float: "right", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "270px"}} > <Link to={"/user/" + this.props.userAddress} className={"buttonGlow"} style={{textDecoration: "none", color: "white"}}> Profile </Link></FlatButton>
                </li>
              }
                <li>
                  <FlatButton style={{backgroundColor: "rgba(0,0,0,0)", border: "0px solid white", color: "white", width: "120px", float: "left", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "150px"}} > <Link to="/leaderboard/" className={"buttonGlow"} style={{textDecoration: "none", color: "white"}}> LeaderBoard </Link></FlatButton>
                </li>
                <li>
                  <FlatButton style={{backgroundColor: "rgba(0,0,0,0)", border: "0px solid white", color: "white", width: "120px", float: "right", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "30px"}} > <Link to="/newBounty/" className={"buttonGlow"} style={{textDecoration: "none", color: "white"}}> New Bounty </Link></FlatButton>
                </li>

                <li className="mobileShow" style={{display: "none"}}>
                  <FlatButton style={{backgroundColor: "rgba(0,0,0,0)", border: "0px solid white", color: "white", width: "120px", float: "right", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "30px"}} > <Link to="/privacyPolicy/" className={"buttonGlow"} style={{textDecoration: "none", color: "white"}}> Privacy Policy </Link></FlatButton>
                </li>
                <li className="mobileShow" style={{display: "none"}}>
                  <FlatButton style={{backgroundColor: "rgba(0,0,0,0)", border: "0px solid white", color: "white", width: "120px", float: "right", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "30px"}} > <Link to="/terms/" className={"buttonGlow"} style={{textDecoration: "none", color: "white"}}> Terms of Service </Link></FlatButton>
                </li>



              </ul>
            }
          />
        </div>
      </div>
    )
  }
}

export default Navigation
