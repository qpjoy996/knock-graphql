import React from 'react';
import { Spin } from 'antd';

class LoadingModal extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    const { visible } = this.props;
    return (
      <div className="loading-modal">
        <Spin className='loading-spin'
          size={"large"}
          indicator={
            (<div className="data-loading client-loading"></div>)
          }
        />
      </div>
    )
  }
}

export default LoadingModal;
