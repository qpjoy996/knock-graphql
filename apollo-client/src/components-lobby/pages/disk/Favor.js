import React from 'react';
import { Tooltip } from 'antd';
import { isEqual, debounce } from 'lodash';
import { DragSource } from 'react-dnd';
import { importAll, _historyHandler } from "utils";
import ItemTypes from './ItemTypes';
const typeIcons = [
    {
      text: 'Mesh',
      bgUrl: 'new-Mesh.svg'
    },
    {
      text: 'Image',
      bgUrl: 'new-2D.svg'
    },
    {
      text: 'Archetype',
      bgUrl: 'new-Archetype.svg'
    },
    {
      text: 'Audio',
      bgUrl: 'new-Audio.svg'
    },
    {
      text: 'Script',
      bgUrl: 'new-Table.svg'
    },
]

class Favor extends React.Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        let returnObj = {};
        if (isEqual(prevState.isEditing, nextProps.isEditing)) {
            // console.log('editing same');
        } else {
            let isEditing = nextProps.isEditing;
            Object.assign(returnObj, { isEditing });
        }

        if (isEqual(prevState.isMoving, nextProps.isMoving)) {
            // console.log('moving same');
        } else {
            let isMoving = nextProps.isMoving;
            Object.assign(returnObj, { isMoving });
        }


        if (nextProps.asset && !(isEqual(prevState.asset, nextProps.asset))) {
            const asset = nextProps.asset;
            // console.log('Object assigned2', asset.storageID);
            Object.assign(returnObj, { asset });
        }

        if (JSON.stringify(returnObj) === "{}") {
            return null;
        } else {
            return returnObj;
        }
    }

    constructor(props) {
        super(props);
        this.nameInput = React.createRef();
        this.state = {
            asset: {
                storageID: 0,
                name: 'default name',
                public: null
            },
            isEditing: false,
            hovered: false,
            hoveredLock: false
        }
    }

    render() {
        const webpackcontext = require.context('assets-lobby/img/disk', false, /\.(png|jpe?g|svg)$/);
        const images = importAll(webpackcontext);

        const {
            func,
            assetPosition,
            isDragging, connectDragSource
        } = this.props;
        const { asset, isEditing, isMoving } = this.state;
        const { storageID, name, containTypes } = asset;
        let typeClassName = ''
        if (containTypes && containTypes.length && containTypes.length > 0) {
            typeClassName = typeIcons[containTypes[0] - 1].text
        }
        const style = isDragging ? { opacity: 0.4 } : { opacity: 1 };
        return connectDragSource(
            <div className="folder-container" style={{
                position: assetPosition,
                ...style
            }}>
                <div className="folder-container__img">
                    <div className="imgBox">
                        <img src={asset.thumbnailURLs && asset.thumbnailURLs[0] || ''} />
                        <Tooltip
                            placement="bottom" 
                            title={typeClassName}
                            trigger="hover"
                            color="#333"
                            overlayStyle={{
                                fontSize: '12PX'
                            }}
                            visible={this.state.hoverType}
                            onVisibleChange={(visible) => this.setState({hoverType: visible})}
                        >
                            <span className={`icon ${typeClassName}`}></span>
                        </Tooltip>
                    </div>
                    
                </div>
                <div className="folder-name">
                    <div
                        className="nameBox"
                        style={{
                            display: isEditing ? 'none' : 'block'
                        }}
                        onClick={e => {
                            // func._toggleIsEditing(asset);
                            // setTimeout(() => {
                            //     this.nameInput.focus();
                            // }, 300);
                        }}>
                            {asset.isAuthor ? 
                                asset.public ? 
                                    <Tooltip
                                        placement="bottom" 
                                        title='Public Cloud'
                                        trigger="hover"
                                        color="#333"
                                        overlayStyle={{
                                            fontSize: '12PX'
                                        }}
                                        visible={this.state.hoveredLock}
                                        onVisibleChange={(visible) => this.setState({hoveredLock: visible})}
                                    >
                                        <i className="cloudIcon"></i> 
                                    </Tooltip>:
                                    <Tooltip
                                        placement="bottom" 
                                        title='Private Cloud'
                                        trigger="hover"
                                        color="#333"
                                        overlayStyle={{
                                            fontSize: '12PX'
                                        }}
                                        visible={this.state.hoveredLock}
                                        onVisibleChange={(visible) => this.setState({hoveredLock: visible})}
                                    >
                                        <i className="cloudIcon lock"></i> 
                                    </Tooltip> :
                                <Tooltip
                                    title="Cloud"
                                    color="#333"
                                    overlayStyle={{
                                        fontSize: '12PX'
                                    }}
                                    placement="bottom" 
                                    trigger="hover"
                                    visible={this.state.hovered}
                                    onVisibleChange={(visible) => this.setState({hovered: visible})}
                                >
                                    <i className="cloudIcon other"></i>
                                </Tooltip>
                            }
                            {name}</div>
                </div>
            </div>
        )
    }
}

export default DragSource(
    ItemTypes.ASSET,
    {
        beginDrag: props => {
            const func = props.func;
            const asset = props.asset;
            func._changeMovingAsset({
                ...asset,
                position: 'absolute'
            })
            if (window.qtJSON) {
                let json = {
                    type: 'emit',
                    name: 'dragStart',
                    cb: function () {
                        return JSON.stringify({
                            id: asset.assetID,
                            type: 'asset',
                            url: `${asset.assetID}`
                        });
                    }
                };
                
                window.qtJSON(json);
            }
            return { asset }
        },
        endDrag(props, monitor) {
            const item = monitor.getItem();
            const dropResult = monitor.getDropResult();
            const func = props.func;
            const { asset } = item
            func._changeMovingAsset({
                storageID: -1,
                position: 'relative'
            })
            if (window.qtJSON) {
                let json = {
                    type: 'emit',
                    name: 'dragEnd',
                    cb: function () {
                        return JSON.stringify({
                            id: asset.assetID,
                            type: 'asset',
                            url: `${asset.assetID}`
                        });
                    }
                };
                window.qtJSON(json);
            }
            if (dropResult) {
                if (dropResult.name === 'any Path') {
                    let targetStorageID = dropResult.history.id;
                    const sourceStorageID = item.asset.storageID;
                    if(targetStorageID === '/') {
                        targetStorageID = ''
                    }
                    func._endDrag({
                        storageID: sourceStorageID,
                        dstFolderStorageID: targetStorageID
                    });
                } else if (dropResult.name === 'any Dustbin') {
                    const targetStorageID = dropResult.asset.storageID;
                    const sourceStorageID = item.asset.storageID;
                    console.log('endDrag dropResult:', item.asset.name, dropResult.asset.name, func);
                    func._endDrag({
                        storageID: sourceStorageID,
                        dstFolderStorageID: targetStorageID
                    });
                }
                console.log(dropResult, ' - - -this is dropResult');

            }
        },
    },
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    })
)(Favor);