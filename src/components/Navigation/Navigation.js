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
                  <FlatButton style={{fontSize: "13px", fontWeight: "600", backgroundColor: "rgba(0,0,0,0)", border: "0px solid white", color: "white", width: "120px", float: "right", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "30px", fontFamily: "'Open Sans', 'Helvetica Neue', 'Helvetica'"}} >
                   <Link to="/" className={"buttonGlow"} style={{textDecoration: "none", color: "white"}}>
                    HOME
                   </Link>
                  </FlatButton>
                </li>
              {this.props.userAddress.length > 0 &&
                <li className="mobileShow" style={{display: "none"}}>
                  <FlatButton style={{fontSize: "13px", fontWeight: "600", backgroundColor: "rgba(0,0,0,0)", border: "0px solid white", color: "white", width: "120px", float: "right", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "270px", fontFamily: "'Open Sans', 'Helvetica Neue', 'Helvetica'"}} >
                    <Link to={"/user/" + this.props.userAddress} className={"buttonGlow"} style={{textDecoration: "none", color: "white"}}>
                      PROFILE
                    </Link>
                  </FlatButton>
                </li>
              }
              <li>
                <FlatButton style={{fontSize: "13px", fontWeight: "600", backgroundColor: "rgba(0,0,0,0)", border: "0px solid white", color: "white", width: "120px", float: "right", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "270px", fontFamily: "'Open Sans', 'Helvetica Neue', 'Helvetica'"}} >
                  <Link to={"https://join.slack.com/t/bountiesnetwork/shared_invite/enQtMzA2Mjk3MzAzODQwLTZjN2UxMmU5MWYxZTVmMmM4OGNjZDRiMDgwYTVhOTIwYmQ4MjVlMjNkZjYzOTE4MWI4OTFhOWE4ZTUzN2MyNWY"} target="_blank" className={"buttonGlow"} style={{textDecoration: "none", color: "white"}}>
                    COMMUNITY
                  </Link>
                </FlatButton>
              </li>
                <li>
                  <FlatButton style={{fontSize: "13px", fontWeight: "600", backgroundColor: "rgba(0,0,0,0)", border: "0px solid white", color: "white", width: "120px", float: "left", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "150px", fontFamily: "'Open Sans', 'Helvetica Neue', 'Helvetica'"}} >
                  <Link to="/leaderboard/" className={"buttonGlow"} style={{textDecoration: "none", color: "white"}}>
                    LEADERBOARD
                  </Link>
                  </FlatButton>
                </li>
                <li>
                  <FlatButton style={{fontSize: "13px", fontWeight: "600", backgroundColor: "rgba(0,0,0,0)", border: "0px solid white", color: "white", width: "120px", float: "right", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "30px", fontFamily: "'Open Sans', 'Helvetica Neue', 'Helvetica'"}} >
                    <Link to="/newBounty/" className={"buttonGlow"} style={{textDecoration: "none", color: "white"}}>
                      NEW BOUNTY
                    </Link>
                  </FlatButton>
                </li>

                <li className="mobileShow" style={{display: "none"}}>
                  <FlatButton style={{fontSize: "13px", fontWeight: "600", backgroundColor: "rgba(0,0,0,0)", border: "0px solid white", color: "white", width: "120px", float: "right", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "30px", fontFamily: "'Open Sans', 'Helvetica Neue', 'Helvetica'"}} >
                    <Link to="/privacyPolicy/" className={"buttonGlow"} style={{textDecoration: "none", color: "white"}}>
                      PRIVACY POLICY
                    </Link>
                  </FlatButton>
                </li>
                <li className="mobileShow" style={{display: "none"}}>
                  <FlatButton style={{fontSize: "13px", fontWeight: "600", backgroundColor: "rgba(0,0,0,0)", border: "0px solid white", color: "white", width: "120px", float: "right", height: "30px", lineHeight: "30px", position: "absolute", top: "25px", right: "30px", fontFamily: "'Open Sans', 'Helvetica Neue', 'Helvetica'"}} >
                    <Link to="/terms/" className={"buttonGlow"} style={{textDecoration: "none", color: "white"}}>
                      TERMS OF SERVICE
                    </Link>
                  </FlatButton>
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
