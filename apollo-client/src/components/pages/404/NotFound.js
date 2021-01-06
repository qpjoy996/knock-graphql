import React, { Component } from 'react'
import { importAll } from "utils";

class NotFound extends Component {

  render () {
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    return (
      <div className="not-found">
        <div>
          <span>404</span>
          <div className="img" style={{ backgroundImage: `url(${images['Pic_nothing_suit.png']})` }}></div>
          <p>No found Page...</p>
        </div>
      </div>
    )
  }
}

export default NotFound
