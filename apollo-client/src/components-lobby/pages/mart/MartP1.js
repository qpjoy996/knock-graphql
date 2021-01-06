import React from 'react';
import {withRouter} from 'react-router-guard';
import {withApollo, Query} from 'react-apollo';
import gql from 'graphql-tag';

import Asset from "./Asset";

import {MartConsumer} from "states/context/MartContext";

import {importAll} from "utils";


const GET_RECOMMEND_LIST = gql`
    query marketAssetRecommendList{
        marketAssetRecommendList(pageInfo:{first:10, after:""}) {
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

class MartP1 extends React.Component {
  state = {
    selectedHotIDs: [],
  }

  constructor(props) {
    super(props)
  }

  async componentDidMount() {
  }


  _handleHotsClick = (e, asset) => {
    e.stopPropagation()
    let selectedAssets = [asset];
    console.log(selectedAssets, ' - - - -  -sele ct ed Assets!!!')

    let selectedAssetIDs = selectedAssets.map(asset => asset.id);
    this.setState({
      // selectedAssets: JSON.parse(JSON.stringify([asset])),
      selectedHotIDs: JSON.parse(JSON.stringify(selectedAssetIDs))
    })
  }


  render() {
    const webpackContext = require.context('assets-lobby/img/mart', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);

    const {
      selectedHotIDs
    } = this.state;

    return (
      <MartConsumer>
        {
          ({
             // list
             searchKeyword, sortByValue, categoriesView, selectedTypes, selectedCategory, types,
             // categories
             // categoryVisible,
             // awardOptions, awardList, awardCheckAll,
             // panelDisabled, awardIndeterminate,

             // functions
             _changeSearch, _handleSearch, _toggleSwipe, _maxium, _awardOnCheckAllChange,
             _awardOnChange, _toggleModal, _sortByOnChange, _clickCategory, _clickType, _togglePanel,
             goDisklink
           }) => {
            let selectedCategoryIDs = selectedCategory.map(category => category.id);
            let selectedTypeIDs = selectedTypes.map((type) => type.id);
            return (
              <>
                <div className="mart-inner scroll-bar no-select" onClick={(e) => {
                  this.setState({
                    selectedHotIDs: []
                  })
                }}>
                  <div className="search-box">
                    <div className="search-box__l">
                      <img className="search-box__l-icon" src={images['search.png']}/>
                      <input
                        id="mart-search"
                        type="text"
                        placeholder={'Search'}
                        value={searchKeyword || ''}
                        onChange={(e) => _changeSearch(e)}
                        onKeyDown={(e) => _handleSearch(e)}
                      />
                    </div>
                    {/*<img className="search-box__like" src={images['like.png']} alt={'喜欢'}/>*/}
                    {/*<img className="search-box__like-red" src={images['like_red.svg']}  alt={'要不要喜欢'} />*/}
                    {/*<img className="search-box__like" src={images['category.png']} alt={'分类'}*/}
                    {/*     title={'Show Filter'}*/}
                    {/*     onClick={_toggleModal}/>*/}
                  </div>
                  {/* 展示没有banner配置，先隐藏掉 */}
                  {/* <div className="mart-banner"
                       style={{backgroundImage: `url(${images['bg_linear.svg']})`}}
                  >
                    <p>Banner</p>
                    <p></p>
                  </div> */}

                  <div className="mart-classy">
                    <div className="mart-classy-box">
                      {
                        categoriesView.length ? (
                          <>
                            {
                              categoriesView.map((item) => {
                                return (
                                  <div
                                    className={`mart-classy-box_item ${(selectedCategoryIDs.indexOf(item.id) >= 0) ? 'active' : ''}`}
                                    key={item.id}
                                    onClick={(e) => _clickCategory(e, item)}
                                  >
                                    <div className="mart-classy-box_item-t"
                                    >
                                      <img src={images[item.bgUrl]}
                                           alt={item.id} title={item.text}
                                          //  onClick={(e) => _clickCategory(e, item)}
                                      />
                                    </div>
                                    <div className="mart-classy-box_item-b"
                                         alt={item.id} title={item.text}
                                        //  onClick={(e) => _clickCategory(e, item)}
                                    >
                                      {
                                        item.text
                                      }
                                    </div>
                                  </div>
                                )
                              })
                            }

                          </>
                        ) : (
                          <div>no category...</div>
                        )
                      }
                    </div>
                  </div>

                  <div className="mart-tags">
                    <div className="mart-tags-box">
                      {
                        types.length ? (
                          <>
                            {
                              types.map((item) => {
                                if(item && item.text && item.text.toLocaleLowerCase() === "script") {
                                  return null;
                                }
                                return (
                                  <div
                                    className={`mart-tags-box_item ${(selectedTypeIDs.indexOf(item.id) >= 0) ? 'active' : ''}`}
                                    key={item.id}
                                    onClick={(e) => _clickType(e, item)}>
                                    {/*${(selectedTypes.indexOf(item.text)>=0)?'active':''}*/}
                                    <span className="mart-tags-box_item-text">
                                        {
                                          item.text
                                        }
                                    </span>
                                    <div className="mart-tags-box_item-logo"
                                         style={{
                                           backgroundImage: `url(${images[item.bgUrl]})`
                                         }}></div>
                                    {/*<img className="mart-tags-box_item-logo" src={images[item.bgUrl]} />*/}
                                  </div>
                                )
                              })
                            }
                          </>
                        ) : (
                          <>No tags...</>
                        )
                      }
                    </div>
                  </div>

                  <div className="mart-hot">
                    <div className="mart-hot-line">
                      {/*<img src={images['hot_line.svg']}/>*/}
                      <span>
                                Best of Today
                            </span>
                      {/*<img src={images['hot_line.svg']}/>*/}
                    </div>
                  </div>

                  <div className="mart-asset">
                    {/*<HotList/>*/}
                    {/*<AssetList/>*/}
                    <Query query={
                      GET_RECOMMEND_LIST
                    } variables={{}} fetchPolicy={'no-cache'}
                    >
                      {

                        ({loading, error, data, client}) => {

                          if (loading) {
                            return (
                              <>
                                Hots Loading...
                              </>
                            )
                          }
                          if (error) {
                            console.log(error);
                            return (
                              <>
                                Fetch hots error...
                              </>
                            )
                          }
                          if (data && data.marketAssetRecommendList) {
                            let assets = data.marketAssetRecommendList;
                            return (
                              <>
                                <div className="assets scroll-bar">
                                  <div className="assets_list">
                                    {
                                      assets.length ?
                                        (
                                          <>
                                            {
                                              assets.map((asset, i) => {
                                                let active = (selectedHotIDs.indexOf(asset.id) >= 0);
                                                return (
                                                  <React.Fragment
                                                    key={asset.id}>
                                                    <Asset
                                                      asset={asset}
                                                      active={active}
                                                      _handleAssetsClick={this._handleHotsClick.bind(this)}
                                                    />
                                                  </React.Fragment>
                                                )
                                              })
                                            }
                                          </>
                                        ) : (
                                          <>
                                            No assets...
                                          </>
                                        )
                                    }
                                    {/*<Hot asset={}></Hot>*/}
                                  </div>
                                </div>
                              </>
                            )
                          } else {
                            return (
                              <>
                                Server data issues...
                              </>
                            )
                          }
                        }
                      }
                    </Query>
                  </div>
                  <div className="iconBox">
                    <div className="icondisk" onClick={(e) => goDisklink(e)}>
                      <span>云盘</span>
                    </div>
                    <div className="maxium" onClick={(e) => _maxium(e)}>
                      <img src={images['maxium.png']} alt="" />
                    </div>
                  </div>
                </div>
              </>
            )
          }
        }
      </MartConsumer>
    )
  }
}

export default withApollo(withRouter(MartP1));
