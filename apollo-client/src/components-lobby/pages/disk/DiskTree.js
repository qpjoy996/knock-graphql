import React from 'react';
import { Tree, Icon } from 'antd';
import lodash from 'lodash'
import { importAll } from "utils";
const { DirectoryTree, TreeNode } = Tree;

class DiskTree extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showIcon: true,
            showLine: true,
            storageID: '',
            dstFolderStorageID: '',
            treeData: [
                // {
                //     title: 'parent 1',
                //     key: '0-1',
                //     children: [
                //         {
                //             title: 'leaf 1-0',
                //             key: '0-1-0',
                //         },
                //         {
                //             title: 'leaf 1-1',
                //             key: '0-1-1',
                //             isLeaf: true,
                //         },
                //     ],
                // },
                // {
                //     title: 'parent 0',
                //     key: '0-0',
                //     isLeaf: true,
                //     children: [
                //         {
                //             title: 'leaf 0-0',
                //             key: '0-0-0',
                //             // isLeaf: true,
                //         },
                //         {
                //             title: 'leaf 0-1',
                //             key: '0-0-1',
                //             isLeaf: true,
                //         },
                //     ],
                // },
            ]
        }
    }

    onSelect = (keys, event) => {
        console.log('Trigger Select', keys, event);
    };

    onExpand = () => {
        console.log('Trigger Expand');
    };

    renderTreeNodes = (data, imgSrc) =>
        data.map(item => {
            let key = item.storageID;
            let title = item.name;
            let url = (item.thumbnailURLs && item.thumbnailURLs.length) ? item.thumbnailURLs[0] : imgSrc;
            if (item.children) {
                return (
                    <TreeNode icon={(<img src={imgSrc} />)} title={title} key={key} dataRef={item} className="folder">
                        {this.renderTreeNodes(item.children, imgSrc)}
                    </TreeNode>
                );
            }
            if (item.isLeaf) {
                return <TreeNode title={title} icon={url ? (<img src={url} />) : null} key={key} {...item} dataRef={item} isLeaf className="file" />;
            }
            return <TreeNode title={title} icon={url ? (<img src={url} />) : null} key={key} {...item} dataRef={item} className="folder" />;
        });

    _dragEnd = ({ event, node }) => {
        console.log(event, node);
    }

    _dragStart = ({ event, node }) => {
        console.log(event, node);
    }

    _drop = ({ event, node, dragNode, dragNodesKeys }) => {
        const {func} = this.props;
        func._endTreeDrag({node, dragNode});
    }

    render() {
        const webpackcontext = require.context('assets-lobby/img/disk', false, /\.(png|jpe?g|svg)$/);
        const images = importAll(webpackcontext);

        const {
            showIcon,
            showLine,
        } = this.state;

        let {
            treeData,
            loadTreeData
        } = this.props;
        treeData = lodash.uniqBy(treeData, 'storageID');
        return (
            <DirectoryTree
                showIcon={showIcon}
                showLine={showLine}
                multiple
                // defaultExpandAll
                onSelect={this.onSelect}
                onExpand={this.onExpand}
                loadData={loadTreeData}
                // prefixCls={'collapse'}
                // switcherIcon={<img src={images['branch_c_r.png']} />}
                // treeData={this.state.treeData}
                className="disk-tree"
                draggable
                // onDragEnd={this._dragEnd}
                // onDragStart={this._dragStart}
                onDrop={this._drop}
            >
                {
                    this.renderTreeNodes(treeData, images['folder.svg'])
                }
            </DirectoryTree>
        )
    }
}

export default DiskTree;