import React, {Component} from 'react';
import {withRouter} from 'react-router-guard';
import {withApollo} from 'react-apollo';

import './style.scss'

class EditLandingIndex extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const {children} = this.props;
    return (
      <>
        {children}
      </>
    )
  }
}

export default withApollo(withRouter(EditLandingIndex));
