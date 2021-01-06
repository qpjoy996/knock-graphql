import React from 'react';
import {withRouter} from 'react-router-guard';
import {withApollo} from 'react-apollo';
import InfiniteScroll from 'react-infinite-scroller';
import gql from 'graphql-tag';
import * as _ from 'lodash';

import Asset from "./Asset";

import {importAll} from "utils";


const GET_ASSETS = gql`
    query GetAssets($sortType: String!, $skipLen: Int!, $limitLen: Int!, $assetType: String, $categoryIDList: [Int!], $containTypes: [Int!], $keyword: String, $filter: AssetFilter) {
        assetCount: marketListCount(assetType: $assetType, categoryIDList: $categoryIDList, containTypes: $containTypes, keyword: $keyword, filter: $filter) {
            count
        }
        assets: marketAssetList(sortType: $sortType, skipLen: $skipLen, limitLen: $limitLen, assetType: $assetType, categoryIDList: $categoryIDList, containTypes: $containTypes, keyword: $keyword, filter: $filter) {
            id
            author
            name
            thumbnailURLs
            type
            description
            categoryIDList
            views
            saves
            likes
            timestamp
        }
    }
`;

const GET_ASSETS_COUNT = gql`
    query AssetsCountQuery($assetTypes: [String], $tags: [String]) {
        marketListCount(assetTypes: $assetTypes, tags: $tags) {
            count
        }
    }
`;

class AssetList extends React.Component {
    state = {
        assets: [],
        assetCount: 0,

        currentPage: 0,
        limitLen: 24,
        sortType: 'latest',
        activeTags: [],
        tags: [''],
        hasMoreItems: true,
        assetTypes: '',
        selectedAssets: [
            {
                "id": "cf4d83b4-cb78-40f4-a167-82f283eb5d29",
                "author": "CiTestUserId",
                "name": "",
                "thumbnailURLs": ["http://davinci-testcdn.lilithgame.com/dev/pictures/bn4g1tri5s0jiqs3g4mg"],
                "types": [],
                "description": "",
                "categories": [],
                "views": 0,
                "saves": 0,
                "likes": 0,
                "timestamp": "0001-01-01T00:00:00Z",
                "__typename": "Asset"
            }
        ],
        selectedAssetIDs: [],

        // filter: null,

        keyword: '',
        searchKeyword: '',
        selectedCategoriesID: [],
        selectedClassiesID: [],

        pageStatus: 'loaded'
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        // console.log(nextProps.filter, ' - - - - = = = ', prevState.filter, (_.isEqual(prevState.filter, nextProps.filter)));
        if (nextProps.filter && !(_.isEqual(prevState.filter, nextProps.filter))) {
            return {
                filter: nextProps.filter
            }
        }
        return null;
    }

    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        this.loadMoreAssets(1);
    }


    loadMoreAssets() {
        let {
            limitLen,
            filter
        } = this.state;

        const {
            client,
            _setCount
        } = this.props;
        let page = filter.currentPage;

        if (page !== 0 && !page) {
            return;
        }

        let skipLen = (page - 1) * limitLen;
        try {
            client.query({
                query: GET_ASSETS,
                variables: {
                    sortType: filter.sortType,
                    skipLen,
                    limitLen,
                    // keyword: filter.keyword,
                    // categoryIDList: filter.selectedCategoriesID,
                    // containTypes: filter.selectedClassiesID
                    filter: {
                        keyword: filter.keyword,
                        categoryIDList: filter.selectedCategoriesID,
                        containTypes: filter.selectedClassiesID,
                        assetLevels: filter.levelIDs
                    }
                },
                fetchPolicy: 'no-cache'
            }).then((dt) => {
                let hasMoreItems = false;
                let assetCount = 0;
                if ((dt.data && dt.data.assetCount && dt.data.assetCount.count) || dt.data.assetCount.count === 0) {
                    assetCount = dt.data.assetCount.count;
                    // localStorage.setItem('assetCount', assetCount);
                    _setCount(assetCount);

                    if (skipLen + limitLen >= assetCount) {
                        hasMoreItems = false;
                    } else {
                        hasMoreItems = true;
                    }
                } else {
                    hasMoreItems = false
                }

                if (dt.data.assets) {
                    const assetList = dt.data.assets;
                    this.setState({
                        currentPage: page,
                        assets: [
                            ...assetList
                        ],
                        hasMoreItems,
                        assetCount
                    })
                } else {
                    this.setState({
                        hasMoreItems: false
                    })
                }
            })
        } catch (e) {
            console.log(e);
        }
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    _handleAssetsClick = (e, asset) => {
        let selectedAssets = [asset];
        console.log(selectedAssets, ' - - - -  -sele ct ed Assets!!!')

        let selectedAssetIDs = selectedAssets.map(asset => asset.id);
        this.setState({
            selectedAssets: JSON.parse(JSON.stringify([asset])),
            selectedAssetIDs: JSON.parse(JSON.stringify(selectedAssetIDs))
        })
    }


    render() {
        const webpackcontext = require.context('assets-lobby/img/mart', false, /\.(png|jpe?g|svg)$/);
        const images = importAll(webpackcontext);

        const {
            assets,
            selectedAssetIDs,
            pageStatus,
        } = this.state;

        const noItems = <div className="loader" style={{
            padding: '10px',
            fontSize:'14PX'
        }}>No items!</div>

        return (
            <>
                {
                    pageStatus === 'loaded' ? (
                        <div className="assets-max-list scroll-bar"
                            onClick={() => {
                                this.setState({
                                    selectedAssets: JSON.parse(JSON.stringify([])),
                                    selectedAssetIDs: JSON.parse(JSON.stringify([]))
                                })
                            }}
                        >
                            {
                                assets.length ?
                                    (
                                        <>
                                            {
                                                assets.map((asset, i) => {
                                                    let active = (selectedAssetIDs.indexOf(asset.id) >= 0);
                                                    return (
                                                        <React.Fragment key={asset.id}>
                                                            <Asset asset={asset}
                                                                   active={active}
                                                                   _handleAssetsClick={this._handleAssetsClick.bind(this)}/>
                                                        </React.Fragment>
                                                    )
                                                })
                                            }
                                        </>
                                    ) : noItems
                            }
                        </div>
                    ) : (
                        <div>
                            Reload page...
                        </div>
                    )
                }
            </>
        )
    }
}

export default withApollo(withRouter(AssetList));
