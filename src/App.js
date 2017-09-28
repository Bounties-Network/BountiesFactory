import React, { Component } from 'react'
import './App.css'

import AppContainer from 'components/AppContainer/AppContainer'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';


class App extends Component {
  render () {
    return (
      <MuiThemeProvider>
        <div className="App">
        
          <AppContainer web3={this.props.web3} />
        </div>
      </MuiThemeProvider>
    )
  }
}

export default App
