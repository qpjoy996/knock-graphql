import React from 'react';
import gql from 'graphql-tag';
import {withRouter} from 'react-router-guard';
import {withApollo} from 'react-apollo';
import * as _ from 'lodash';

import {_historyHandler} from "utils";
import {GET_CATEGORIES} from "apollo/graphql/gql";

const MartContext = React.createContext('mart');
const {Provider, Consumer} = MartContext;


class MartProvider extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // swipe
      swipeIndex: 0,

      // count
      count: 0,

      // search
      keyword: '',
      searchKeyword: '',

      // sortBy: '',

      // categoriesView or types
      categoriesView: [
        {
          id: 'cate_character',
          text: 'Character',
          bgColor: '#E88272',
          bgUrl: 'juese.png'
        },
        {
          id: 'cate_environment',
          text: 'Environment',
          bgColor: '#FFD36F',
          bgUrl: 'rghj.png'
        },
        {
          id: 'cate_vehicle',
          text: 'Vehicle',
          bgColor: '#AA7CFB',
          bgUrl: 'zaiju.png'
        },
        {
          id: 'cate_weapon',
          text: 'Weapon',
          bgColor: '#5794F6',
          bgUrl: 'wuqi.png'
        },
        {
          id: 'cate_item',
          text: 'Item',
          bgColor: '#E7A0AA',
          bgUrl: 'daoju.png'
        },
        {
          id: 'cate_interior',
          text: 'Interior',
          bgColor: '#80E5DF',
          bgUrl: 'jiazhuang.png'
        },
        {
          id: 'cate_plant',
          text: 'Plant',
          bgColor: '#70CB74',
          bgUrl: 'ziran.png'
        },
        {
          id: 'cate_more',
          text: 'More',
          bgColor: '#525E70',
          bgUrl: 'more.png'
        },
      ],
      categoriesViewLess: [
        {
          id: 'cate_character',
          text: 'Character',
          bgColor: '#E88272',
          bgUrl: 'juese.png'
        },
        {
          id: 'cate_environment',
          text: 'Environment',
          bgColor: '#FFD36F',
          bgUrl: 'rghj.png'
        },
        {
          id: 'cate_vehicle',
          text: 'Vehicle',
          bgColor: '#AA7CFB',
          bgUrl: 'zaiju.png'
        },
        {
          id: 'cate_weapon',
          text: 'Weapon',
          bgColor: '#5794F6',
          bgUrl: 'wuqi.png'
        },
        {
          id: 'cate_item',
          text: 'Item',
          bgColor: '#E7A0AA',
          bgUrl: 'daoju.png'
        },
        {
          id: 'cate_interior',
          text: 'Interior',
          bgColor: '#80E5DF',
          bgUrl: 'jiazhuang.png'
        },
        {
          id: 'cate_plant',
          text: 'Plant',
          bgColor: '#70CB74',
          bgUrl: 'ziran.png'
        },
        {
          id: 'cate_more',
          text: 'More',
          bgColor: '#525E70',
          bgUrl: 'more.png'
        },
      ],
      categoriesViewMore: [
        {
          id: 'cate_character',
          text: 'Character',
          bgColor: '#E88272',
          bgUrl: 'juese.png'
        },
        {
          id: 'cate_environment',
          text: 'Environment',
          bgColor: '#FFD36F',
          bgUrl: 'rghj.png'
        },
        {
          id: 'cate_vehicle',
          text: 'Vehicle',
          bgColor: '#AA7CFB',
          bgUrl: 'zaiju.png'
        },
        {
          id: 'cate_weapon',
          text: 'Weapon',
          bgColor: '#5794F6',
          bgUrl: 'wuqi.png'
        },
        {
          id: 'cate_item',
          text: 'Item',
          bgColor: '#E7A0AA',
          bgUrl: 'daoju.png'
        },
        {
          id: 'cate_interior',
          text: 'Interior',
          bgColor: '#80E5DF',
          bgUrl: 'jiazhuang.png'
        },
        {
          id: 'cate_plant',
          text: 'Plant',
          bgColor: '#70CB74',
          bgUrl: 'ziran.png'
        },
        {
          id: 'cate_skybox',
          text: 'Sky box',
          bgColor: '#7CCBFB',
          bgUrl: 'tiankonghe.png'
        },
        {
          id: 'cate_terrain',
          text: 'Terrain',
          bgColor: '#7CFBBA',
          bgUrl: 'dixing.png'
        },
        {
          id: 'cate_effect',
          text: 'Effect',
          bgColor: '#867CFB',
          bgUrl: 'lizitexiao.png'
        },
        {
          id: 'cate_sound',
          text: 'Sound',
          bgColor: '#FFC500',
          bgUrl: 'audio.png'
        },
        {
          id: 'cate_other',
          text: 'Other',
          bgColor: '#FBA37C',
          bgUrl: 'qita.png'
        },
        {
          id: 'cate_hide',
          text: 'Hide',
          bgColor: '#525E70',
          bgUrl: 'arrowdown.png'
        },
      ],
      selectedCategory: [],
      selectedCategoriesID: [],
      types: [
        {
          id: 'type-mesh',
          text: 'Mesh',
          bgUrl: 'new-Mesh.svg'
        },
        {
          id: 'type-image',
          text: 'Image',
          bgUrl: 'new-2D.svg'
        },
        {
          id: 'type-archetype',
          text: 'Archetype',
          bgUrl: 'new-Archetype.svg'
        },
        {
          id: 'type-audio',
          text: 'Audio',
          bgUrl: 'new-Audio.svg'
        },
        {
          id: 'type-script',
          text: 'Script',
          bgUrl: 'new-Table.svg'
        },
      ],
      selectedTypes: [],
      classies: [],
      selectedClassiesID: [],

      // hot
      hots: [
        {
          "id": "5f124b84-eb3f-4d56-94f9-71f3a9388a1d",
          "author": "pid:bn3ui3ri5s0otlehh4fg",
          "name": "default name-2019-11-11 16:43:03.0228",
          "thumbnailURLs": ["http://davinci-testcdn.lilithgame.com/dev/pictures/bn4hu5ji5s0qg813dh60"],
          "types": [],
          "description": "default description",
          "categoriesView": [],
          "views": 0,
          "saves": 0,
          "likes": 0,
          "timestamp": "2019-11-11T08:43:03.022Z",
          "__typename": "Asset"
        },
        {
          "id": "87883cb8-10d5-48e4-97f2-c4444201efd1",
          "author": "pid:bn3ui3ri5s0otlehh4fg",
          "name": "default name",
          "thumbnailURLs": ["http://davinci-testcdn.lilithgame.com/dev/pictures/bn4hu5ji5s0qg813dh50"],
          "types": [],
          "description": "default description",
          "categoriesView": [],
          "views": 0,
          "saves": 0,
          "likes": 0,
          "timestamp": "2019-11-11T08:43:02.771Z",
          "__typename": "Asset"
        },
        {
          "id": "a3d38849-0d48-4f82-af4e-75ab2b4a0608",
          "author": "pid:bn0j4pbi5s0ou9v8p24g",
          "name": "dddd",
          "thumbnailURLs": ["http://davinci-testcdn.lilithgame.com/dev/pictures/bn1u4fji5s0s5o8mvvr0"],
          "types": [],
          "description": "ddd",
          "categoriesView": [],
          "views": 0,
          "saves": 0,
          "likes": 0,
          "timestamp": "2019-11-07T09:22:06.721Z",
          "__typename": "Asset"
        },
        {
          "id": "15c043bc-4ee6-403a-94d7-1dff4458c8ab",
          "author": "pid:bn0j4pbi5s0ou9v8p24g",
          "name": "fddd",
          "thumbnailURLs": ["http://davinci-testcdn.lilithgame.com/dev/pictures/bn1t2bji5s0ubjl2vee0"],
          "types": [],
          "description": "ddd",
          "categoriesView": [],
          "views": 0,
          "saves": 0,
          "likes": 0,
          "timestamp": "2019-11-07T08:09:18.64Z",
          "__typename": "Asset"
        },
        {
          "id": "c3274606-fa0f-4260-a114-363311a4a0c2",
          "author": "CiTestUserId",
          "name": "",
          "thumbnailURLs": ["http://davinci-testcdn.lilithgame.com/dev/pictures/bn4fu6ji5s0g330fv6rg"],
          "types": [],
          "description": "",
          "categoriesView": [],
          "views": 0,
          "saves": 0,
          "likes": 0,
          "timestamp": "0001-01-01T00:00:00Z",
          "__typename": "Asset"
        },
        {
          "id": "cf4d83b4-cb78-40f4-a167-82f283eb5d29",
          "author": "CiTestUserId",
          "name": "",
          "thumbnailURLs": ["http://davinci-testcdn.lilithgame.com/dev/pictures/bn4g1tri5s0jiqs3g4mg"],
          "types": [],
          "description": "",
          "categoriesView": [],
          "views": 0,
          "saves": 0,
          "likes": 0,
          "timestamp": "0001-01-01T00:00:00Z",
          "__typename": "Asset"
        }
      ],
      selectedHots: [],

      categoryVisible: false,

      sortByValue: 'latest',
      panelDisabled: false,

      // Award
      awardOptions: ['Officials'],
      awardList: ['Officials'],
      awardIndeterminate: true,
      awardCheckAll: false,

      levels: [],
      levelIDs: [1],

      _setCount: this._setCount,
      _toggleSwipe: this._toggleSwipe,
      _awardOnChange: this._awardOnChange,
      _maxAwardOnChange: this._maxAwardOnChange,
      _changeSearch: this._changeSearch,
      _handleSearch: this._handleSearch,
      _toggleModal: this._toggleModal,
      _sortByOnChange: this._sortByOnChange,
      _clickCategory: this._clickCategory,
      _clickType: this._clickType,
      _maxium: this._maxium,
      goDisklink: this.goDisklink,
      _awardOnCheckAllChange: this._awardOnCheckAllChange,
      _togglePanel: this._togglePanel,
      _categoryOnChange: this._categoryOnChange,
      _changeClassiesID: this._changeClassiesID,
      _changeCategoriesID: this._changeCategoriesID,
      _changeSortByValue: this._changeSortByValue,
      _clear: this._clear,
      isAnimatedFn: this.isAnimatedFn,
      hadnleGoback: this.hadnleGoback,
      isAnimated: true
    }
  }

  async componentDidMount() {
    let categoryDT = await this.getCategoriesClassies();
    if (categoryDT.pass) {
      let assetLevelList = categoryDT.data.assetLevelList;

      let levels = assetLevelList.map((level) => {
        return level.name;
      });

      this.setState({
          categories: categoryDT.data.assetCategoryList,
          classies: categoryDT.data.assetClassList,
          levels: assetLevelList,
          awardOptions: levels,
        }
        // , () => {
        //     let categoriesID = this.getCategoriesID();
        //     this.setState({
        //         categoriesID
        //     })
        // }
      );
    } else {
      this.setState({
        categories: [],
        classies: [],
        levels: [],
        awardOptions: []
      })
    }
  }

  getCategoriesClassies = async () => {
    const {
      client
    } = this.props;

    return new Promise((resolve, reject) => {
      client.query({
        query: GET_CATEGORIES,
        fetchPolicy: 'no-cache'
      }).then((dt) => {
        if (dt.data && dt.data.assetCategoryList && dt.data.assetCategoryList.length && dt.data.assetClassList && dt.data.assetClassList.length && dt.data.assetLevelList) {
          resolve({
            pass: true,
            data: dt.data
          });
        } else {
          resolve({
            pass: false,
            data: {}
          });
        }
      }).catch((error) => {
        return reject({
          pass: false,
          data: {}
        })
      })
    })
  }

  getCategoriesID = (categoryName) => {
    const {
      categories
    } = this.state;

    let categoriesID = [];

    console.log(categoryName, ' - - - - - - - category Name !!!!');

    if (categoryName) {
      for (let i = 0; i < categories.length; i++) {
        if (categoryName === categories[i].name) {
          if (categories[i].id) {
            categoriesID.push(categories[i].id)
          } else {
            let subCategories = categories[i].assetSubCategoryList;
            if (subCategories && subCategories.length) {
              for (let j = 0; j < subCategories.length; j++) {
                if (subCategories[j].id) {
                  categoriesID.push(subCategories[j].id);
                }
              }
            }
          }
        }
      }
    } else {
      for (let i = 0; i < categories.length; i++) {
        if (categories[i].id) {
          categoriesID.push(categories[i].id)
        } else {
          let subCategories = categories[i].assetSubCategoryList;
          if (subCategories && subCategories.length) {
            for (let j = 0; j < subCategories.length; j++) {
              if (subCategories[j].id) {
                categoriesID.push(subCategories[j].id);
              }
            }
          }
        }
      }
    }

    return categoriesID;
  }

  getClassiesID = (typeName) => {
    const {
      classies
    } = this.state;

    let classiesID = [];

    if (typeName) {
      for (let i = 0; i < classies.length; i++) {
        if (typeName === classies[i].name) {
          classiesID.push(classies[i].id);
        }
      }
    } else {
      for (let i = 0; i < classies.length; i++) {
        classiesID.push(classies[i].id);
      }
    }
    return classiesID;
  }

  _toggleSwipe = e =>
    this.setState(state => ({
      selectedCategory: [],
      selectedTypes: [],
      swipeIndex: state.swipeIndex === 1 ? 0 : state.swipeIndex + 1,
      count: 0,
    }))

  hadnleGoback = e =>
    this.setState(state => ({
      selectedCategory: [],
      selectedTypes: [],
      swipeIndex: state.swipeIndex === 1 ? 0 : state.swipeIndex + 1,
      count: 0,
      keyword: '',
      searchKeyword: '',
      selectedCategoriesID: [],
      selectedClassiesID: []
    }))

  _debounceSearch = _.debounce(() => {
    const {
      searchKeyword
    } = this.state;

    this.setState({
      keyword: searchKeyword
    })
  }, 1000);

  _debounceSearchMill = _.debounce((options) => {
    const {
      searchKeyword
    } = this.state;

    this.setState({
      keyword: searchKeyword
    }, () => {
      if (options && options._refreshP2) {
        options._refreshP2(()=>{
          this.setState({
            isAnimated: true
          })
        });
      } else {
        this._toggleSwipe();
      }
    });
  }, 100);

  _handleSearch = (e, options) => {
    const { isAnimated } = this.state
    
    if (e.key === 'Enter' && isAnimated) {
      this.setState({
        isAnimated: false
      }, () => {
        this._debounceSearchMill(options);
      })
    }
  }

  _togglePanel = (e) => {
    this.setState(state => ({
      panelDisabled: !state.panelDisabled
    }))
  }

  _changeSearch = (e) => {
    const value = e.target.value;
    this.setState({
      searchKeyword: value
    });

    // if (e.target.value && e.target.value.length > 2) {
    //     this._debounceSearch();
    // } else if (e.target.value.length === 0) {
    //     this._debounceSearch();
    // }
  }

  _changeClassiesID = (selectedClassiesID, options) => {
    this.setState({
      selectedClassiesID
    }, () => {
      if (options && options._refreshP2) {
        options._refreshP2();
      } else {
        console.log('do nothing in _changeClassiesID');
      }
    })
  }
  _changeCategoriesID = (selectedCategoriesID, options) => {
    this.setState({
      selectedCategoriesID
    }, () => {
      if (options && options._refreshP2) {
        options._refreshP2();
      } else {
        console.log('do nothing in _changeCategoriesID');
      }
    })
  }

  _changeSortByValue = (sortByValue, options) => {
    this.setState({
      sortByValue
    }, () => {
      if (options && options._refreshP2) {
        options._refreshP2();
      } else {
        console.log('do nothing in _changeCategoriesID');
      }
    })
  }

  _setCount = (count) => {
    this.setState({
      count
    })
  }

  _clear = (e, options) => {
    this.setState({
      count: 0,
      keyword: '',
      searchKeyword: '',
      selectedCategoriesID: [],
      selectedClassiesID: []
    }, () => {
      if (options && options._refreshP2) {
        options._refreshP2();
      } else {
        console.log('do nothing in _clear');
      }
    })
  }

  _maxium = (e) => {
    const {
      history
    } = this.props;
    if (window.qtJSON) {
      let json = {
        type: 'emit',
        name: 'martMax',
        cb: function () {
          // return asset.id;
          return JSON.stringify({
            operator: 'maxium'
          });
        }
      };
      window.qtJSON(json);
    } else {
      _historyHandler({jump: `/mart-max/assets`, history});
    }
  }
  goDisklink = (e) => {
    const {
      history
    } = this.props;
    _historyHandler({jump: `/disk/home`, history});
  }

  _toggleModal = () => {
    this.setState({
      categoryVisible: !this.state.categoryVisible
    })
  }

  _sortByOnChange = e => {
    this.setState({
      sortByValue: e.target.value,
    });
  };

  // _changeAward = ()
  _awardOnChange = (checkedList, options) => {
    const {
      levels,
      awardList,
      awardOptions
    } = this.state;

    let keyedLevelNames = _.keyBy(levels, 'name');

    let levelIDs = checkedList.map((item) => {
      return keyedLevelNames[item]['id'];
    });

    this.setState({
      awardList: checkedList,
      levelIDs,
      awardIndeterminate: !!awardList.length && checkedList.length < awardOptions.length,
      awardCheckAll: checkedList.length === awardOptions.length
    }, () => {
      if (options && options._refreshP2) {
        options._refreshP2();
      } else {
        console.log('do nothing in maxAwardOnChange');
      }
    });
  }

  _categoryOnChange = (checkedList, a, b, c) => {
    console.log(checkedList, a, b, c, ' -- - - checkedList');

  }

  _clickCategory = (e, item) => {
    let {
      searchKeyword,
      categoriesViewMore,
      categoriesViewLess,
    } = this.state;

    if (item.id === 'cate_more') {
      return this.setState({
        categoriesView: categoriesViewMore,
        selectedCategory: [],
      })
    } else if (item.id === 'cate_hide') {
      return this.setState({
        categoriesView: categoriesViewLess,
        selectedCategory: []
      })
    }

    let selectedCategoriesID = this.getCategoriesID(item.text);
    let selectedClassiesID = this.getClassiesID();

    this.setState({
      keyword: searchKeyword,
      selectedCategory: [item],
      selectedTypes: [],
      selectedCategoriesID,
      selectedClassiesID
    }, () => {
      // this._toggleSwipe();
      this.setState(state => ({
        swipeIndex: state.swipeIndex === 1 ? 0 : state.swipeIndex + 1,
      }))
    });
  }

  _clickType = (e, item) => {
    let {
      searchKeyword,
    } = this.state;

    let selectedCategoriesID = this.getCategoriesID();
    let selectedClassiesID = this.getClassiesID(item.text);

    this.setState({
      keyword: searchKeyword,
      selectedCategory: [],
      selectedTypes: [item],
      selectedCategoriesID,
      selectedClassiesID,
    }, () => {
      this._toggleSwipe();
    });
  }

  _clickAsset = (e, item) => {
    let {
      hots
    } = this.state;

    this.setState({
      selectedHots: []
    })
  }

  _awardOnCheckAllChange = e => {
    e.stopPropagation();
    this.setState({
      awardList: e.target.checked ? this.state.awardOptions : [],
      awardIndeterminate: false,
      awardCheckAll: e.target.checked,
    });
  };

  // 转场动画结束回调函数，防止重复跳转
  isAnimatedFn = (res) => {
    this.setState({
      isAnimated: true
    })

  }

  render() {
    const {
      categoriesView,
      classies
    } = this.state;
    return (
      <>
        {
          classies.length ? (
            <Provider value={this.state}>
              {
                this.props.children
              }
            </Provider>
          ) : (
            <>
              No categoriesView && No classies
            </>
          )
        }

      </>
    )
  }
}

function withMart(Component) {
  return function Marted(props) {
    return (
      <Consumer>
        {
          () => (
            <Component {...props}/>
          )
        }
      </Consumer>
    )
  }
}

let defaultMart = withApollo(withRouter(MartProvider));

export {
  defaultMart as MartProvider,
  Consumer as MartConsumer,
  MartContext,
  withMart
}
