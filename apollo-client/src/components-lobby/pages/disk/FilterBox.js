import React from 'react'
import {Drawer, Radio, Checkbox} from 'antd';

import { DiskConsumer } from "states/context/DiskContext";
import CategoryPanel from "../mart/CategoryPanel";
import ClassPanel from "../mart/ClassPanel";


const CheckboxGroup = Checkbox.Group;

class FilterBox extends React.Component {
  
  // static getDerivedStateFromProps(nextProps, prevState) {
  //   if (localStorage.getItem('assetCount')) {
  //       let count = localStorage.getItem('assetCount')
  //       return {
  //           count
  //       }
  //   }
  //   return null;
  // }


  render() {
    return (
      <DiskConsumer>
        {({
          resTotal,
          visibleFilterBox,
          _clear,
          showDrawer,
          onClose,
          _sortByOnChange,
          sortByValue,
          awardOptions,
          awardList,
          awardOnChange,
          categories = [],
          selectedCategoriesID,
          _changeCategoriesID,
          classies,
          selectedClassiesID,
          _changeClassiesID
        }) => {
          return <Drawer
            width="80%"
            title=""
            placement="right"
            drawerStyle={{
              background: '#333'
            }}
            closable
            onClose={onClose}
            visible={visibleFilterBox}
            className="FilterBox"
            getContainer={false}
            // style={{ position: 'absolute' }}
          >
            <div className="head">
              <span className="icon"></span>
              <span className="total">{resTotal} results</span>
              <span className="clear" onClick={_clear}>Clear</span>
            </div>
            <div className="cont">
              <div className="itemBox">
                <div className="title">
                  Award
                </div>
                <div className="body">
                  <CheckboxGroup
                      options={awardOptions}
                      value={awardList}
                      onChange={awardOnChange}
                    />
                </div>
              </div>
              <div className="itemBox">
                <div className="title">
                  Categories
                </div>
                <div className="body categories">
                {
                  categories.length ? categories.map((category, index) => {
                    return (
                      <React.Fragment key={category.name}>
                        <CategoryPanel
                          filter={{
                            category,
                            categories,
                            selectedCategoriesID
                          }}
                          _changeCategoriesID={_changeCategoriesID}
                          category={category} />
                      </React.Fragment>
                    )
                  }) : (
                      <div>
                        No categories...
                      </div>
                    )
                }
                </div>
              </div>

              <div className="itemBox">
                <div className="title">
                Class
                </div>
                <div className="body class">
                {
                    classies.length ? (
                      <>
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
          </Drawer>}
        }

      </DiskConsumer>
    );
  }
}

export default FilterBox