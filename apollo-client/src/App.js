import React from 'react';
import { RouterGuard } from 'react-router-guard';
import { ApolloProvider } from 'react-apollo';
import routes from 'routes';

import { PlatformContext } from "states/context/PlatformContext";
import { SERVER } from 'states/APP_STATE';
import { _persistCache, setStateAsync } from "utils";
import Mask from 'components/partial/modal/Mask'
import Console from 'components/partial/console/Console'

const debugBtn = {
  position: 'fixed',
  bottom: '52px',
  right: '10px',
  zIndex: '9999',
  background: 'red',
  fontSize: '15px',
  color: '#fff',
  padding: '10px 18px',
  borderRadius: '4px',
  cursor: 'pointer',
  boxShadow: '2px 2px 10px #000'
}

class App extends React.Component {

  static contextType = PlatformContext

  state = {
    client: null,
    loaded: false,
    consoleShow: false
  }

  async componentDidMount() {
    let { client } = this.context;
    await _persistCache(client);
    await setStateAsync({
      client,
      loaded: true
    }, this);
  }

  showConsole = () => {
    this.setState({
      consoleShow: true
    })
  }

  hideConsole = () => {
    this.setState({
      consoleShow: false
    })
  }


  render() {
    const {
      loaded,
      client,
      consoleShow
    } = this.state;

    if (!loaded) {
      return <div>Loading</div>
    }

    return (
      <ApolloProvider client={client}>
        <Mask visible={consoleShow} onClose={() => this.hideConsole()}>
          <Console />
        </Mask>

        {(SERVER === 'local' || SERVER === 'dev' || SERVER === 'approval' || SERVER === 'alpha') && <div style={debugBtn} onClick={() => this.showConsole()}>tConsole</div>}
        <RouterGuard config={routes}></RouterGuard>
      </ApolloProvider>
    )
  }
}

export default App;
