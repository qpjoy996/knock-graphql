import React from 'react';

class FriendIndex extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {
      children
    } = this.props;
    return (
      <div className="my-friend">
        {
          children
        }
      </div>
    )
  }
}

export default FriendIndex;
