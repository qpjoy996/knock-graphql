import React from 'react';
import {message} from 'antd';

message.config({
  top: 20,
  duration: 2,
  maxCount: 5,
  getContainer: () => {
    return document.getElementById('root');
  }
})

export default message;
