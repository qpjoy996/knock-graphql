import React from 'react';
import {withRouter} from 'react-router-guard';
import {withApollo} from 'react-apollo';

import {MartProvider} from "states/context/MartContext";
import Swiper from "./Swiper";

class Mart extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <>
        <MartProvider>
          <Swiper/>
        </MartProvider>
      </>
    )
  }
}

export default withApollo(withRouter(Mart));
