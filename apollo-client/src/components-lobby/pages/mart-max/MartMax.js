import React from 'react';
import {Checkbox, Pagination} from 'antd';
import {debounce} from 'lodash';

import {MartProvider, MartConsumer} from "states/context/MartContext";

import CategoryPanel from "./CategoryPanel";
import ClassPanel from "./ClassPanel";
import AssetList from "./AssetList";


import {importAll} from "utils";

const CheckboxGroup = Checkbox.Group;

class MartMax extends React.Component {

    state = {
        reloadPage: false,
        currentPage: 1
    }

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.setState({
            reloadPage: true
        })
    }

    _reloadPage = (cb) => {
        this.setState({
            reloadPage: false
        }, () => {
            this.setState({
                reloadPage: true
            },() => {
                cb && cb()
            });
        });
    }

    _downloadAsset = (e, asset) => {
        if (window.qtJSON) {
            let json = {
                type: 'emit',
                name: 'download',
                cb: function () {
                    // return asset.id;
                    return JSON.stringify({
                        id: asset ? asset.id : '',
                        type: asset ? asset.type : ''
                    });
                }
            };
            window.qtJSON(json);
        } else {
            alert('no asset');
        }
    }

    _changePage = (page, size) => {
        console.log(page, size);
        this.setState({
            currentPage: page
        });
        this._reloadPage();
    }

    _debounceChangePage = debounce((cb) => {
        this._reloadPage(cb);
    }, 1000);


    render() {
        const webpackContext = require.context('assets-lobby/img/mart', false, /\.(png|jpe?g|svg)$/);
        const images = importAll(webpackContext);

        const {
            reloadPage,
            currentPage
        } = this.state;

        return (
            <>
                <MartProvider>
                    <MartConsumer>
                        {
                            ({
                                 keyword,
                                 searchKeyword,
                                 count,
                                 awardOptions, awardList,

                                 classies,
                                 selectedClassiesID,
                                 categories,
                                 selectedCategoriesID,

                                 levelIDs,

                                 sortByValue,
                                 _changeSortByValue,

                                 _awardOnChange,
                                 _changeSearch,
                                 _handleSearch,
                                 _clear,
                                 _changeCategoriesID,
                                 _changeClassiesID,
                                 _setCount
                             }) => {
                                return (
                                    <div className="mart-max-inner">
                                        <div className="mart-max-inner-l">
                                            <div className="mart-max-inner-l-t">
                                                <span>Market</span>

                                                <div className="mart-max-inner-l-t-r">
                                                    <img src={images['search.png']}/>
                                                    <input type='text'
                                                           id="mart-max-search"
                                                           value={searchKeyword || ''}
                                                           onChange={(e) => {
                                                               _changeSearch(e)
                                                           }}
                                                           onKeyDown={(e) => {
                                                               _handleSearch(e, {
                                                                   _refreshP2: this._debounceChangePage
                                                               })
                                                           }}
                                                           placeholder={'Search'}/>
                                                </div>
                                            </div>

                                            <div className="mart-max-box">
                                                <div className="mart-max-box__t">
                                                    {count} results<span
                                                    onClick={(e) => _clear(e, {_refreshP2: this._debounceChangePage})}>Clear</span>
                                                </div>
                                            </div>

                                            <div className="mart-max-box">
                                                <div className="mart-max-box__t title">
                                                    Award
                                                </div>

                                                <div className="mart-max-box__b">
                                                    <CheckboxGroup
                                                        options={awardOptions}
                                                        value={awardList}
                                                        onChange={(checkedList) => {
                                                            _awardOnChange(checkedList, {
                                                                _refreshP2: this._debounceChangePage,
                                                            })
                                                        }}
                                                        // onChange={(e) => _awardOnChange(e, {_refreshP2: this._debounceChangePage})}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mart-max-box">
                                                <div className="mart-max-box__t title">
                                                    Categories
                                                </div>

                                                {
                                                    categories.length ? categories.map((category, index) => {
                                                        // if (index === 0) {
                                                        //     category.key = category.name;
                                                        // }
                                                        return (
                                                            <React.Fragment key={category.name}>
                                                                <CategoryPanel
                                                                    filter={{
                                                                        category,
                                                                        categories,
                                                                        selectedCategoriesID
                                                                    }}
                                                                    _refreshP2={this._debounceChangePage}
                                                                    _changeCategoriesID={_changeCategoriesID}
                                                                    category={category}/>
                                                            </React.Fragment>
                                                        )
                                                    }) : (
                                                        <div>
                                                            No categories...
                                                        </div>
                                                    )
                                                }
                                            </div>

                                            <div className="mart-max-box">
                                                <div className="mart-max-box__t title">
                                                    Class
                                                </div>

                                                <div className="mart-max-box__b">
                                                    {/*<CertCheckboxGroup*/}
                                                    {/*    options={certOptions}*/}
                                                    {/*    value={this.state.certList}*/}
                                                    {/*    onChange={this.certOnChange}*/}
                                                    {/*/>*/}

                                                    {
                                                        classies.length ? (
                                                            <>
                                                                {/*<React.Fragment key={category.name}>*/}
                                                                {/*    <CategoryPanel category={category}/>*/}
                                                                {/*</React.Fragment>*/}
                                                                {/*{*/}
                                                                {/*    JSON.stringify(selectedClassiesID)*/}
                                                                {/*}*/}
                                                                <ClassPanel
                                                                    filter={{
                                                                        classies,
                                                                        selectedClassiesID
                                                                    }}
                                                                    _refreshP2={this._debounceChangePage}
                                                                    _changeClassiesID={_changeClassiesID}
                                                                />
                                                            </>
                                                        ) : (
                                                            <div>
                                                                No classies...
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mart-max-inner-r">
                                            <div className="mart-max-inner-r-t">
                                                {/*<div className="mart-max-inner-r-t__like">*/}
                                                {/*    <img src={images['like.png']}/>*/}
                                                {/*    仅显示我喜欢的*/}
                                                {/*</div>*/}
                                                <Pagination
                                                    onChange={this._changePage}
                                                    current={currentPage}
                                                    pageSize={24}
                                                    total={count}/>

                                                <div className="mart-max-inner-r-t__tabs">
                                                    <span className="mart-max__sort-by">Sort by</span>
                                                    <div
                                                        onClick={() => _changeSortByValue('downloads', {
                                                            _refreshP2: this._debounceChangePage
                                                        })}
                                                        className={`${sortByValue === 'downloads' ? 'active' : ''}`}>Downloads
                                                    </div>
                                                    <div
                                                        onClick={() => _changeSortByValue('likes', {
                                                            _refreshP2: this._debounceChangePage
                                                        })}
                                                        className={`${sortByValue === 'likes' ? 'active' : ''}`}>Likes
                                                    </div>
                                                    <div
                                                        onClick={() => _changeSortByValue('latest', {
                                                            _refreshP2: this._debounceChangePage
                                                        })}
                                                        className={`${sortByValue === 'latest' ? 'active' : ''}`}>Upload
                                                        time
                                                    </div>
                                                </div>
                                            </div>


                                            <div className="mart-max-inner-r-b">
                                                {/*<div className="assets-max-list">*/}
                                                {/*    <div className="assets-max-item active">*/}
                                                {/*        <div className="assets-max-item__t">*/}
                                                {/*            <div className="assets-max-item__t-img"*/}
                                                {/*                 style={{backgroundImage: `url(${images['search.png']})`}}></div>*/}
                                                {/*        </div>*/}
                                                {/*        <div className="assets-max-item__b">*/}
                                                {/*            <span className="name">Koenigsegg CCX Rim</span>*/}

                                                {/*            <span className="a-btn"*/}
                                                {/*                  onClick={(e) => this._downloadAsset(e)}>Download</span>*/}
                                                {/*        </div>*/}
                                                {/*    </div>*/}
                                                {/*</div>*/}

                                                {
                                                    (reloadPage) ?
                                                        (
                                                            <AssetList filter={{
                                                                count,
                                                                currentPage,
                                                                keyword: keyword,
                                                                sortType: sortByValue,
                                                                selectedCategoriesID,
                                                                selectedClassiesID,
                                                                levelIDs
                                                            }}
                                                                       _setCount={_setCount}
                                                                       _reloadPage={this._reloadPage}
                                                            />
                                                        ) :
                                                        (
                                                            <>
                                                                No items.
                                                            </>
                                                        )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        }
                    </MartConsumer>
                </MartProvider>
            </>
        )
    }
}

export default MartMax;
