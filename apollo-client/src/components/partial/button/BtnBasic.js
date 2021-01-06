import React from 'react';
import { importAll, charCodeLen } from "utils";

class BtnBasic extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    const { type, okText, loading, disabled, onClick, className } = this.props;
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const types = type || 'null';
    const okTexts = okText || 'null';
    const loadings = loading || false;
    // let textCode =
    //   type === "bottom" ? 15
    //     : type === "small" ? 4 : ''
    return (
      <div className={`btn-basic ${className}`}>
        {
          ['bottom', 'small', 'modal'].indexOf(types) > -1 ? (
            <div className={`btn-basic-${types}`}>
              <button className={`${loadings || disabled ? 'btn-loading' : ''} ${disabled ? 'btn-disabled' : ''}`}
                onClick={onClick}
              >
                {
                  loadings || disabled ? <img src={images['loading.png']} alt="img" /> : null
                }
                <span className={`${charCodeLen(okTexts) >= 15 ? 'btn-text' : ''} ${types === 'modal' && loadings ? 'display-none' : ''}`}>{okText}</span>
              </button>
            </div>
          ) : null
        }
      </div>
    )
  }
}

export default BtnBasic;
