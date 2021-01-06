import React from 'react';
import App from "App";
import BasicModal from "components/partial/modal/BasicModal";
import { PlatformConsumer } from "states/context/PlatformContext";

// platform deal with all incoming params
class Platform extends React.Component {
  render() {
    return (
      <PlatformConsumer>
        {
          ({
            client,
            basicModalOptions
          }) => {
            return client ? (
              <>
                {
                  <BasicModal visible={!!basicModalOptions} {...basicModalOptions} />
                }
                <App />
              </>
            ) : (
                <div>
                  Identifying Platform ...
                </div>
              )
          }
        }
      </PlatformConsumer>
    )
  }
}

export default Platform;
