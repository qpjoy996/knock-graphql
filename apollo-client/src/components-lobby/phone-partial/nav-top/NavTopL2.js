import React from 'react';
import {Link, withRouter} from 'react-router-guard';

import {_historyHandler, importAll} from "utils";

class NavTopL2 extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const webpackContext = require.context('assets/img/landing', false, /\.(png|jpe?g|svg)$/);
        const images = importAll(webpackContext);

        const {
            text
        } = this.props;

        return (
            <div className="p-nav-header l2">
                <img className="p-nav-header_l" src={images['nav-back.png']} />

                <div className="p-nav-header_m">
                    {text}
                </div>

                <span className="link-text">
                    注销
                </span>
            </div>
        )
    }
}

export default withRouter(NavTopL2);
