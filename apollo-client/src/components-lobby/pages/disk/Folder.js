import React from 'react';
import { isEqual, debounce } from 'lodash';
import { DragSource } from 'react-dnd';
import { importAll, _historyHandler } from "utils";
import ItemTypes from './ItemTypes';

class Folder extends React.Component {

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
            },
            isEditing: false
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
        const { storageID, name } = asset;

        const style = isDragging ? { opacity: 0.4 } : { opacity: 1 };

        return connectDragSource(
            <div className="folder-container" style={{
                position: assetPosition,
                ...style
            }}>
                <div className="folder-container__img"
                    onDoubleClick={(e) => {
                        func._doubleClickFolder({
                            id: storageID,
                            name
                        });
                    }}
                >
                    <img src={images['folder.svg']} />
                </div>
                <div className="folder-name">
                    <input
                        style={{
                            display: isEditing ? 'block' : 'none'
                        }}
                        placeholder="fill folder name"
                        value={name || ''}
                        onChange={e => {
                            func._changeName({
                                name: e.target.value,
                                storageID,
                                type: 'folder'
                            })
                        }}
                        ref={(input) => { this.nameInput = input; }}
                        onBlur={e => {
                            const that = this;
                            func._blurInput({
                                name: e.target.value,
                                storageID,
                                type: 'folder'
                            })
                        }}
                        onKeyDown={(e) => {
                            func._handleKeyDown(e, this.nameInput);
                        }}
                    />

                    <div style={{
                        display: isEditing ? 'none' : 'block'
                    }}
                        onClick={e => {
                            func._toggleIsEditing(asset);
                            setTimeout(() => {
                                this.nameInput.focus();
                            }, 300);
                        }}>{name}</div>
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
            console.log(func, props, ' - - this is beginDrag');
            func._changeMovingAsset({
                ...asset,
                position: 'absolute'
            })
            return { asset }
        },
        endDrag(props, monitor) {
            const item = monitor.getItem();
            const dropResult = monitor.getDropResult();
            const func = props.func;

            func._changeMovingAsset({
                storageID: -1,
                position: 'relative'
            })


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
)(Folder);