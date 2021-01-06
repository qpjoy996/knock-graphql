import React from 'react';

class MyGameIndex extends React.Component {
  constructor(props) {
    super(props)
  }

  render () {
    const { children } = this.props;

    return (
      <div className="game-manage">
        {children}
      </div>
    )
  }
}

export default MyGameIndex;
