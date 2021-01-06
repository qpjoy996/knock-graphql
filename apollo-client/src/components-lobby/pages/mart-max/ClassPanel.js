import React from 'react';
import {Checkbox} from 'antd';
import * as _ from 'lodash';
import {MartConsumer} from "states/context/MartContext";

const ClassCheckboxGroup = Checkbox.Group;

class ClassPanel extends React.Component {

    state = {
        checkedList: [],
        indeterminate: true,
        checkAll: false,
        plainOptions: [],

        filter: null
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.filter && nextProps.filter.classies && nextProps.filter.classies.length) {
            console.log(nextProps.filter, ' class panel !!!!');
            let classies = nextProps.filter.classies;
            let selectedClassiesID = nextProps.filter.selectedClassiesID;
            let keyedClassies = _.keyBy(classies, (o) => o.id);

            let selectedClassiesName = selectedClassiesID.map((item) => {
                return keyedClassies[item]['name']
            });

            console.log(selectedClassiesName);

            let plainOptions = classies.map((classy) => {
                return classy.name
            });

            console.log(plainOptions);
            // if (!(_.isEqual(plainOptions, prevState.plainOptions))) {
            return {
                plainOptions,
                checkedList: selectedClassiesName,
                filter: nextProps.filter
            }
            // }

            return null;
        } else {
            return null;
        }
    }

    constructor(props) {
        super(props);
    }

    onChange = checkedList => {
        const {
            _changeClassiesID,
            _refreshP2
        } = this.props;
        const {
            plainOptions,
            filter
        } = this.state;

        let classies = filter.classies;
        let keyedNames = _.keyBy(classies, (o) => o.name);

        let selectedClassiesID = checkedList.map((classy) => {
            return keyedNames[classy]['id'];
        });

        // set class panel state
        this.setState({
            checkedList,
            indeterminate: !!checkedList.length && checkedList.length < plainOptions.length,
            checkAll: checkedList.length === plainOptions.length,
        });

        // set mart state
        _changeClassiesID(selectedClassiesID, {
            _refreshP2
        });
    };

    onCheckAllChange = e => {
        const {
            plainOptions
        } = this.state;

        this.setState({
            checkedList: e.target.checked ? plainOptions : [],
            indeterminate: false,
            checkAll: e.target.checked,
        });
    };


    render() {
        const {
            plainOptions,
            checkedList
        } = this.state;
        return (
            <>
                <ClassCheckboxGroup
                    options={plainOptions}
                    value={checkedList}
                    onChange={this.onChange}
                />
            </>
        )
    }
}

export default ClassPanel;
