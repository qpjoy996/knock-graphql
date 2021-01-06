import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { SERVER } from 'states/APP_STATE'

const OPENINGDEV_ACTIVTYLIST = gql`
query OpeningDevActivtyList{
  openingDevActivtyList{
    list{
      summary{
        id
        title
        groupedSum
        publishedGameSum
        beginTime
        endTime
        registrationDeadline
      }
      bannerURLs
      descriptionMarkdown
      descriptionHTML
      descriptionURLs
    }
    totalCount
  }
}`

let imgLength = 0;
class GameBanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timer: null,
      showIndex: 0,
      loadPage: false
    }
  }

  componentDidMount () {
    this.setState({
      loadPage: true
    });
    this.bannerStart();
    const that = this;
    if (window.qtJSON) {
      let json = {
        type: 'on',
        name: 'refreshProfile',
        cb: function () {
          that._refreshPage()
        }
      }
      window.qtJSON(json);
    }
  }

  componentWillUnmount () {
    this.bannerStop();
  }

  _refreshPage = () => {
    this.setState({
      loadPage: false,
    }, () => {
      this.setState({
        loadPage: true
      });
    });
  }

  // 轮播开始
  bannerStart = () => {
    let { timer } = this.state;
    timer = setInterval(() => {
      this.bannerNext();
    }, 5000);
    this.setState({
      timer
    })
  }
  //暂停
  bannerStop = () => {
    let { timer } = this.state;
    clearInterval(timer);
  }
  //点击下面的按钮切换当前显示的图片
  bannerChange = (index) => {
    let { showIndex } = this.state;
    showIndex = index;
    this.setState({
      showIndex
    })

  }
  bannerPrevious = (e) => {
    let { showIndex } = this.state;
    let ev = e || window.event;
    if (showIndex <= 0) {
      showIndex = imgLength - 1;
    } else {
      showIndex--;
    }
    this.setState({
      showIndex
    })
  }
  bannerNext = (e) => {
    let { showIndex } = this.state;
    let ev = e || window.event;
    if (showIndex >= imgLength - 1) {
      showIndex = 0;
    } else {
      showIndex++;
    }
    this.setState({
      showIndex
    })
  }

  gameDescription = (id) => {
    let descriptionURLs;
    if (SERVER === 'local')
      descriptionURLs = 'http://192.168.114.124:3000/activity/' + id
    else if (SERVER === 'dev')
      descriptionURLs = 'http://davinci-test.lilithgames.com/activity/' + id
    else if (SERVER === 'alpha' || SERVER === 'oversea-test')
      descriptionURLs = 'http://davinci-alpha.lilithgames.com/activity/' + id
    else if (SERVER === 'beta' || SERVER === 'oversea-beta')
      descriptionURLs = 'https://beta.projectdavinci.com/activity/' + id
    else descriptionURLs = 'https://www.projectdavinci.com/activity/' + id
    // console.log(descriptionURLs);
    if (window.qtJSON) {
      let json = {
        type: 'emit',
        name: 'jumpToBrowser',
        cb: function () {
          return descriptionURLs
        }
      }
      window.qtJSON(json);
    }
  }

  render () {
    const { showIndex, loadPage } = this.state
    return (
      <div className="game_bannerurl" >
        {
          loadPage ? (
            <Query query={OPENINGDEV_ACTIVTYLIST} fetchPolicy={'network-only'}>
              {
                ({ loading, error, data, client }) => {
                  if (loading) {
                    return (<div>Loading...</div>)
                  }
                  if (error) {
                    console.log(error);
                    return (<div>Error!</div>)
                  }
                  console.log(data.openingDevActivtyList);
                  let ActivtyList=[];
                  if (data) {                    
                    let imgCount = 0;
                    if(data.openingDevActivtyList && data.openingDevActivtyList.totalCount > 0 && data.openingDevActivtyList.list) {
                      for(let i of data.openingDevActivtyList.list) {
                        if(i.bannerURLs) {
                          ActivtyList.push(i)
                        }
                      }
                    }
                    imgLength = ActivtyList.length
                    return (
                      ActivtyList.length > 0 ?
                        (
                          <div className="contain"
                            onMouseEnter={this.bannerStop}
                            onMouseLeave={this.bannerStart} >
                            <ul className="ul">
                              {
                                ActivtyList.map((item, index) => {
                                  return item.bannerURLs? (
                                    <li className={index === showIndex ? 'show' : ''} key={item.summary.id} >
                                      <img src={item.bannerURLs} alt="轮播图"
                                        onClick={() => this.gameDescription(item.summary.id)} />
                                    </li>
                                  ): null;
                                })
                              }
                            </ul>
                            {
                              ActivtyList.length > 1 ? (
                                <ul className="dots">
                                  {
                                    ActivtyList.map((item, index) => {
                                      return item.bannerURLs? (
                                        <li key={index}
                                          className={index === showIndex ? 'active' : ''}
                                          onClick={() => { this.bannerChange(index) }}>
                                        </li>
                                      ): null;
                                    })
                                  }
                                </ul>
                              ) : null
                            }
                          </div>
                        )
                        :
                        (
                          <div>
                            no data...
                          </div>
                        )
                    )
                  } else {
                    return (
                      <div>
                        no games....
                      </div>
                    )
                  }
                }
              }
            </Query>
          ) : (
              <>
                Loading page...
              </>
            )
        }

      </div>
    );
  }
}

export default GameBanner;
















