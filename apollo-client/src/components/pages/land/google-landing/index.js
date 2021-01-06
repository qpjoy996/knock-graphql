import React from 'react';
import { getCachedImg } from 'utils'

class LandingIndex extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      children
    } = this.props;

    return (
      <div className="landing-container background-primary">
        {
          children
        }
      </div>
    )
  }
}

export default LandingIndex;
