import React from 'react';
import {Link, withRouter} from 'react-router-guard';

import {_historyHandler, importAll} from "utils";

class NavTop extends React.Component {
    constructor(props) {
        super(props)
    }

    navBack = (e) => {
        const {
            history
        } = this.props;
        _historyHandler({
            step: 'last',
            history
        })
    }

    navNext = (e) => {
        const {
            history
        } = this.props;

        _historyHandler({
            step: 'next',
            history
        })
    }

    render() {
        const webpackContext = require.context('assets-lobby/img/landing', false, /\.(png|jpe?g|svg)$/);
        const images = importAll(webpackContext);

        const {
            text,
            show
        } = this.props;

        return (
            <div className="p-nav-header">
                {
                    (show == 'both'|| show == 'left') ? (<img className="p-nav-header_l" src={images['nav-left.png']} onClick={(e) => this.navBack(e) }/>) : (<></>)
                }

                <div className="p-nav-header_m">
                    {text}
                </div>

                {
                    (show == 'both'|| show == 'right') ? (<img className="p-nav-header_r" src={images['nav-left.png']} onClick={(e) => this.navNext(e)} />) : (<></>)
                }
            </div>
        )
    }
}

export default withRouter(NavTop);
