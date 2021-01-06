import React from 'react';
import { DropTarget } from 'react-dnd';
import ItemTypes from './ItemTypes';

class DiskPath extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            history,
            func,
            index,
            canDrop,
            isOver,
            connectDropTarget
        } = this.props;

        const isActive = canDrop && isOver;
        let backgroundColor = 'inherit';
        if (isActive) {
            backgroundColor = 'darkgreen';
        } else if (canDrop) {
            backgroundColor = 'purple';
        }

        return connectDropTarget(
            <span onClick={
                () => func.historyGo({ type: 'url', id: history['id'], index })
            }
                style={{
                    backgroundColor
                }}
            >
                {
                    history['name']
                }
            </span>
        )
    }
}

export default DropTarget(
    ItemTypes.ASSET,
    {
        drop: ({ allowedDropEffect, history, func }) => {
            return ({
                name: `${allowedDropEffect} Path`,
                history,
                func
            })
        }
    },
    (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    })
)(DiskPath);