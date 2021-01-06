import React from 'react';
import { DropTarget } from 'react-dnd';
import { isEqual } from 'lodash';
import { importAll, _historyHandler } from "utils";
import ItemTypes from './ItemTypes';

class FolderDustbin extends React.Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        let returnObj = {};
        if (isEqual(prevState.isEditing, nextProps.isEditing)) {

        } else {
            let isEditing = nextProps.isEditing;
            // Object.assign(returnObj, { isEditing });
            console.log('Object assigned1', isEditing);
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
            index,
            canDrop, isOver, allowedDropEffect, connectDropTarget, assetPosition
        } = this.props;

        const { asset, isEditing } = this.state;
        const { storageID, name } = asset;        

        const isActive = canDrop && isOver;
        let backgroundColor = '#222';
        if (isActive) {
            backgroundColor = 'darkgreen';
        } else if (canDrop) {
            backgroundColor = 'darkkhaki';
        } 

        return connectDropTarget(
            <div className="disk-dustbin" style={{
                position: assetPosition,
                backgroundColor
            }}>
                <div className="folder-container__img">
                    <img src={images['folder.png']} />
                </div>

                <div className="folder-name">
                    <div style={{
                        display: isEditing ? 'none' : 'block'
                    }}>{name}</div>
                </div>
            </div>
        )
    }
}

export default DropTarget(
    ItemTypes.ASSET,
    {
        drop: ({ allowedDropEffect, asset, func }) => {
            return ({
                name: `${allowedDropEffect} Dustbin`,
                allowedDropEffect,
                func,
                asset
            })
        },
    },
    (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    })
)(FolderDustbin);