import React, { Component } from 'react'
import './App.css'

import AppContainer from 'components/AppContainer/AppContainer'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

const muiTheme = getMuiTheme({
});

class App extends Component {
  render () {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div className="App">
          <AppContainer web3={this.props.web3} />
        </div>
      </MuiThemeProvider>
    )
  }
}

export default App
