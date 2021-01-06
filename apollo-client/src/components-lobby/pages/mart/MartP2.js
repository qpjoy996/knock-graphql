import React from 'react';

import AssetList from "./AssetList";
import {importAll, _historyHandler} from "utils";

import {MartConsumer} from "states/context/MartContext";

import CategoryModal from "./CategoryModal";

class MartP2 extends React.Component {

    state = {
        reloadPage: false
    }

    // static contextType = MartContext;

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const that = this;
        if (window.qtJSON) {
            let json = {
                type: 'on',
                name: 'refresh',
                cb: () => {
                    that._reloadPage();
                }
            }
            window.qtJSON(json);
        }

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
            }, () => {
                cb && cb()
            });
        });
    }

    render() {
        const webpackContext = require.context('assets-lobby/img/mart', false, /\.(png|jpe?g|svg)$/);
        const images = importAll(webpackContext);

        const {
            reloadPage
        } = this.state;
        return (
            <>
                <MartConsumer>
                    {
                        ({
                             count,
                             keyword,
                             sortByValue,
                             refreshPage2,

                             levelIDs,

                             selectedTypes,
                             selectedCategoriesID,
                             selectedClassiesID,
                             searchKeyword, _changeSearch, _handleSearch,
                             hadnleGoback, _toggleModal, _setCount
                         }) => {
                            return (
                                <>
                                    <div className="mart-inner mart-inner-list scroll-bar no-select">
                                        <div className="search-box">
                                            <img className="no-select search-box__back" src={images['arrowdown.png']} alt={'分类'}
                                                 title={'Back'}
                                                 onClick={hadnleGoback}/>

                                            <div className="search-box__l">
                                                <img className="search-box__l-icon" src={images['search.png']}/>
                                                <input
                                                    id="mart-search"
                                                    type="text"
                                                    placeholder={'Search'}
                                                    value={searchKeyword || ''}
                                                    onChange={(e) => _changeSearch(e)}
                                                    onKeyDown={(e) => _handleSearch(e, {
                                                        option: 'no swipe',
                                                        _refreshP2: this._reloadPage
                                                    })}
                                                />
                                            </div>
                                            {/*<img className="search-box__like" src={images['like.png']} alt={'喜欢'}/>*/}
                                            {/*<img className="search-box__like-red" src={images['like_red.svg']}  alt={'要不要喜欢'} />*/}
                                            <img className="search-box__like" src={images['category.png']} alt={'分类'}
                                                 title={'Show Filter'}
                                                 onClick={_toggleModal}/>
                                        </div>

                                        <div className="mart-asset">
                                            {/*<HotList/>*/}

                                            {
                                                (reloadPage) ?
                                                    (
                                                        <AssetList filter={{
                                                            count,
                                                            keyword: keyword,
                                                            sortType: sortByValue,
                                                            selectedCategoriesID,
                                                            selectedClassiesID,
                                                            levelIDs
                                                        }}
                                                                   _setCount={_setCount}
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
                                </>
                            )
                        }
                    }
                </MartConsumer>


                <CategoryModal refreshPage2={this._reloadPage}/>
            </>
        )
    }
}

export default MartP2;
