import React from 'react';
import { importAll, _historyHandler } from "utils";
import DiskPath from './DiskPath';

class Search extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const webpackcontext = require.context('assets-lobby/img/disk', false, /\.(png|jpe?g|svg)$/);
        const images = importAll(webpackcontext);

        const { func, historyPath, diskVal } = this.props;
        // console.log(historyPath, ' - this is historyPath');

        let hideBack = !historyPath.length || (historyPath.length === 1 && historyPath[0]['id'] === '/');

        return (
            <>
                <div className="disk-search-block clearfix" style={{
                    paddingLeft: hideBack ? '10PX' : '40PX'
                }}>
                    {
                        hideBack ? null : (
                            <div className="disk-back">
                                <img className="disk-back_img" src={images['back.png']} onClick={() => func.historyGo({ type: 'back' })} />
                            </div>
                        )
                    }

                    <div className="disk-search">
                        <div className="disk-search__inner">
                            <div className="disk-search-img">
                                <img className="disk-search-img_search" src={images['search.png']} />
                            </div>

                            <input
                                placeholder="Search"
                                onChange={func.searchDisk}
                                value={diskVal}
                                onKeyDown={func.handleDiskKeyDown}
                            />
                        </div>
                    </div>

                    <div className="disk-filter">
                        <div className="disk-filter__item">
                            <span> + </span>
                            <img src={images['folder.png']} onClick={(e) => {
                                func && func.newFolder()
                            }} />
                        </div>

                        <div className="disk-filter__item">
                            <span> + </span>
                            <img src={images['view.png']} onClick={(e) => {
                                func && func.toggleView()
                            }} />
                        </div>

                        <div className="disk-filter__item">
                            <span> + </span>
                            <img src={images['filter.png']} onClick={(e) => {
                                func && func.filterDisk()
                            }} />
                        </div>
                    </div>
                </div>

                {
                    hideBack ? null : (
                        <div className="disk-search-path clearfix">
                            <div className="disk-search-img">
                                <img src={images['folder.png']} />
                            </div>

                            <div className="disk-back_path">
                                {
                                    historyPath.map((history, index) => {
                                        return (
                                            <React.Fragment key={history['id']}>
                                                {/* <span key={history['id']} onClick={() => func.historyGo({ type: 'url', id: history['id'], index })}>
                                                    {
                                                        history['name']
                                                    }
                                                </span> */}
                                                <DiskPath 
                                                    allowedDropEffect="any"
                                                    index={index}
                                                    history={history}
                                                    func={func}
                                                />
                                            </React.Fragment>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    )
                }
            </>
        )
    }
}

export default Search;