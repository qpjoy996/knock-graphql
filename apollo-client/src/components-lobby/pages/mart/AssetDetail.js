import React, {Component} from 'react';
import {Tabs, Modal, Button, Radio} from 'antd';
import {withApollo} from 'react-apollo';
import gql from 'graphql-tag';
import {Spring, animated, config} from 'react-spring/renderprops';

import AntMessage from 'components/partial/message/AntMessage';

import {importAll} from "utils";

const ASSET_INFO_QUERY = gql`
    query assetInfoQuery($id: String!) {
        assetInfo(id: $id) {
            id
            author
            name
            thumbnailURLs
            type
            description
            hashMethod
            hash
            tags
            views
            saves
            likes
            liked
            timestamp
        }
    }
`;

const ADD_ASSET_LIKE = gql`
    mutation addAssetFavorite($input: AddAssetFavoriteInput!) {
        addAssetFavorite(input: $input) {
            code
            msg
        }
    }
`;

const DEL_ASSET_LIKE = gql`
    mutation delAssetFavorite($input: DelAssetFavoriteInput!) {
        delAssetFavorite(input: $input) {
            code
            msg
        }
    }
`

class AssetDetail extends Component {

  state = {
    assetId: '',
    assetInfo: '',

    operator_flag: false,

    liked: false,
    isAuthor: false,

    ModalText: '',
    visible: false,
    confirmLoading: false,

    isIllegal: false,
    isFake: false,
    isAggressive: false,
    isHarass: false,

    x: 0,
    xDelta: 300,
    activeThumbnail: '',

    comment: ''
  }


  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = () => {
    this.setState({
      ModalText: '',
      confirmLoading: true,
    });
    setTimeout(() => {
      this.setState({
        visible: false,
        confirmLoading: false,
      });
    }, 2000);
  };

  handleCancel = () => {
    console.log('Clicked cancel button');
    this.setState({
      visible: false,
    });
  };


  constructor(props) {
    super(props);
  }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  }

  async componentDidMount() {
    const {
      match: {
        params: {
          id
        }
      }
    } = this.props;

    // alert(JSON.stringify(window.unityData))

    let assetInfoDT = await this.fetchAssetInfo(id);
    if (assetInfoDT.pass) {
      let assetInfo = assetInfoDT.data;
      let activeThumbnail = assetInfo.thumbnailURLs && assetInfo.thumbnailURLs[0];
      let liked = assetInfo.liked;

      await this.setStateAsync({
        assetInfo,
        activeThumbnail,
        liked
      });
    }
  }

  fetchAssetInfo = async (id) => {

    const {
      client
    } = this.props;

    return new Promise(async (resolve, reject) => {
      if (!id) {
        return resolve({
          pass: false,
          msg: 'id error'
        });
      }
      try {
        let dt = await client.query({
          query: ASSET_INFO_QUERY,
          fetchPolicy: 'no-cache',
          variables: {
            id
          }
        });

        if (dt.data && dt.data.assetInfo) {
          return resolve({
            pass: true,
            data: dt.data.assetInfo
          });
        } else {
          return resolve({
            pass: false,
            data: {}
          });
        }
      } catch (error) {
        console.log(error);
        // if (error.graphQLErrors) {
        //   error.graphQLErrors.map((err) => {
        //     if (err.extensions && err.extensions.errcode) {
        //       const errcode = err.extensions.errcode;
        //       console.log(errcode, ' - - - ', errorHandler(errcode));
        //       AntMessage.error(errorHandler(errcode));
        //     }
        //   })
        // }
        return reject({
          pass: false,
          data: {}
        })
      }
    })
  }

  _toggleFlag = (e) => {
    const {
      operator_flag
    } = this.state;

    this.setState({
      operator_flag: !operator_flag
    })
  }

  _toggleFlagState = (e, flag) => {
    const flagState = this.state[flag];

    this.setState({
      [flag]: !flagState
    });
  }

  _toggleLike = (e, isLike) => {
    const {
      client
    } = this.props;
    const {
      liked,
      isAuthor,
      assetInfo
    } = this.state;

    if (isLike === 'like') {
      client.mutate({
        mutation: ADD_ASSET_LIKE,
        variables: {
          input: {
            assetID: assetInfo.id
          }
        }
      }).then((dt) => {
        if (dt.data && dt.data.addAssetFavorite && dt.data.addAssetFavorite.code === 0) {
          AntMessage.success('Liked success!');
          this.setState({
            liked: true,
          });
        } else {
          AntMessage.error('Liked fail!');
        }
      }).catch((err) => {
        console.log(err)
        AntMessage.error('Liked error!');
      })
    } else {
      client.mutate({
        mutation: DEL_ASSET_LIKE,
        variables: {
          input: {
            assetID: assetInfo.id
          }
        }
      }).then((dt) => {
        if (dt.data && dt.data.delAssetFavorite && dt.data.delAssetFavorite.code === 0) {
          AntMessage.success('Disliked success!');
          this.setState({
            liked: false,
          });
        } else {
          AntMessage.error('Disliked fail!');
        }
      }).catch((err) => {
        console.log(err)
        AntMessage.error('Disliked error!');
      })
    }
  }


  el = React.createRef();
  spring = React.createRef();

  setX = () => {
    let {
      x
    } = this.state;
    if (this.el.current) {
      const width = this.el.current.offsetWidth;
      const scrollWidth = this.el.current.scrollWidth;

      const delta = scrollWidth - x;

      if (delta >= 300) {
        x += 300;
      } else if (delta < 300 && delta > 0) {
        x += delta;
      } else if (delta == 0) {
        return;
      }
      console.log(width, scrollWidth, x, ' - - -  -this is current el');
    }
    this.setState({
      x
    })
  }

  set_X = () => {
    let {
      x
    } = this.state;
    if (this.el.current) {
      const width = this.el.current.offsetWidth;
      const scrollWidth = this.el.current.scrollWidth;

      if (x >= 300) {
        x -= 300;
      } else if (x < 300) {
        x -= x
      } else if (x == 0) {
        return;
      }
    }

    this.setState({
      x
    })
  }


  setActiveThumbnail = (activeThumbnail) => {
    this.setState({
      activeThumbnail
    })
  }

  stop = () => this.spring.current.stop();

  addComment = (e) => {
    const {
      comment
    } = this.state;

    this.setState({
      comment: e.target.value
    })
  }

  render() {

    // chat_avatar_u5152.svg
    const webpackContext = require.context('assets-lobby/img/market', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);

    const x = this.el.current ? this.el.current.scrollLeft : 0;

    const {
      assetInfo,
      operator_flag,

      liked,
      isAuthor,

      visible,
      confirmLoading,
      ModalText,

      isIllegal,
      isFake,
      isAggressive,
      isHarass,

      activeThumbnail,
      comment
    } = this.state;

    let isLiked = liked;


    function callback(key) {
      console.log(key);
    }

    const {TabPane} = Tabs;

    const thumbnailURLs = assetInfo && assetInfo.thumbnailURLs;

    return (
      <>
        <div className="asset-detail">
          <div className="asset-detail--left">
            <div className="detail-carousel">
              <div className="detail-carousel_banner"
                // style={{backgroundImage: `url(${activeThumbnail})`}}
              >
                <img src={`${activeThumbnail ? activeThumbnail : ''}`}/>
              </div>
              <div className="detail-carousel_wall"
                   style={{display: `${thumbnailURLs.length && thumbnailURLs > 1 ? 'flex' : 'none'}`}}
              >
                <div className="image-wall">
                  <div className="scroll-operator" onClick={this.set_X}
                       style={{display: `${thumbnailURLs.length && thumbnailURLs > 5 ? 'flex' : 'none'}`}}
                  >
                    <img src={images['scroll-left.png']}/>
                  </div>

                  {
                    thumbnailURLs.length > 0 && (
                      <Spring
                        native
                        reset
                        from={{x}}
                        to={{x: this.state.x}}
                        ref={this.spring}
                        config={config.slow}
                      >
                        {
                          props => (
                            <animated.div
                              className="image-wall__list scroll-bar"
                              ref={this.el}
                              onWheel={this.stop}
                              scrollLeft={props.x}>
                              {
                                thumbnailURLs && thumbnailURLs.map(item => {
                                  return (
                                    <div
                                      key={item}
                                      className={activeThumbnail == item ? "image-wall__list-item active" : "image-wall__list-item"}
                                      onClick={(e) => this.setActiveThumbnail(item)}
                                      style={{
                                        backgroundImage: `url(${item})`
                                      }}>
                                    </div>
                                  )
                                })
                              }
                            </animated.div>
                          )
                        }
                      </Spring>
                    )
                  }

                  <div className="scroll-operator" onClick={this.setX}
                       style={{display: `${thumbnailURLs.length && thumbnailURLs > 5 ? 'flex' : 'none'}`}}
                  >
                    <img src={images['scroll-left.png']}/>
                  </div>
                </div>
              </div>
            </div>
            <div className="detail-description">
                        <pre className="detail-description__pre scroll-bar">{
                          `${assetInfo.description}`
                        }</pre>
            </div>
          </div>


          <div className="asset-detail--right">
            {
              assetInfo && (
                <div className="detail-panel">
                  <div className="detail-panel__title">
                    {
                      assetInfo.name
                    }
                  </div>
                  <div className="detail-panel__id">
                    ID:
                    {
                      assetInfo.id
                    }
                  </div>
                  <div className="detail-panel__operator">

                    {
                      isLiked ? (
                        <div className="detail-panel__operator-liked operator-btn"
                             onClick={(e) => this._toggleLike(e, 'liked')}>
                          <a className="link-btn">
                                                <span>
                                                <img src={images['heart_solid_white.png']}/>
                                                    Liked
                                                </span>
                          </a>
                        </div>
                      ) : (
                        <div className="detail-panel__operator-like operator-btn"
                             onClick={(e) => this._toggleLike(e, 'like')}>
                          <a className="link-btn">
                                            <span>
                                                <img src={images['heart_white.png']}/>
                                                Like
                                            </span>
                          </a>
                        </div>

                      )
                    }
                  </div>
                  <div className="detail-panel__date detail-panel--row">
                    <img src={images['s-calendar.png']}/>
                    {
                      assetInfo.timestamp ? assetInfo.timestamp.split('T')[0] : ''
                    }
                    &nbsp;update
                  </div>
                  <div className="detail-panel__views detail-panel--row">
                    <img src={images['s-views.png']}/>
                    {
                      assetInfo.views
                    }
                    &nbsp;views
                  </div>
                  <div className="detail-panel__saves detail-panel--row">
                    <img src={images['s-saves.png']}/>
                    {
                      assetInfo.saves
                    }
                    &nbsp;saves
                  </div>
                </div>
              )
            }
          </div>
        </div>
        <div className="modals">
          <Modal
            title="举报"
            visible={visible}
            onOk={this.handleOk}
            confirmLoading={confirmLoading}
            onCancel={this.handleCancel}
            footer={[
              <div className="modal-footer">
                <div className="a-btn" key="back" onClick={this.handleCancel}>
                  取消
                </div>
              </div>
              ,
              <div className="modal-footer">
                <div className="a-btn" key="submit" onClick={this.handleOk}>
                  提交
                </div>
              </div>
              ,
            ]}
            className="report-modal"
          >
            <div className="report-body">
              <div className="radio_group">
                <Radio className="radio_group__item" checked={isIllegal}
                       onClick={(e) => this._toggleFlagState(e, 'isIllegal')}>散播违法内容</Radio>
                <Radio className="radio_group__item" checked={isAggressive}
                       onClick={(e) => this._toggleFlagState(e, 'isAggressive')}>骚扰、人身攻击</Radio>
              </div>

              <div className="radio_group">
                <Radio className="radio_group__item" checked={isFake}
                       onClick={(e) => this._toggleFlagState(e, 'isFake')}>冒充他人</Radio>
                <Radio className="radio_group__item" checked={isHarass}
                       onClick={(e) => this._toggleFlagState(e, 'isHarass')}>发送垃圾信息</Radio>
              </div>
            </div>

            <textarea placeholder={`备注说明 （非必填）`} value={ModalText}></textarea>


          </Modal>


          <Modal
            className=""
          ></Modal>
        </div>
      </>
    )
  }
}

export default withApollo(AssetDetail);
