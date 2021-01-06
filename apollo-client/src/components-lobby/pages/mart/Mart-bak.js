import React from 'react';
import {Modal, Radio, Checkbox, Collapse} from 'antd';
import {debounce} from 'lodash';
import gql from 'graphql-tag';
import {withRouter} from 'react-router-guard';
import {withApollo} from 'react-apollo';

import Swiper from "../../partial/swipe/Swiper";
import AssetList from "./AssetList";
import HotList from "./HotList";

import AntMessage from 'components/partial/message/AntMessage';

import {importAll, _historyHandler} from "utils";
import errorHandler from "utils/errorHandler";

const {Panel} = Collapse;

const CertCheckboxGroup = Checkbox.Group;
const certOptions = ['随拿随用 (721)', '官方作品 (423)'];
const certList = [];

const GET_CATEGORIES = gql`
    query assetCategoryList {
        assetCategoryList {
            id
            name
            assetSubCategoryList{
                id
                name
            }
        }
    }
`;


class Mart extends React.Component {

  state = {
    keyword: '',
    searchKeyword: '',

    classy: [
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
    classyLess: [
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
    classyMore: [
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
    selectedClassy: [],

    types: [
      {
        id: 'type-mesh',
        text: 'Mesh',
        bgUrl: 'mesh.png'
      },
      {
        id: 'type-image',
        text: 'Image',
        bgUrl: '2d.png'
      },
      {
        id: 'type-archetype',
        text: 'Archetype',
        bgUrl: 'archetype.png'
      },
      {
        id: 'type-audio',
        text: 'Audio',
        bgUrl: 'audio.png'
      },
      {
        id: 'type-script',
        text: 'script',
        bgUrl: 'table.png'
      },
    ],
    selectedTypes: [],

    hots: [
      {
        "id": "5f124b84-eb3f-4d56-94f9-71f3a9388a1d",
        "author": "pid:bn3ui3ri5s0otlehh4fg",
        "name": "default name-2019-11-11 16:43:03.0228",
        "thumbnailURLs": ["http://davinci-testcdn.lilithgame.com/dev/pictures/bn4hu5ji5s0qg813dh60"],
        "types": [],
        "description": "default description",
        "categories": [],
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
        "categories": [],
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
        "categories": [],
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
        "categories": [],
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
        "categories": [],
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
        "categories": [],
        "views": 0,
        "saves": 0,
        "likes": 0,
        "timestamp": "0001-01-01T00:00:00Z",
        "__typename": "Asset"
      }
    ],
    selectedHots: [],

    categoryVisible: false,

    value: 1,

    panelDisabled: false,

    certList: certList,
    certIndeterminate: true,
    certCheckAll: false
  }

  constructor(props) {
    super(props);
  }

  async componentDidMount() {

  }

  getCategories = async (e) => {
    const {
      client
    } = this.props;

    try {
      let cateDT = await client.query({
        query: GET_CATEGORIES,
        // variables: {{}}
      });

      if (cateDT.data && cateDT.data.assetCategoryList && cateDT.data.assetCategoryList.length) {

      }
      console.log(cateDT, ' 0 0 0 0');
    } catch (error) {
      if (error.graphQLErrors) {
        error.graphQLErrors.map((err) => {
          if (err.extensions && err.extensions.errcode) {
            const errcode = err.extensions.errcode;
            console.log(errcode, ' - - - ', errorHandler(errcode));
            AntMessage.error(errorHandler(errcode));
          }
        })
      }
    }
  }

  showModal = () => {
    this.setState({
      categoryVisible: true,
    });
  };

  _debounceSearch = debounce(() => {
    const {
      searchKeyword
    } = this.state;

    this.setState({
      keyword: searchKeyword
    })
  }, 1000);

  _debounceSearchMill = debounce(() => {
    const {
      searchKeyword
    } = this.state;

    this.setState({
      keyword: searchKeyword
    })
  }, 100);

  _handleSearch = (e) => {
    if (e.key === 'Enter') {
      this._debounceSearchMill();
    }
  }

  _changeSearch = (e) => {
    const value = e.target.value;
    console.log(value)
    this.setState({
      searchKeyword: value
    });

    if (e.target.value && e.target.value.length > 2) {
      this._debounceSearch();
    } else if (e.target.value.length === 0) {
      this._debounceSearch();
    }
  }

  _maxium = (e) => {
    const {
      history
    } = this.props;
    if (window.qtJSON) {
      alert('window qtJSON')
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
      alert('else QT json')
      _historyHandler({jump: `/mart-max/assets`, history});
    }
  }

  toggleModal = () => {
    this.setState({
      categoryVisible: !this.state.categoryVisible
    })
  }


  onChange = e => {
    console.log('radio checked', e.target.value);
    this.setState({
      value: e.target.value,
    });
  };

  certOnChange = checkedList => {
    this.setState({
      certList: checkedList,
      certIndeterminate: !!certList.length && checkedList.length < certOptions.length,
      certCheckAll: checkedList.length === certOptions.length
    });
  }

  clickClassy = (e, item) => {
    let {
      classy,
      classyMore,
      classyLess,
      selectedClassy
    } = this.state;

    if (item.id === 'cate_more') {
      return this.setState({
        classy: classyMore,
        selectedClassy: [],
      })
    } else if (item.id === 'cate_hide') {
      return this.setState({
        classy: classyLess,
        selectedClassy: []
      })
    }

    this.setState({
      selectedClassy: [item]
    });
  }

  clickType = (e, item) => {
    let {
      types,
      selectedTypes
    } = this.state;

    this.setState({
      selectedTypes: [item]
    })
  }

  clickAsset = (e, item) => {
    let {
      hots
    } = this.state;

    this.setState({
      selectedHots: []
    })
  }

  certOnCheckAllChange = e => {
    e.stopPropagation();
    this.setState({
      certList: e.target.checked ? certOptions : [],
      certIndeterminate: false,
      certCheckAll: e.target.checked,
    });
  };

  render() {
    const webpackContext = require.context('assets-lobby/img/mart', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);

    const {
      searchKeyword,
      classy,
      selectedClassy,
      types,
      selectedTypes,
      hots,
      selectedHots,
      panelDisabled
    } = this.state;

    let selectedTypeIDs = selectedTypes.map((type) => type.id);
    let selectedClassyIDs = selectedClassy.map(classy => classy.id);

    return (
      <>
        <div className="mart-inner scroll-bar">
          <div className="search-box">
            <div className="search-box__l">
              <img className="search-box__l-icon" src={images['search.png']}/>
              <input
                id="mart-search"
                type="text"
                placeholder={'Search'}
                value={searchKeyword || ''}
                onChange={(e) => this._changeSearch(e)}
                onKeyDown={(e) => this._handleSearch(e)}
              />
            </div>
            {/*<img className="search-box__like" src={images['like.png']} alt={'喜欢'}/>*/}
            {/*<img className="search-box__like-red" src={images['like_red.svg']}  alt={'要不要喜欢'} />*/}
            <img className="search-box__like" src={images['category.png']} alt={'分类'}
                 title={'Show Filter'}
                 onClick={this.toggleModal}/>
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
                classy.length ? (
                  <>
                    {
                      classy.map((item) => {
                        return (
                          <div
                            className={`mart-classy-box_item ${(selectedClassyIDs.indexOf(item.id) >= 0) ? 'active' : ''}`}
                            key={item.id}
                          >
                            <div className="mart-classy-box_item-t"
                            >
                              <img src={images[item.bgUrl]}
                                   alt={item.id} title={item.text}
                                   onClick={(e) => this.clickClassy(e, item)}
                              />
                            </div>
                            <div className="mart-classy-box_item-b"
                                 alt={item.id} title={item.text}
                                 onClick={(e) => this.clickClassy(e, item)}
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
                  <div>no classy...</div>
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
                        return (
                          <div
                            className={`mart-tags-box_item ${(selectedTypeIDs.indexOf(item.id) >= 0) ? 'active' : ''}`}
                            key={item.id} onClick={(e) => this.clickType(e, item)}>
                            {/*${(selectedTypes.indexOf(item.text)>=0)?'active':''}*/}
                            <span className="mart-tags-box_item-text">
                                                        {
                                                          item.text
                                                        }
                                                    </span>
                            <div className="mart-tags-box_item-logo" style={{
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
            <AssetList/>
          </div>

          <Swiper/>

          <div className="maxium" onClick={(e) => this._maxium(e)}>
            <img src={images['maxium.png']}/>
          </div>
        </div>
        <div className="modals">
          <Modal
            title="Basic Modal"
            visible={this.state.categoryVisible}
            footer={null}
            className="mart-modal"
          >
            <div className="mart-modal-inner">
              <div className="mart-modal-inner__header">
                <img src={images['category.png']}/>
                <span className="mart-modal-inner__header-result">共145个结果</span>
                <span className="mart-modal-inner__header-clear">清空</span>
                <img className="mart-modal-inner__header-x" src={images['x.png']}
                     onClick={(e) => this.toggleModal(e)}/>
              </div>

              <div className="mart-modal-inner_box">
                <div className="mart-modal-inner_box__title">
                  排序
                </div>
                <div className="mart-modal-inner_box__body">
                  <Radio.Group onChange={this.onChange} value={this.state.value}>
                    <Radio value={1}>下载量</Radio>
                    <Radio value={2}>收藏量</Radio>
                    <Radio value={3}>上传时间</Radio>
                  </Radio.Group>
                </div>
              </div>

              <div className="mart-modal-inner_box">
                <div className="mart-modal-inner_box__title">
                  认证
                </div>
                <div className="mart-modal-inner_box__body">
                  <CertCheckboxGroup
                    options={certOptions}
                    value={this.state.certList}
                    onChange={this.certOnChange}
                  />
                </div>
              </div>

              <div className="mart-modal-inner_box">
                <div className="mart-modal-inner_box__title">
                  分类
                </div>

                <Collapse bordered={false} defaultActiveKey={['1']} className="mart-category"
                          expandIconPosition={"right"}>
                  <Panel disabled={panelDisabled} header={
                    <>
                      <Checkbox
                        indeterminate={this.state.certIndeterminate}
                        onChange={(e) => this.certOnCheckAllChange(e)}
                        checked={this.state.certCheckAll}
                        onMouseEnter={() => this.setState({
                          panelDisabled: true
                        })}
                        onMouseLeave={() => this.setState({
                          panelDisabled: false
                        })}
                      >
                        角色 (145)
                      </Checkbox>
                    </>
                  } key="1">
                    <CertCheckboxGroup
                      options={certOptions}
                      value={this.state.certList}
                      onChange={this.certOnChange}
                    />
                  </Panel>
                  <Panel disabled={panelDisabled} header={
                    <>
                      <Checkbox
                        indeterminate={this.state.certIndeterminate}
                        onChange={(e) => this.certOnCheckAllChange(e)}
                        checked={this.state.certCheckAll}
                        onMouseEnter={() => this.setState({
                          panelDisabled: true
                        })}
                        onMouseLeave={() => this.setState({
                          panelDisabled: false
                        })}
                      >
                        角色 (145)
                      </Checkbox>
                    </>
                  } key="2">
                    <CertCheckboxGroup
                      options={certOptions}
                      value={this.state.certList}
                      onChange={this.certOnChange}
                    />
                  </Panel>
                </Collapse>
              </div>

              <div className="mart-modal-inner_box">
                <div className="mart-modal-inner_box__title">
                  包含
                </div>
                <div className="mart-modal-inner_box__body">
                  <CertCheckboxGroup
                    options={certOptions}
                    value={this.state.certList}
                    onChange={this.certOnChange}
                  />
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </>
    )
  }
}

export default withApollo(withRouter(Mart));
