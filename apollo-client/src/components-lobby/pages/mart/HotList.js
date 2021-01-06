import React from 'react';
import {withRouter} from 'react-router-guard';
import {withApollo} from 'react-apollo';
import InfiniteScroll from 'react-infinite-scroller';
import gql from 'graphql-tag';

import Asset from "./Hot";

import {importAll} from "utils";


const GET_ASSETS = gql`
    query GetAssets($sortType: String!, $skipLen: Int!, $limitLen: Int!, $assetTypes: [String!], $categoryIDList: [Int!], $keyword: String) {
        assetCount: marketListCount(assetTypes: $assetTypes, categoryIDList: $categoryIDList, keyword: $keyword) {
            count
        }
        assets: marketAssetList(sortType: $sortType, skipLen: $skipLen, limitLen: $limitLen, assetTypes: $assetTypes, categoryIDList: $categoryIDList, keyword: $keyword) {
            id
            author
            name
            thumbnailURLs
            types
            description
            categories
            views
            saves
            likes
            timestamp
        }
    }
`;

// const GET_ASSETS_COUNT = gql`
//     query AssetsCountQuery($assetTypes: [String], $tags: [String]) {
//         marketListCount(assetTypes: $assetTypes, tags: $tags) {
//             count
//         }
//     }
// `;

class HotList extends React.Component {
    state = {
        assets: [],
        assetCount: 0,

        currentPage: 0,
        limitLen: 24,
        sortType: 'latest',
        hasMoreItems: true,
        assetTypes: [''],
        selectedAssets: [],

        keyword: '',

    }

    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        this.loadMoreAssets();
    }

    loadMoreAssets(page) {
        let {
            assets,
            limitLen,
            sortType,
            keyword,
            tags
        } = this.state;

        const {
            client
        } = this.props;

        // if(!page) {
        //     alert(`no page ${page}`)
        //     return
        // }
        if (page !== 0 && !page) {
            return;
        }

        let skipLen = (page - 1) * limitLen;
        console.log(page, skipLen, 'ooo')
        try {
            client.query({
                query: GET_ASSETS,
                variables: {
                    sortType,
                    skipLen,
                    limitLen,
                    // assetTypes,
                    // tags,
                    keyword
                },
                fetchPolicy: 'network-only'
            }).then((dt) => {
                let hasMoreItems = false;
                let assetCount = 0;
                if (dt.data && dt.data.assetCount && dt.data.assetCount.count) {
                    assetCount = dt.data.assetCount.count;

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
                    console.log(JSON.stringify(assetList), ' - - - ');
                    this.setState({
                        currentPage: page,
                        assets: [
                            ...assets,
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
        console.log(selectedAssets,' - - - -  -sele ct ed Assets!!!')
        this.setState({
            selectedAssets
        })
    }


    render() {
        const webpackcontext = require.context('assets-lobby/img/mart', false, /\.(png|jpe?g|svg)$/);
        const images = importAll(webpackcontext);

        const {
            assets,
            hasMoreItems,
            selectedAssets
        } = this.state;

        let selectedAssetIDs = selectedAssets.map(asset => asset.id);
        // alert(JSON.stringify(selectedAssetIDs));

        const loader = <div className="loader">Loading ... </div>;
        const noItems = <div className="loader">No items loaded!</div>

        let items = [];
        assets.map((asset, i) => {
            items.push(
                <React.Fragment key={asset.id}>
                    <Asset asset={asset} selectedAssetIDs={selectedAssetIDs}
                           _handleAssetsClick={(e) => this._handleAssetsClick(e, asset)}/>
                </React.Fragment>
            )
        });

        return (
            <div className="assets scroll-bar" ref={(ref) => this.scrollParentRef = ref}>
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
                        items.length ? items : noItems
                    }
                </InfiniteScroll>
            </div>
        )
    }
}

export default withApollo(withRouter(HotList));
