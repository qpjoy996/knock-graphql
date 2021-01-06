import React from 'react';
import {Modal, Radio, Checkbox, Collapse} from 'antd';
import gql from 'graphql-tag';
import {withRouter} from 'react-router-guard';
import {withApollo, Query} from 'react-apollo';
import {MartConsumer} from "states/context/MartContext";
import {importAll, _historyHandler} from "utils";

import AntMessage from 'components/partial/message/AntMessage';
import CategoryPanel from "./CategoryPanel";
import ClassPanel from "./ClassPanel";

const CheckboxGroup = Checkbox.Group;
const {Panel} = Collapse;

class CategoryModal extends React.Component {
    state = {
        categories: null,
        classies: null,
    }

    constructor(props) {
        super(props)
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (localStorage.getItem('assetCount')) {
            let count = localStorage.getItem('assetCount')
            return {
                count
            }
        }
        return null;
    }


    async componentDidMount() {
    }

    render() {
        const webpackContext = require.context('assets-lobby/img/mart', false, /\.(png|jpe?g|svg)$/);
        const images = importAll(webpackContext);

        const {
            refreshPage2
        } = this.props;

        return (
            <>
                <MartConsumer>
                    {
                        ({
                             sortByValue,
                             categoryVisible,
                             awardOptions, awardList,
                             // awardCheckAll, panelDisabled, awardIndeterminate,
                             classies,
                             selectedClassiesID,
                             categories,
                             selectedCategoriesID,

                             // functions
                             // _awardOnCheckAllChange, _togglePanel,
                             _awardOnChange, _toggleModal, _sortByOnChange,
                             _changeClassiesID,
                             _changeCategoriesID,
                             _clear
                         }) => {
                            return (
                                <div className="modals">
                                    <Modal
                                        title="Basic Modal"
                                        visible={categoryVisible}
                                        footer={null}
                                        maskClosable={false}
                                        onCancel={() => {
                                            refreshPage2()
                                            _toggleModal()
                                        }}
                                        className="mart-modal scroll-bar"
                                    >
                                        <div className="mart-modal-inner">
                                            <div className="mart-modal-inner_box mart-modal-inner__header">
                                                <img src={images['category.png']}/>
                                                <span
                                                    className="mart-modal-inner__header-result">{this.state.count} results</span>
                                                <span className="mart-modal-inner__header-clear"
                                                      onClick={_clear}>Clear</span>
                                                {/*<img className="mart-modal-inner__header-x"*/}
                                                {/*     src={images['x.png']}*/}
                                                {/*     onClick={(e) => _toggleModal(e)}/>*/}
                                            </div>

                                            <div className="mart-modal-inner_box">
                                                <div className="mart-modal-inner_box__title">
                                                    Sort by
                                                </div>
                                                <div className="mart-modal-inner_box__body">
                                                    <Radio.Group onChange={_sortByOnChange} value={sortByValue}>
                                                        <Radio value={'downloads'}>Downloads</Radio>
                                                        <Radio value={'likes'}>Likes</Radio>
                                                        <Radio value={'latest'}>Upload time</Radio>
                                                    </Radio.Group>
                                                </div>
                                            </div>

                                            <div className="mart-modal-inner_box">
                                                <div className="mart-modal-inner_box__title">
                                                    Award
                                                </div>
                                                <div className="mart-modal-inner_box__body">
                                                    <CheckboxGroup
                                                        options={awardOptions}
                                                        value={awardList}
                                                        onChange={_awardOnChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mart-modal-inner_box">
                                                <div className="mart-modal-inner_box__title">
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

                                            <div className="mart-modal-inner_box">
                                                <div className="mart-modal-inner_box__title">
                                                    Class
                                                </div>
                                                <div className="mart-modal-inner_box__body">
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
                                                                    _changeClassiesID={_changeClassiesID}
                                                                    // classies={classies} selectedClassiesID={selectedClassiesID}
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
                                    </Modal>
                                </div>
                            )
                        }
                    }
                </MartConsumer>

            </>
        )
    }
}

export default withApollo(withRouter(CategoryModal));
