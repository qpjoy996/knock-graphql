import React from 'react';
import {withRouter} from 'react-router-guard';
import {withApollo} from 'react-apollo';


import {importAll, _historyHandler} from "utils";

class Asset extends React.Component {
    state = {
        asset: null,
        active: false,

        hovering: false
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.asset || nextProps.active) {
            return {
                asset: nextProps.asset,
                active: nextProps.active
            }
        }
        return null
    }

    constructor(props) {
        super(props);
    }

    _downloadAsset = (e, asset) => {
        if (window.qtJSON) {
            let json = {
                type: 'emit',
                name: 'download',
                cb: function () {
                    // return asset.id;
                    return JSON.stringify({
                        id: asset.id,
                        type: asset.type
                    });
                }
            };
            window.qtJSON(json);
        } else {
            alert('no asset');
        }
    }

    _addAsset = (e, asset) => {
        if (window.qtJSON) {
            let json = {
                type: 'emit',
                name: 'add',
                cb: function () {
                    // return asset.id;
                    return JSON.stringify({
                        id: asset.id,
                        type: asset.type,
                        asset: asset
                    });
                }
            };
            window.qtJSON(json);
        } else {
            alert('no asset');
        }
    }

    _gotoDetail = (e, asset) => {
        const {
            history
        } = this.props;
        e.stopPropagation();
        if (window.qtJSON) {
            let json = {
                type: 'emit',
                name: 'detail',
                cb: function () {
                    return JSON.stringify({
                        id: asset.id,
                        type: asset.type,
                        url: `${asset.id}`
                    });
                }
            };
            window.qtJSON(json);
        } else {
            _historyHandler({jump: `/mart/assets/${asset.id}`, history});
        }
    }

    _handleClickDL = (e, asset) => {
        // e.stopPropagation();
        this._downloadAsset(e, asset);
    }

    _handleClickAdd = (e, asset) => {
        // e.stopPropagation();
        this._addAsset(e, asset);
    }

    dragStart = (e, asset) => {
        this.props._handleAssetsClick(e, asset)
        console.log('drag start!',asset)
        if (window.qtJSON) {
            let json = {
                type: 'emit',
                name: 'dragStart',
                cb: function () {
                    return JSON.stringify({
                        id: asset.id,
                        type: asset.type,
                        url: `${asset.id}`
                    });
                }
            };
            
            window.qtJSON(json);
        } else {
            // console.log('dragStart');
        }
    }

    dragEnd = (e, asset) => {
        console.log('drag end',asset)
        if (window.qtJSON) {
            let json = {
                type: 'emit',
                name: 'dragEnd',
                cb: function () {
                    return JSON.stringify({
                        id: asset.id,
                        type: asset.type,
                        url: `${asset.id}`
                    });
                }
            };
            window.qtJSON(json);
        } else {
            // console.log('dragEnd');
        }
    }

    render() {
        const webpackcontext = require.context('assets-lobby/img/mart', false, /\.(png|jpe?g|svg)$/);
        const images = importAll(webpackcontext);

        const {
            asset,
            active,
            hovering
        } = this.state;

        const {
            _handleAssetsClick
        } = this.props;

        let assetThumbnailURL = '';
        if (asset.thumbnailURLs && asset.thumbnailURLs[0]) {
            assetThumbnailURL = asset.thumbnailURLs[0];
        } else {
            assetThumbnailURL = '';
        }

        return (
            <div className={`no-select assets_list--item  ${active ? 'active' : ''}`} draggable="true"
                 onDragStart={(e) => this.dragStart(e, asset)} onDragEnd={(e) => this.dragEnd(e, asset)}>
                <div className="item-content_img"
                >
                    <div className="item-content_img-inner"
                         style={{backgroundImage: `url(${assetThumbnailURL})`}}
                         onClick={(e) => _handleAssetsClick(e, asset)}
                    ></div>
                </div>
                <div className="item-content--bottom">
                    <div className="item-content_text">
                        {
                            asset.name
                        }
                    </div>

                    <div className="a-btn detail"

                         onClick={(e) => this._gotoDetail(e, asset)}>
                        Details
                    </div>

                    {/* <div className="a-btn detail" onClick={(e) => this._handleClickDL(e, asset)}>
                        Download
                    </div> */}

                    <div className="a-btn detail" onClick={(e) => this._handleClickAdd(e, asset)}>
                        Add
                    </div>
                </div>
            </div>
        )
    }
}

export default withApollo(withRouter(Asset));
