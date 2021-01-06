import React from 'react';
import {Checkbox, Collapse} from 'antd';
import * as _ from 'lodash';

const CheckboxGroup = Checkbox.Group;
const {Panel} = Collapse;


class CategoryPanel extends React.Component {

    state = {
        category: null,
        panelDisabled: false,
        checkedList: [],
        indeterminate: true,
        checkAll: false,
        plainOptions: [],
        key: '',

        filter: null
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.filter && nextProps.filter.category) {
            // console.log(!(_.isEqual(prevState.filter, nextProps.filter)), prevState.filter, nextProps.filter, ' - - - - - - -- in getderived');
            let category = nextProps.filter.category;
            let selectedCategoriesID = nextProps.filter.selectedCategoriesID;

            if(category.id) {
                let checkAll = (selectedCategoriesID.indexOf(category.id) >=0) ? true: false;

                return {
                    category,
                    plainOptions: [],
                    checkedList: [],
                    checkAll,
                    filter: nextProps.filter
                }
            }

            let subCategoryList = category.assetSubCategoryList;
            let plainOptions = [];
            let checkedList = [];
            if (category.assetSubCategoryList) {
                plainOptions = subCategoryList.map((subCategory) => {
                    if (selectedCategoriesID.indexOf(subCategory.id) >= 0) {
                        checkedList.push(subCategory.name);
                    }
                    return subCategory.name
                });
            }

            if (!(_.isEqual(prevState.filter, nextProps.filter)) || !nextProps.filter.selectedCategoriesID.length || !checkedList.length) {
                let checkAll = (_.isEqual(plainOptions, checkedList) && plainOptions.length) ? true : false;

                if (checkedList.length) {
                    return {
                        category,
                        plainOptions,
                        checkedList,
                        checkAll,
                        key: category.name,
                        filter: nextProps.filter
                    }
                } else {
                    return {
                        category,
                        plainOptions,
                        checkedList,
                        checkAll,
                        filter: nextProps.filter
                    }
                }
            }
        }
        return null
    }


    onChange = checkedList => {
        const {
            _changeCategoriesID
        } = this.props
        const {
            category,
            filter
        } = this.state;


        let selectedCategoriesID = filter.selectedCategoriesID;

        let assetSubCategoryList = category.assetSubCategoryList;
        let keyedAssetSubCategoryNameList = _.keyBy(assetSubCategoryList, 'name');
        let subCategoriesIDList = assetSubCategoryList.map((subCategory) => {
            return subCategory.id;
        });

        let removed = _.remove(selectedCategoriesID, (o) => subCategoriesIDList.indexOf(o) >= 0);
        console.log(removed);

        let checkedIDList = checkedList.map((item) => {
            return keyedAssetSubCategoryNameList[item]['id']
        });

        _changeCategoriesID([...selectedCategoriesID, ...checkedIDList]);
        // set global state
        // let selectedCategoriesID = filter.s

        // set local state

        // this.setState({
        //     checkedList,
        //     indeterminate: !!checkedList.length && checkedList.length < plainOptions.length,
        //     checkAll: checkedList.length === plainOptions.length,
        // });
    };

    onCheckAllChange = e => {
        const {
            _changeCategoriesID
        } = this.props
        const {
            category,
            filter
        } = this.state;

        let checked = e.target.checked;
        let selectedCategoriesID = filter.selectedCategoriesID;

        let needMergeIDList = [];

        if (category.id) {
            needMergeIDList = [category.id];
        } else {
            let assetSubCategoryList = category.assetSubCategoryList;
            let subCategoriesIDList = assetSubCategoryList.map((subCategory) => {
                return subCategory.id;
            });
            needMergeIDList = subCategoriesIDList;
        }
        let removed = _.remove(selectedCategoriesID, (o) => needMergeIDList.indexOf(o) >= 0);

        console.log(selectedCategoriesID, removed);
        if (checked) {
            _changeCategoriesID([...selectedCategoriesID, ...needMergeIDList]);
        } else {
            _changeCategoriesID([...selectedCategoriesID]);
        }
    };

    _togglePanel = (e) => {
        this.setState(state => ({
            panelDisabled: !state.panelDisabled
        }))
    }

    render() {
        const {
            category,
            panelDisabled,
            indeterminate,
            checkedList,
            checkAll,
            plainOptions,
            key
        } = this.state;

        return (
            <>
                {
                    (category) ? (
                        <Collapse bordered={false}
                                  defaultActiveKey={key ? [key] : []}
                                  className="mart-category"
                                  expandIconPosition={"right"}>
                            <Panel
                                key={category.name}
                                disabled={panelDisabled} header={
                                <>
                                    <Checkbox
                                        indeterminate={indeterminate}
                                        onChange={this.onCheckAllChange}
                                        checked={checkAll}
                                        onMouseEnter={() => this._togglePanel()}
                                        onMouseLeave={() => this._togglePanel()}
                                    >
                                        {
                                            category.name
                                        }
                                    </Checkbox>
                                </>
                            }
                            >
                                <CheckboxGroup
                                    options={plainOptions}
                                    value={checkedList}
                                    onChange={this.onChange}
                                />
                            </Panel>
                        </Collapse>
                    ) : (
                        <div>
                            加载中...
                        </div>
                    )
                }

            </>
        )
    }
}

export default CategoryPanel;
