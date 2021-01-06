import React from 'react';
import {importAll} from "utils";

class BtnBack extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {goBack} = this.props;
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    return (
      <div className="arrows-back" onClick={goBack} >
        <img src={images['Icon_Back.png']} alt="返回" />
      </div>
    )
  }
}

export default BtnBack;
