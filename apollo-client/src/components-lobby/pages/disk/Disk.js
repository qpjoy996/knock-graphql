import React from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { Tree, Icon, Switch } from 'antd';
import { importAll } from "utils";
import { DiskConsumer } from 'states/context/DiskContext';

import FilterBox from './FilterBox';
import Search from './Search';
import Folder from './Folder';
import FolderDustbin from './FolderDustbin';
import Mine from './Mine';
import MineDustbin from './MineDustbin';
import Favor from './Favor';
import FavorDustbin from './FavorDustbin';

import DiskTree from './DiskTree';

const { TreeNode } = Tree;

const MENU_DISK = 'MENU_DISK';
const MENU_FOLDER = 'MENU_FOLDER';

class Disk extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showLine: true,
            showIcon: true,
        }
    }

    handleClick = (e, data, cb) => {
        if (cb) {
            cb();
        }
    }

    onShowLineChange = showLine => {
        this.setState({ showLine });
    }

    onShowIconChange = showIcon => {
        this.setState({ showIcon });
    }
    renderTreeNodes = (data, imgSrc) =>
        data.map(item => {
            let key = item.storageID;
            let title = item.name;
            let url = (item.thumbnailURLs && item.thumbnailURLs.length) ? item.thumbnailURLs[0] : imgSrc;
            if (item.children) {
                return (
                    <TreeNode icon={<Icon type="carry-out" />} title={title} key={key} dataRef={item} className="folder">
                        {this.renderTreeNodes(item.children, imgSrc)}
                    </TreeNode>
                );
            }
            if (item.isLeaf) {
                return <TreeNode title={title} icon={<img src={`${url}`} />} key={key} {...item} dataRef={item} isLeaf className="file" />;
            }
            return <TreeNode title={title} icon={<img src={`${url}`} />} key={key} {...item} dataRef={item} className="folder"></TreeNode>;
        });

    render() {
        const webpackcontext = require.context('assets-lobby/img/disk', false, /\.(png|jpe?g|svg)$/);
        const images = importAll(webpackcontext);

        const { showLine, showIcon } = this.state;

        return (
            <>
                <DiskConsumer>
                    {
                        ({ folders = [], view = [], mine = [], favors, editingAsset, movingAsset, historyPath, treeData,
                            _changeMovingAsset,
                            _toggleIsEditing,
                            _blurInput,
                            _changeName,
                            _handleKeyDown,
                            _endDrag,
                            _endTreeDrag,
                            _doubleClickFolder,

                            newFolder,
                            toggleView,
                            createAssetFolder,
                            listAssets,
                            mvAssetToFolder,
                            historyGo,
                            loadTreeData,
                            searchDisk,
                            handleDiskKeyDown,
                            diskVal,
                            newFloders, newFavors, newMine,
                            showSearch,
                            filterDisk,
                            goBacklink,
                            visibleFilterBox,
                            delMyStorageAsset,
                            delAssetFavorite,
                            archiveAssetFavorite,
                            setAssetStatusFavor,
                        }) => {
                            if (view === 'tree') {
                                historyPath = []
                            }
                            if (showSearch) {
                                folders = newFloders
                                favors = newFavors
                                mine = newMine
                            }
                            return (
                                <>
                                    <Search
                                        historyPath={historyPath}
                                        func={{
                                            newFolder,
                                            toggleView,
                                            historyGo,
                                            searchDisk,
                                            handleDiskKeyDown,
                                            filterDisk
                                        }}
                                        diskVal={diskVal}
                                        placeholder="Search"
                                    />

                                    {
                                        view === 'tree' ? (
                                            <div>
                                                <DiskTree
                                                    treeData={treeData}
                                                    loadTreeData={loadTreeData}
                                                    func={{
                                                        _endTreeDrag
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                                <div className="disk-board-outer">
                                                    <ContextMenuTrigger id={MENU_DISK} holdToDisplay={-1}>
                                                        <div className="disk-board">
                                                            {
                                                                (!folders.length && !mine.length && !favors.length)
                                                                && (<div className="disk-info">No assets here</div>)
                                                            }
                                                            {
                                                                folders.length ? (
                                                                    folders.map((asset, index) => {
                                                                        let isEditing = (editingAsset.storageID === asset.storageID);
                                                                        let isMoving = (movingAsset.storageID === asset.storageID);
                                                                        let assetPosition = movingAsset.position;
                                                                        return (
                                                                            <ContextMenuTrigger key={asset.storageID} id={asset.storageID} holdToDisplay={-1}>
                                                                                <div className="disk-board__box" key={asset.storageID}>
                                                                                    <Folder asset={asset}
                                                                                        // index={index}
                                                                                        assetPosition={isMoving ? 'relative' : assetPosition}
                                                                                        isMoving={isMoving}
                                                                                        isEditing={isEditing}
                                                                                        func={{
                                                                                            _changeMovingAsset,
                                                                                            _toggleIsEditing,
                                                                                            _blurInput,
                                                                                            _changeName,
                                                                                            _handleKeyDown,
                                                                                            _endDrag,
                                                                                            _doubleClickFolder
                                                                                        }} />
                                                                                    <FolderDustbin
                                                                                        asset={asset}
                                                                                        // index={index}
                                                                                        assetPosition={isMoving ? 'absolute' : (assetPosition === 'absolute' ? 'relative' : 'absolute')}
                                                                                        isMoving={isMoving}
                                                                                        allowedDropEffect="any"
                                                                                        isEditing={isEditing}
                                                                                    />
                                                                                </div>
                                                                                <ContextMenu id={asset.storageID} className="rightKeyBtn">
                                                                                    <MenuItem onClick={(e, data, c) => {
                                                                                        delMyStorageAsset([asset.storageID])
                                                                                    }} data={{ storageID: asset.storageID }}>Delete</MenuItem>
                                                                                    {/* <MenuItem onClick={this.handleClick} data={{ item: 'nested item 2' }}>Nested Menu Item 2</MenuItem>
                                                                                    <MenuItem divider />
                                                                                    <MenuItem onClick={this.handleClick} data={{ item: 'nested item 3' }}>Nested Menu Item 3</MenuItem>  */}
                                                                                </ContextMenu>
                                                                            </ContextMenuTrigger>
                                                                        )
                                                                    })
                                                                ) : null
                                                            }
                                                            {
                                                                mine.length ? (
                                                                    mine.map((asset, index) => {
                                                                        if (asset.storageTypes.includes(3)) {
                                                                            return null
                                                                        }
                                                                        let isEditing = (editingAsset.storageID === asset.storageID);
                                                                        let isMoving = (movingAsset.storageID === asset.storageID);
                                                                        let assetPosition = movingAsset.position;
                                                                        return (
                                                                            <ContextMenuTrigger key={asset.storageID} id={asset.storageID} holdToDisplay={-1}>
                                                                                <div className="disk-board__box" key={asset.storageID}>
                                                                                    <Favor asset={asset}
                                                                                        // index={index}
                                                                                        assetPosition={'relative'}
                                                                                        isMoving={isMoving}
                                                                                        isEditing={isEditing}
                                                                                        func={{
                                                                                            _changeMovingAsset,
                                                                                            _toggleIsEditing,
                                                                                            _blurInput,
                                                                                            _changeName,
                                                                                            _handleKeyDown,
                                                                                            _endDrag
                                                                                        }} />
                                                                                </div>
                                                                                <ContextMenu id={asset.storageID} className="rightKeyBtn">
                                                                                    {
                                                                                        asset.isAuthor ? 
                                                                                        <MenuItem onClick={(e, data, c) => {archiveAssetFavorite(asset.assetID, 'mine')}} data={{ storageID: asset.storageID }}>Archive</MenuItem> :
                                                                                        <MenuItem onClick={(e, data, c) => {delAssetFavorite(asset.assetID, 'mine')}} data={{ storageID: asset.storageID }}>Delete</MenuItem>
                                                                                    }
                                                                                    {
                                                                                        asset.isAuthor ?
                                                                                            asset.public ? 
                                                                                            <MenuItem onClick={() => setAssetStatusFavor(asset.public, asset.storageID, 'mine')} data={{}}>Make Private</MenuItem>:
                                                                                            <MenuItem onClick={() => setAssetStatusFavor(asset.public, asset.storageID, 'mine')} data={{}}>Make Public</MenuItem>
                                                                                        : null    
                                                                                    }
                                                                                </ContextMenu>
                                                                            </ContextMenuTrigger>
                                                                        )
                                                                    })
                                                                ) : null
                                                            }
                                                            {
                                                                favors.length ? (
                                                                    favors.map((asset) => {
                                                                        if (asset.storageTypes.includes(3)) {
                                                                            return null
                                                                        }
                                                                        if (asset.storageTypes.includes(2) && asset.storageTypes.includes(1)) {
                                                                            return null
                                                                        }
                                                                        let isEditing = (editingAsset.storageID === asset.storageID);
                                                                        let isMoving = (movingAsset.storageID === asset.storageID);
                                                                        let assetPosition = movingAsset.position;
                                                                        return (
                                                                            <ContextMenuTrigger key={asset.storageID } id={asset.storageID} holdToDisplay={-1}>
                                                                                <div className="disk-board__box" key={asset.storageID}>
                                                                                    <Favor asset={asset}
                                                                                        // index={index}
                                                                                        assetPosition={'relative'}
                                                                                        isMoving={isMoving}
                                                                                        isEditing={isEditing}
                                                                                        func={{
                                                                                            _changeMovingAsset,
                                                                                            _toggleIsEditing,
                                                                                            _blurInput,
                                                                                            _changeName,
                                                                                            _handleKeyDown,
                                                                                            _endDrag
                                                                                        }} />
                                                                                </div>
                                                                                <ContextMenu id={asset.storageID} className="rightKeyBtn">
                                                                                    {
                                                                                        asset.isAuthor ? 
                                                                                        <MenuItem onClick={(e, data, c) => {archiveAssetFavorite(asset.assetID, 'favors')}} data={{ storageID: asset.storageID }}>Archive</MenuItem> :
                                                                                        <MenuItem onClick={(e, data, c) => {delAssetFavorite(asset.assetID, 'favors')}} data={{ storageID: asset.storageID }}>Delete</MenuItem>
                                                                                    }
                                                                                    {
                                                                                        asset.isAuthor ?
                                                                                            asset.public ? 
                                                                                            <MenuItem onClick={() => setAssetStatusFavor(asset.public, asset.storageID, 'favors')} data={{}}>Make Private</MenuItem>:
                                                                                            <MenuItem onClick={() => setAssetStatusFavor(asset.public, asset.storageID, 'favors')} data={{}}>Make Public</MenuItem>
                                                                                        : null    
                                                                                    }
                                                                                </ContextMenu>
                                                                            </ContextMenuTrigger>
                                                                        )
                                                                    })
                                                                ) : null
                                                            }
                                                        </div>
                                                    </ContextMenuTrigger>
                                                    <ContextMenu id={MENU_DISK}>
                                                        <MenuItem onClick={(e, data) => this.handleClick(e, data, newFolder)} data={{ item: 'new_folder' }}>新建文件夹</MenuItem>
                                                    </ContextMenu>
                                                    {/* <ContextMenu id={MENU_FOLDER}>
                                                        <MenuItem onClick={(e, data, c) => {
                                                            console.log(data, c, 'delete');
                                                        }} data={{ item: 'nested item 1' }}>删除</MenuItem>
                                                        <MenuItem onClick={this.handleClick} data={{ item: 'nested item 2' }}>Nested Menu Item 2</MenuItem>
                                            <MenuItem divider />
                                            <MenuItem onClick={this.handleClick} data={{ item: 'nested item 3' }}>Nested Menu Item 3</MenuItem> 
                                                    </ContextMenu>*/}
                                                </div>
                                            )
                                    }
                                    {visibleFilterBox ? <FilterBox visible={visibleFilterBox} /> : null}
                                    <div className="icondiskBack" onClick={goBacklink}>
                                        <span>返回</span>
                                    </div>
                                </>
                            )
                        }
                    }
                </DiskConsumer>
            </>
        )
    }
}

export default Disk;