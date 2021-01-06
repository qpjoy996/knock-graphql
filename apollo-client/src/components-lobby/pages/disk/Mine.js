import React from 'react';
import { isEqual, debounce } from 'lodash';
import { DragSource } from 'react-dnd';
import { importAll, _historyHandler } from "utils";
import ItemTypes from './ItemTypes';

class Mine extends React.Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        let returnObj = {};
        if (isEqual(prevState.isEditing, nextProps.isEditing)) {

        } else {
            let isEditing = nextProps.isEditing;
            Object.assign(returnObj, { isEditing });
            console.log('Object assigned1', isEditing);
        }

        if (nextProps.folder && !(isEqual(prevState.folder, nextProps.folder))) {
            const folder = nextProps.folder;
            console.log('Object assigned2', folder.storageID);
            Object.assign(returnObj, { folder });
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
            folder: {
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
            func, index,
            folderPosition,
            isDragging, connectDragSource
        } = this.props;
        const { folder, isEditing } = this.state;
        const { storageID, name } = folder;

        const style = isDragging ? { opacity: 0.4 } : { opacity: 1 };

        return connectDragSource(
            <div className="folder-container" style={{
                position: folderPosition,
                ...style
            }}>
                <div className="folder-container__img">
                    <img src={images['folder.png']} />
                </div>
                <div className="folder-name">
                    <input
                        style={{
                            display: isEditing ? 'block' : 'none'
                        }}
                        placeholder="fill folder name"
                        value={name || ''}
                        onChange={e => {
                            func._changeName(e.target.value, index)
                        }}
                        ref={(input) => { this.nameInput = input; }}
                        onBlur={e => {
                            const that = this;
                            func._blurInput(e.target.value, index)
                        }}
                        onKeyDown={(e) => {
                            func._handleKeyDown(e, index, this.nameInput);
                        }}
                    />

                    <div style={{
                        display: isEditing ? 'none' : 'block'
                    }}
                        onClick={e => {
                            func._toggleIsEditing(folder);
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
    ItemTypes.FOLDER,
    {
        beginDrag: props => {
            const func = props.func;
            const index = props.index;
            const folder = props.folder;
            console.log(func, index, props, ' - - this is beginDrag');
            func._changeMovingFolder({
                storageID: 0,
                index: index,
                position: 'absolute'
            })
            return { ...folder }
        },
        endDrag(props, monitor) {
            const item = monitor.getItem();
            const dropResult = monitor.getDropResult();          

            const func = props.func;
            const index = props.index;
            func._changeMovingFolder({
                storageID: 0,
                index: index,
                position: 'relative'
            })

            if (dropResult) {
                console.log('endDrag dropResult:', dropResult);
            }
        },
    },
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    })
)(Mine);