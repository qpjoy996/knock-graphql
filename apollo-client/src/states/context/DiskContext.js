import React from 'react';
import { withRouter } from 'react-router-guard';
import { withApollo } from 'react-apollo';
import update from 'immutability-helper';
import updateX from 'immutability-helper-x';
import { setStateAsync, _historyHandler } from "utils";

import {
  CREATE_ASSET_FOLDER,
  ASSET_STORAGE_LIST,
  MV_ASSET_FOLDER,
  RENAME_ASSET_FOLDER,
  ASSET_STORAGE_FOLDER_LIST,
  DEL_ASSET_FAVORITE,
  ARCHIVE_ASSET,
  DEL_MYSTORAGE_ASSETITEM_INPUT,
  GET_CATEGORIES,
  UPDATE_MYSTORE_ASSETITEM,
} from 'apollo/graphql/gql';

import AntMessage from 'components-lobby/partial/message/AntMessage';

const DiskContext = React.createContext('disk');
const { Provider, Consumer } = DiskContext;
const _ = require('deepdash')(require('lodash'));

class DiskProvider extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      view: 'other',
      treeData: [
        // { title: 'Expand to load', key: '0' },
        // {
        //   title: 'Expand to load', key: '1', children: [
        //     {
        //       title: 'child 1',
        //       key: '1-0'
        //     },
        //     {
        //       title: 'child 2',
        //       key: '1-2'
        //     },
        //     { title: 'Tree Node12', key: '21', isLeaf: true, url: 'http://davinci-testcdn.lilithgame.com/alpha/pictures/bpljjv27hv5aad262go0' },
        //     { title: 'Tree Node13', key: '22', isLeaf: true, url: 'http://davinci-testcdn.lilithgame.com/alpha/pictures/bpljjv27hv5aad262go0' },
        //   ]
        // },
        // { title: 'Tree Node', key: '2', isLeaf: true, url: 'http://davinci-testcdn.lilithgame.com/alpha/pictures/bpljjv27hv5aad262go0' },
        // { title: 'Tree Node2', key: '3', isLeaf: true, url: 'http://davinci-testcdn.lilithgame.com/alpha/pictures/bpljjv27hv5aad262go0' },
      ],
      folders: [],
      mine: [],
      favors: [],
      newFloders: [],
      newFavors: [],
      newMine: [],
      historyPath: [],
      showSearch: false,
      f: [],
      editingAsset: {
        storageID: 0,
        name: 'test1'
      },

      movingAsset: {
        storageID: 0,
        index: -1,
        name: 'moving asset',
        position: 'relative'
      },
      diskVal: '',
      _changeMovingAsset: this._changeMovingAsset,
      _toggleIsEditing: this._toggleIsEditing,
      _blurInput: this._blurInput,
      _changeName: this._changeName,
      _handleKeyDown: this._handleKeyDown,
      _endDrag: this._endDrag,
      _endTreeDrag: this._endTreeDrag,
      _doubleClickFolder: this._doubleClickFolder,

      newFolder: this.newFolder,
      toggleView: this.toggleView,
      createAssetFolder: this.createAssetFolder,
      listAssets: this.listAssets,
      mvAssetToFolder: this.mvAssetToFolder,
      historyGo: this.historyGo,
      loadTreeData: this.loadTreeData,
      searchDisk: this.searchDisk,
      handleDiskKeyDown: this.handleDiskKeyDown,
      // 过滤弹窗 --- start--
      filterDisk: this.filterDisk,
      visibleFilterBox: false,
      resTotal: 0,
      awardOptions: ['Officials'],
      awardList: [],
      categories: [],
      classies: [],
      selectedCategoriesID: [],
      selectedClassiesID: [],

      _clear: this._clear,
      showDrawer: this.showDrawer,
      onClose: this.onClose,
      awardOnChange: this.awardOnChange,
      _changeCategoriesID: this._changeCategoriesID,
      _changeClassiesID: this._changeClassiesID,
      goBacklink: this.goBacklink,
      // 过滤弹窗 --- end--
      // 云盘删除
      delMyStorageAsset: this.delMyStorageAsset,
      delAssetFavorite: this.delAssetFavorite,
      archiveAssetFavorite: this.archiveAssetFavorite,
      setAssetStatusFavor: this.setAssetStatusFavor,
    }
  }

  async componentDidMount() {
    await this.historyGo({ type: 'refresh' });
    let { nodeData } = await this.viewToTree();
    this.setState({
      treeData: nodeData,
      resTotal: nodeData.length
    })
    // 过滤弹窗 --- start--
    let categoryDT = await this.getCategoriesClassies();
    if (categoryDT.pass) {
      let assetLevelList = categoryDT.data.assetLevelList;

      let levels = assetLevelList.map((level) => {
        return level.name;
      });

      this.setState({
          categories: categoryDT.data.assetCategoryList,
          classies: categoryDT.data.assetClassList,
          levels: assetLevelList,
          awardOptions: levels,
        }, () => {
          this.getClassiesID()
        }
      );
    } else {
      this.setState({
        categories: [],
        classies: [],
        levels: [],
        awardOptions: []
      })
    }
    // 过滤弹窗 --- start--
  }

  viewToTree = async () => {
    let { folders, favors, mine } = this.state;
    let mappedFolders = folders.map(folder => {
      return {
        ...folder
      }
    });
    let mappedFavors = favors.map(favor => {
      return {
        ...favor,
        isLeaf: true
      }
    });
    let mappedMine = mine.map(mi => {
      return {
        ...mi,
        isLeaf: true
      }
    })

    return {
      nodeData: [...mappedFolders, ...mappedFavors, ...mappedMine]
    }
  }

  _changeMovingAsset = (asset) => {
    this.setState({
      movingAsset: asset
    });
  }

  _toggleIsEditing = (asset) => {
    this.setState({
      editingAsset: asset
    })
  }

  _toggleNoEditing = () => {
    this.setState({
      editingAsset: {
        storageID: 0,
        name: 'default name'
      }
    })
  }

  _blurInput = async ({ name, storageID, type } = {}) => {
    console.log('in blur')
    // const { name, storageID } = this.state.editingAsset;
    let _name = this.state.editingAsset.name;
    let _storageID = this.state.editingAsset.storageID;

    // console.log(_name, index, name, storageID, 'bbblur');

    if (!name || _name === name) {
      this._changeByName({
        name: _name,
        storageID: _storageID,
        type
      });
      this._toggleNoEditing();
      console.log('No name or same name.');
    } else {
      let res = await this.renameAsset({ storageID, name, type });
      if (res && res.pass) {
        this._changeName({ name, storageID, type });
        this._toggleNoEditing();
      } else {
        this._changeName({ name: _name, storageID: _storageID, type });
        this._toggleNoEditing();
      }
    }
  }

  _changeName = ({ name, storageID, type } = {}) => {
    let operateArr = '';
    if (type === 'folder') {
      operateArr = 'folders';
    } else if (type === 'mine') {
      operateArr = 'mine';
    } else {
      operateArr = 'favors';
    }

    let index = this.state[operateArr].findIndex(item => item.storageID === storageID);
    // console.log('changing', operateArr, index);

    let newState = update(this.state, {
      [operateArr]: {
        [index]: {
          name: { $set: name }
        }
      }
    });
    this.setState(newState);
  }
  _changeByName = ({ name, storageID, type } = {}) => {
    let operateArr = '';
    if (type === 'folder') {
      operateArr = 'folders';
    } else if (type === 'mine') {
      operateArr = 'mine';
    } else {
      operateArr = 'favors';
    }

    let index = this.state[operateArr].findIndex(item => item.storageID === storageID);
    // console.log('changing', operateArr, index);

    let newState = update(this.state, {
      [operateArr]: {
        [index]: {
          name: { $set: name }
        }
      }
    });
    this.setState(newState);
  }

  _handleKeyDown = async (e, ref) => {
    if (e.key === 'Enter') {
      ref.blur();
    }
  }

  _endDrag = async ({ storageID, dstFolderStorageID } = {}) => {
    await this.mvAssetToFolder({ storageID, dstFolderStorageID });

    await this.historyGo({ type: 'refresh' });
  }

  _endTreeDrag = async ({ node, dragNode } = {}) => {
    let dragSource = dragNode.props.dataRef;
    let dstSource = node.props.dataRef;
    let storageID = dragSource.storageID;
    let dstFolderStorageID = dstSource.storageID;
    // console.log(this.state.treeData, node.isLeaf(), dragNode.isLeaf());
    if (dstSource.storageTypes.length && dstSource.storageTypes.indexOf(3) >= 0) {
      let sourcePath, dstPath;
      _.eachDeep(this.state.treeData, (value, key, path, depth, parent, parentKey, parentPath) => {
        // console.log(key, path, depth.path);
        if (key === 'storageID') {
          if (path.storageID === storageID) {
            sourcePath = depth.path;
            // console.log(storageID, ' - - - this is source storageID', depth.path);
          }
          if (path.storageID === dstFolderStorageID) {
            dstPath = depth.path;
            // console.log(dstFolderStorageID, ' - - - this is target storageID', depth.path);
          }
        }
      });

      let treeDateCopy = this.state.treeData;
      let sourceP = sourcePath.split('.storageID')[0];
      let targetP = dstPath.split('.storageID')[0];

      // console.log(sourceP, targetP, ' - - - - - -  this is sourceP targetP');
      await this.mvAssetToFolder({ storageID, dstFolderStorageID });
      await this.historyGo({ type: "forward", id: dstFolderStorageID, name: dstSource.name })
      let { nodeData } = await this.viewToTree();
      // console.log(this.state.historyPath, nodeData, ' lalala');

      let omittedTree = _.omit(treeDateCopy, sourceP);
      let omittedTreeArr = _.toArray(omittedTree);
      // console.log(_.toArray(omittedTree), treeDateCopy, sourceP, ' - - -')
      let targetPathArr = _.toPath(targetP + '.children');
      // console.log(omittedTreeArr, targetP, targetPathArr);
      
      this.setState({
        treeData: [...updateX.$set(omittedTreeArr, targetPathArr, nodeData)]
      })
    } else {
      console.log('dropNode is not a folder');
    }
  }

  _doubleClickFolder = async ({ id, name, limitLen, skipLen } = {}) => {
    let assetsRes = await this.listFolderAssets({ id, limitLen, skipLen });
    // console.log(assetsRes, ' - - - -  this is assetsRes');

    let folders = [];
    let mine = [];
    let favors = [];
    if (assetsRes.pass) {
      for (let storage of assetsRes.assets) {
        let storageTypes = storage.storageTypes;
        // 顺序千万不能变 *****
        if (storageTypes.indexOf(3) >= 0) {
          folders.push(storage);
        } else if (storageTypes.indexOf(2) >= 0) {
          mine.push(storage);
        } else if (storageTypes.indexOf(1) >= 0) {
          favors.push(storage);
        } 
      }
      // historyPath.push(id);
      await setStateAsync({
        folders,
        favors,
        mine,
        historyPath: update(this.state.historyPath,
          { $push: [{ id, name }] }
        )
      }, this)
    }
  }

  newFolder = async () => {
    await this.createAssetFolder();
    await this.listAssets({ storageTypes: [3] });
    let { nodeData } = await this.viewToTree();
    this.setState({
      treeData: nodeData
    })
  }

  toggleView = async () => {
    this.setState({
      view: this.state.view === 'tree'? 'other': 'tree',
      historyPath: []
    }, async () => {
      await this.historyGo({ type: 'refresh' });
    })
  }

  listOnlineAssets = async ({ keyword, storageTypes, skipLen, limitLen } = {}) => {
    const { client } = this.props;
    const { selectedCategoriesID, selectedClassiesID, levelIDs } = this.state

    let obj = {
      filter: {
        keyword: keyword || '',
        categoryIDList: selectedCategoriesID,
        containTypes: selectedClassiesID,
        assetLevels: levelIDs
      },
      storageTypes: storageTypes || [3],
      skipLen: skipLen || 0,
      limitLen: limitLen || 1000
    }
    return new Promise(async (resolve) => {
      try {
        let dt = await client.query({
          query: ASSET_STORAGE_LIST,
          fetchPolicy: 'no-cache',
          variables: {
            ...obj
          },
        });
        if (dt.data) {
          return resolve({
            pass: true,
            assets: dt.data.userAssetStorageList
          })
        } else {
          AntMessage.success('List assets fail');
          return resolve({
            pass: false,
            msg: 'List assets fail'
          })
        }
      } catch (e) {
        AntMessage.error('List asset error');
        return resolve({
          pass: false,
          msg: 'List asset error'
        })
      }
    })
  }

  listFolderAssets = async ({ id, skipLen, limitLen } = {}) => {
    const { client } = this.props;
    if (!id) {
      return AntMessage.warn('No folder id.');
    }
    let obj = {
      id,
      skipLen: skipLen || 0,
      limitLen: limitLen || 1000
    }
    return new Promise(async (resolve) => {
      try {
        let dt = await client.query({
          query: ASSET_STORAGE_FOLDER_LIST,
          fetchPolicy: 'no-cache',
          variables: {
            ...obj
          },
        });
        if (dt.data && dt.data.userAssetStorageFolderList) {
          return resolve({
            pass: true,
            assets: dt.data.userAssetStorageFolderList
          })
        } else {
          AntMessage.success('List assets fail');
          return resolve({
            pass: false,
            msg: 'List assets fail'
          })
        }
      } catch (e) {
        AntMessage.error('List asset error');
        return resolve({
          pass: false,
          msg: 'List asset error'
        })
      }
    })
  }

  listAssets = async ({ keyword, storageTypes, skipLen, limitLen } = {}) => {
    let folders = this.listOnlineAssets({ storageTypes: [3] });
    let mine = this.listOnlineAssets({ storageTypes: [2] });
    let favors = this.listOnlineAssets({ storageTypes: [1] });
    let result = await Promise.all([folders, mine, favors]);

    let [folderRes, mineRes, favorRes] = result;

    if (folderRes.pass && mineRes.pass && favorRes.pass) {
    let { nodeData } = await this.viewToTree();

      await setStateAsync({
        folders: folderRes.assets || [],
        mine: mineRes.assets || [],
        favors: favorRes.assets || [],
        treeData: nodeData,
        resTotal: nodeData.length,
        historyPath: update(this.state.historyPath,
          { $set: [{ id: '/', name: 'Root' }] }
        )
      }, this);
      // if (!this.state.historyPath.length) {
      //   historyPath.push('/');
      // }
    } else {
      AntMessage.error('list assets fail');
    }
  }

  createAssetFolder = async (name) => {
    const {
      client
    } = this.props;

    if (!name) {
      let { folders } = this.state;
      let names = folders.map((folder) => {
        return folder.name;
      });

      let namePrefix = 'new folder';
      let _name = namePrefix;
      let ii = 0;

      // console.log(names);

      if (names.indexOf(_name) >= 0) {
        do {
          _name = namePrefix + (ii || '');
          ii++;
        } while (names.indexOf(_name) >= 0);
      }
      name = _name;
    }

    try {
      let dt = await client.mutate({
        mutation: CREATE_ASSET_FOLDER,
        variables: {
          input: {
            name: name
          }
        },
      });
      console.log(dt, ' - - - this is dt');
      if (dt.data && dt.data.createMyStorageAssetFolder && dt.data.createMyStorageAssetFolder.code === 0) {
        // AntMessage.success('create folder success');
        
      } else {
        AntMessage.success('create folder fail');
      }
    } catch (e) {
      AntMessage.error('create asset error');
      console.log(e, '- - - this is err');
    }
  }

  mvAssetToFolder = async ({ storageID, dstFolderStorageID } = {}) => {
    const { client } = this.props;

    return new Promise(async (resolve) => {
      try {
        let dt = await client.mutate({
          mutation: MV_ASSET_FOLDER,
          variables: {
            input: {
              storageID,
              dstFolderStorageID
            }
          },
        });
        console.log(dt, ' - - - this is dt');
        
        if (dt.data && dt.data.moveMyStorageAssetFolderItem && dt.data.moveMyStorageAssetFolderItem.code === 0) {
          // AntMessage.success('move folder success');
          resolve({
            pass: true,
            msg: 'move folder success'
          })
        } else {
          AntMessage.success('move folder fail');
          resolve({
            pass: false,
            msg: 'move folder fail'
          })
        }
      } catch (e) {
        console.log(e, '- - - this is err');
        AntMessage.error('move asset error');
        resolve({
          pass: false,
          msg: 'move asset error'
        })
      }
    });
  }

  renameAsset = async ({ storageID, name } = {}) => {
    const { client } = this.props;

    console.log(storageID, name, 'in rename asset folder');

    if (!name) {
      AntMessage.error('Please provide folder name!');
      return;
    }
    if (!storageID) {
      // alert('Please provide storageID!!')
      return;
    }

    return new Promise(async (resolve) => {
      try {
        let dt = await client.mutate({
          mutation: RENAME_ASSET_FOLDER,
          variables: {
            input: {
              storageID,
              name
            }
          },
        });
        console.log(dt, ' - - - this is dt');
        if (dt.data && dt.data.changeMyStorageAssetFolderName && dt.data.changeMyStorageAssetFolderName.code === 0) {
          // AntMessage.success('rename folder success');
          return resolve({
            pass: true,
            msg: 'rename folder success'
          })
        } else {
          AntMessage.success('rename folder fail');
          return resolve({
            pass: false,
            msg: 'rename folder fail'
          })
        }
      }
      catch (e) {
        AntMessage.error('rename asset error!');
        return resolve({
          pass: false,
          msg: 'rename asset error!'
        })
      }
    })
  }

  historyGo = async ({ type, id, name, index } = {}) => {
    let { historyPath } = this.state;
    console.log(historyPath);
    if (type === 'refresh') {
      if (historyPath.length <= 1) {
        await this.listAssets();
      } else {
        
        let listPath = historyPath[historyPath.length - 1];
        let assetsRes = await this.listFolderAssets({ id: listPath['id'] });
        let folders = [];
        let mine = [];
        let favors = [];
        if (assetsRes.pass) {
          for (let storage of assetsRes.assets) {
            // 顺序千万不能变 *****
            let storageTypes = storage.storageTypes;
            if (storageTypes.indexOf(3) >= 0) {
              folders.push(storage);
            }else if (storageTypes.indexOf(2) >= 0) {
              mine.push(storage);
            } else if (storageTypes.indexOf(1) >= 0) {
              favors.push(storage);
            } 
          }
          // historyPath.push(id);
          await setStateAsync({
            folders,
            favors,
            mine,
            // historyPath: update(this.state.historyPath,
            //   { $set: historyPath }
            // )
          }, this);
        }
      }
    } else if (type === 'back') {
      if (historyPath.length <= 2) {
        await this.listAssets();
      } else {
        let popPath = historyPath.splice(-1);
        let listPath = historyPath[historyPath.length - 1];
        let assetsRes = await this.listFolderAssets({ id: listPath['id'] });
        let folders = [];
        let mine = [];
        let favors = [];
        if (assetsRes.pass) {
          for (let storage of assetsRes.assets) {
            // 顺序千万不能变 *****
            let storageTypes = storage.storageTypes;
            if (storageTypes.indexOf(3) >= 0) {
              folders.push(storage);
            } else if (storageTypes.indexOf(2) >= 0) {
              mine.push(storage);
            } else if (storageTypes.indexOf(1) >= 0) {
              favors.push(storage);
            }
          }
          // historyPath.push(id);
          await setStateAsync({
            folders,
            favors,
            mine,
            historyPath: update(this.state.historyPath,
              { $set: historyPath }
            )
          }, this)
        }
      }
    } else if (type === 'forward') {
      await this._doubleClickFolder({ id, name });
    } else if (type === 'url') {
      let splicePath = historyPath.splice(index + 1);
      console.log(splicePath, historyPath, ' - - - - ');
      let listPath = historyPath[historyPath.length - 1];
      if (listPath['id'] === '/') {
        await this.listAssets();
      } else {
        let assetsRes = await this.listFolderAssets({ id: listPath['id'] });
        let folders = [];
        let mine = [];
        let favors = [];
        if (assetsRes.pass) {
          for (let storage of assetsRes.assets) {
            // 顺序千万不能变 *****
            let storageTypes = storage.storageTypes;
            if (storageTypes.indexOf(3) >= 0) {
              folders.push(storage);
            } else if (storageTypes.indexOf(2) >= 0) {
              mine.push(storage);
            } else if (storageTypes.indexOf(1) >= 0) {
              favors.push(storage);
            } 
          }
          // historyPath.push(id);
          await setStateAsync({
            folders,
            favors,
            mine,
            historyPath: update(this.state.historyPath,
              { $set: historyPath }
            )
          }, this)
        }
      }
    }
  }

  loadTreeData = async treeNode => {
    console.log(treeNode, ' - - - this is tree data');
    // await this._doubleClickFolder
    let treeData = treeNode.props.dataRef;
    let { storageID, name } = treeData;

    return new Promise(async resolve => {
      if (treeNode.props.children) {
        resolve();
        return;
      }

      // await this._doubleClickFolder({id: storageID, name});
      await this.historyGo({ type: "forward", id: storageID, name })
      let { nodeData } = await this.viewToTree();

      if (nodeData.length) {
        treeNode.props.dataRef.children = [
          ...nodeData
        ];
        this.setState({
          treeData: [...this.state.treeData]
        }, () => {
          resolve();
        })
      } else {
        resolve();
      }
    });


    // return new Promise(resolve => {
    //   if (treeNode.props.children) {
    //     resolve();
    //     return;
    //   }
    //   setTimeout(() => {
    //     treeNode.props.dataRef.children = [
    //       { title: 'Child Node', key: `${treeNode.props.eventKey}-0` },
    //       { title: 'Child Node', key: `${treeNode.props.eventKey}-1` },
    //     ];
    //     this.setState({
    //       treeData: [...this.state.treeData],
    //     });
    //     resolve();
    //   }, 1000);
    // });
  }

  // 云盘搜索功能
  searchDisk = async (e) => {
    let val = e.target.value
    val = val.replace(/(^\s*)|(\s*$)/g, '')
    if(!val) {
      let { nodeData } = await this.viewToTree();
      this.setState({
        diskVal: val,
        showSearch: false,
        treeData: nodeData
      })
    }
    this.setState({
      diskVal: val,
    })
  }

  // 云盘搜索enter事件
  handleDiskKeyDown = (e) => {
    let val = e.target.value
    val = val.replace(/(^\s*)|(\s*$)/g, '')
    if(e.keyCode === 13 && val) {
      let { folders, favors, mine} = this.state
      let newFloders =  folders.filter(item => item.name.indexOf(val) > -1)
      let newFavors =  favors.filter(item => item.name.indexOf(val) > -1)
      let newMine =  mine.filter(item => item.name.indexOf(val) > -1)
      let mappedFolders = newFloders.map(folder => {
        return {
          ...folder
        }
      });
      let mappedFavors = newFavors.map(favor => {
        return {
          ...favor,
          isLeaf: true
        }
      });
      let mappedMine = newMine.map(mi => {
        return {
          ...mi,
          isLeaf: true
        }
      })
      let nodeData = [...mappedFolders, ...mappedFavors, ...mappedMine]
      this.setState({
        newFloders, newFavors, newMine,
        showSearch: true,
        treeData: nodeData
      })
    }
   
  }

  // 云盘过滤筛选
  filterDisk = () => {
    this.showDrawer()
  }

  _clear = (e, options) => {
    this.setState({
      count: 0,
      keyword: '',
      searchKeyword: '',
      selectedCategoriesID: [],
      selectedClassiesID: []
    }, () => {
      if (options && options._refreshP2) {
        options._refreshP2();
      }
    })
  }

  showDrawer = () => {
    this.setState({
      visibleFilterBox: true,
    });
  };

  onClose = async () => {
    // await this.listAssets()
    // let { nodeData } = await this.viewToTree();
    this.setState({
      visibleFilterBox: false,
      // treeData: nodeData,
      // resTotal: nodeData.length,
    });
  };

  getResInfo = async () => {
    await this.listAssets()
    let { nodeData } = await this.viewToTree();
    this.setState({
      treeData: nodeData,
      resTotal: nodeData.length,
    });
  }


  getCategoriesClassies = async () => {
    const {
      client
    } = this.props;

    return new Promise((resolve, reject) => {
      client.query({
        query: GET_CATEGORIES,
        fetchPolicy: 'no-cache'
      }).then((dt) => {
        if (dt.data &&
          dt.data.assetCategoryList &&
          dt.data.assetCategoryList.length &&
          dt.data.assetClassList &&
          dt.data.assetClassList.length &&
          dt.data.assetLevelList
        ) {
          resolve({
            pass: true,
            data: dt.data
          });
        } else {
          resolve({
            pass: false,
            data: {}
          });
        }
      }).catch((error) => {
        return reject({
          pass: false,
          data: {}
        })
      })
    })
  }

  // award类选择
  awardOnChange = (checkedList, options) => {
    const {
      levels,
      awardList,
      awardOptions
    } = this.state;
    let keyedLevelNames = _.keyBy(levels, 'name');
    let levelIDs = checkedList.map((item) => {
      return keyedLevelNames[item]['id'];
    });
    this.setState({
      awardList: checkedList,
      levelIDs,
      awardCheckAll: checkedList.length === awardOptions.length
    }, () => {
      this.getResInfo()
      // if (options && options._refreshP2) {
      //   options._refreshP2();
      // }
    });
  }

 
  _changeCategoriesID = (selectedCategoriesID, options) => {
    this.setState({
      selectedCategoriesID
    }, () => {
      this.getResInfo()
      // if (options && options._refreshP2) {
      //   options._refreshP2();
      // }
    })
  }
  _changeClassiesID = (selectedClassiesID, options) => {
    this.setState({
      selectedClassiesID
    }, () => {
      this.getResInfo()
      // if (options && options._refreshP2) {
      //   options._refreshP2();
      // } else {
      //   console.log('do nothing in _changeClassiesID');
      // }
    })
  }

  getClassiesID = (typeName) => {
    const {
      classies
    } = this.state;

    let classiesID = [];

    if (typeName) {
      for (let i = 0; i < classies.length; i++) {
        if (typeName === classies[i].name) {
          classiesID.push(classies[i].id);
        }
      }
    } else {
      for (let i = 0; i < classies.length; i++) {
        classiesID.push(classies[i].id);
      }
    }
    return classiesID;
  }
  goBacklink = (e) => {
    const {
      history
    } = this.props;
    _historyHandler({jump: `/mart/assets`, history});
  }

  // 资源删除逻辑
  // 删除文件夹
  delMyStorageAsset =  async (istorageIDListds) => {
    const { client } = this.props
    let { folders } = this.state
    try {
      let res = await client.mutate({
        mutation: DEL_MYSTORAGE_ASSETITEM_INPUT,
        variables: {
          input: {
            storageIDList: istorageIDListds
          } 
        },
      });
      if (res.data.delMyStorageAssetItem.code === 0) {
        folders = folders.filter(item => !istorageIDListds.includes(item.storageID))
        this.setState({
          folders
        })
        AntMessage.success('delete asset success');
      } else {
        AntMessage.error('delete asset fail');
      }
    } catch (e) {
      AntMessage.error('delete asset error');
    }
  }
  // 删除文件
  delAssetFavorite =  async (assetID, type) => {
    const { client } = this.props
    try {
      let res = await client.mutate({
        mutation: DEL_ASSET_FAVORITE,
        variables: {
          input: {
            assetID: assetID
          } 
        },
      });
      if (res.data.delAssetFavorite.code === 0) {
        let { mine, favors } = this.state;
        if (type === 'mine') {
          mine = mine.filter(item => assetID !== item.assetID)
          this.setState({
            mine
          })
        } else if (type === 'favors') {
          favors = favors.filter(item => assetID !== item.assetID)
          this.setState({
            favors
          })
        }
        AntMessage.success('delete asset success');
      } else {
        AntMessage.error('delete asset fail');
      }
    } catch (e) {
      AntMessage.error('delete asset error');
    }
  }
  // archiveAsset文件
  archiveAssetFavorite =  async (assetID, type) => {
    const { client } = this.props
    try {
      let res = await client.mutate({
        mutation: ARCHIVE_ASSET,
        variables: {
          input: {
            assetID: assetID
          } 
        },
      });
      if (res.data && res.data.archiveAsset && res.data.archiveAsset.status && res.data.archiveAsset.status.code === 0) {
        let { mine, favors } = this.state;
        if (type === 'mine') {
          mine = mine.filter(item => assetID !== item.assetID)
          this.setState({
            mine
          })
        } else if (type === 'favors') {
          favors = favors.filter(item => assetID !== item.assetID)
          this.setState({
            favors
          })
        }
        AntMessage.success('archive asset success');
      } else {
        AntMessage.error('archive asset fail');
      }
    } catch (e) {
      AntMessage.error('archive asset error');
    }
  }

  setAssetStatusFavor = async (ispublic, storageID, type) => {
    const { client } = this.props;
    try {
      let res = await client.mutate({
        mutation: UPDATE_MYSTORE_ASSETITEM,
        variables: {
          input: {
            pairList: [
              {
                public: !ispublic,
                storageID
              }
            ]
          } 
        },
      });
      if (res.data && res.data.updateMyStorageAssetItem && res.data.updateMyStorageAssetItem.code === 0) {
        // this.getResInfo()
        let { mine, favors } = this.state;
        if (type === 'mine') {
          let list = mine.map(item => {
            if (item.storageID === storageID) {
              item.public = !item.public
            }
            return item
          })
          this.setState({
            mine: list
          })
        } else if (type === 'favors') {
          let list = favors.map(item => {
            if (item.storageID === storageID) {
              item.public = !item.public
            }
            return item
          })
          this.setState({
            favors: list
          })
        }
      } else {
        AntMessage.error('update asset fail');
      }
    } catch (error) {
      console.log('errorr-setAssetStatusFavor', error);
      
    }
    
  }
  

  render() {
    return (
      <>
        <Provider value={this.state}>
          {
            this.props.children
          }
        </Provider>
      </>
    )
  }
}

function withDisk(Component) {
  return function Marted(props) {
    return (
      <Consumer>
        {
          () => (
            <Component {...props} />
          )
        }
      </Consumer>
    )
  }
}

let defaultDisk = withApollo(withRouter(DiskProvider));

export {
  defaultDisk as DiskProvider,
  Consumer as DiskConsumer,
  DiskContext,
  withDisk
}
