import React from 'react';
import {withRouter} from 'react-router-guard';
import {withApollo} from 'react-apollo';
import InfiniteScroll from 'react-infinite-scroller';
import gql from 'graphql-tag';
import * as _ from 'lodash';

import Asset from "./Asset";

import {importAll} from "utils";

// , $filter: AssetFilter
const GET_ASSETS = gql`
    query GetAssets($sortType: String!, $skipLen: Int!, $limitLen: Int!, $assetType: String, $categoryIDList: [Int!], $containTypes: [Int!], $keyword: String, $filter: AssetFilter) {
        assetCount: marketListCount(assetType: $assetType, categoryIDList: $categoryIDList, containTypes: $containTypes, keyword: $keyword, filter: $filter) {
            count
        },
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
            assetLevel
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
        skipLen: 0,
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
        // console.log(nextProps.filter, ' - - - - = = =  where is level IDs!!!');
        if (nextProps.filter && !(_.isEqual(prevState.filter, nextProps.filter))) {
            // if() {
            //
            // }
            return {
                filter: nextProps.filter
                // keyword: nextProps.filter.keyword,
                // selectedCategoriesID: nextProps.filter.selectedCategoriesID,
                // selectedClassiesID: nextProps.filter.selectedClassiesID,
            }
        }
        return null;
    }

    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        // this.loadMoreAssets();

        // setTimeout(() => {
        //     this._reloadPage();
        // }, 6000);
    }


    _reloadPage = (e) => {
        this.setState({
            // keyword: 'ttt',
            // assets: [],
            // hasMoreItems: true,
            pageStatus: ''
        }, () => {
            this.setState({
                pageStatus: 'loaded',
                assets: [],
                hasMoreItems: true
            })
        });
    }

    loadMoreAssets(page) {
        const {
            _setCount
        } = this.props;
        let {
            assets,
            limitLen,
            skipLen,
            sortType,
            keyword,
            selectedCategoriesID,
            selectedClassiesID,
            filter
        } = this.state;

        const {
            client
        } = this.props;

        if (page !== 0 && !page) {
            return;
        }

        // let skipLen = (page - 1) * limitLen;
        try {
            localStorage.setItem('assetCount', 0);
            client.query({
                query: GET_ASSETS,
                variables: {
                    sortType: filter.sortType,
                    skipLen,
                    limitLen,
                    // keyword: filter.keyword,
                    // categoryIDList: filter.selectedCategoriesID,
                    // containTypes: filter.selectedClassiesID,
                    // assetLevels: filter.levelIDs,
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
                if (dt.data && dt.data.assetCount && dt.data.assetCount.count) {
                    assetCount = dt.data.assetCount.count;
                    localStorage.setItem('assetCount', assetCount);

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
                            ...assets,
                            ...assetList
                        ],
                        hasMoreItems,
                        skipLen: skipLen + limitLen,
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
        e.stopPropagation()
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
            hasMoreItems,
            selectedAssets,
            selectedAssetIDs,
            pageStatus,
            // keyword,
            // selectedCategoriesID,
            // selectedClassiesID
        } = this.state;

        const loader = <div key={Math.random()} className="loader">Loading ... </div>;
        const noItems = <div className="loader" style={{
            padding: '10px'
        }}>No items!</div>

        return (
            <>

                {
                    // (keyword || keyword == '')
                    // && (selectedCategoriesID.length)
                    // &&
                    pageStatus === 'loaded' ? (
                        <div className="assets scroll-bar" ref={(ref) => this.scrollParentRef = ref}
                            onClick={() => {
                                this.setState({
                                    selectedAssets: JSON.parse(JSON.stringify([])),
                                    selectedAssetIDs: JSON.parse(JSON.stringify([]))
                                })
                            }}
                        >
                            <InfiniteScroll
                                pageStart={0}
                                loadMore={this.loadMoreAssets.bind(this)}
                                hasMore={hasMoreItems}
                                loader={loader}
                                useWindow={false}
                                getScrollParent={() => this.scrollParentRef}
                                // threshold={1000}
                                // initialLoad={false}
                                className="assets_list"
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
                            </InfiniteScroll>
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
