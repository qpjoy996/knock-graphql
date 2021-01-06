import React from 'react';
import { withRouter } from 'react-router-guard';
import { withApollo } from 'react-apollo';
import MeScroll from 'mescroll.js';
import 'mescroll.js/mescroll.min.css';
import { unityJSON } from "utils/lib/unity";

import { injectIntl, FormattedMessage } from "react-intl";

let mescroll = [];
let tabKey = 0;
let timeOut = null;
let totalSize = null;
let curPageSize = null;
let loading = null;

class MescrollList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentDidMount () {
    console.log('games infinite...');
    mescroll = this.initMescroll('mescroll', this.props);
    totalSize = this.props.totalSize
    curPageSize = this.props.curPageSize
    loading = this.props.loading
  }

  componentWillUpdate (nextProps, nextState) {
    // 同步总数据
    if (nextProps.curPageSize != curPageSize) {
      curPageSize = nextProps.curPageSize
    }
    if (nextProps.totalSize != totalSize) {
      totalSize = nextProps.totalSize;
    }
    // 不同对象共用一个mescroll的情况,key不同时重置刷新
    if (nextProps.listTabKey != tabKey) {
      tabKey = nextProps.listTabKey
      clearTimeout(timeOut);
      loading = false
      mescroll.resetUpScroll();
    }
  }

  componentWillUnmount () {
    clearTimeout(timeOut);
    tabKey = 0;
  }

  /*创建MeScroll对象*/
  initMescroll = (mescrollId, props) => {
    const { intl } = this.props;

    // const webpackContext = require.context('assets/img/home', false, /\.(png|jpe?g|svg)$/);
    // const images = importAll(webpackContext);
    let mescroll = new MeScroll(mescrollId, {
      // 下拉刷新
      down: {
        callback: this.downCallback,
        use: props.isrefresh,
        textInOffset: '下拉刷新',
        textOutOffset: '释放更新',
        textLoading: 'Loading...',
        auto: false,
        afterLoading: function () {
          //跳转换装
          console.log("跳转换装");
          unityJSON("openAvatar");
        }
      },
      //上拉加载的配置项
      up: {
        callback: this.getListData,
        isBounce: false,
        noMoreSize: 1,  //默认值是5
        htmlNodata: '<p class="upwarp-nodata">' + props.noMoreData + '</p>',
        // empty: {
        //   warpId: 'dataList',
        //   icon: images['Pic_nothing_suit.png'], //图标
        //   tip: "No Game Here" //提示
        // },
        // toTop: {
        //   src: "http://www.mescroll.com/demo/res/img/mescroll-totop.png",
        //   offset: 800
        // },
        warpId: "upscrollWarp",
        htmlLoading: `<p class="upwarp-progress mescroll-rotate"></p><p class="upwarp-tip">${intl.messages['game.loading']}</p>`,
        onScroll: function (mescroll, y, isUp) {
          //tab置顶显示
          // let homeAll = mescroll.scrollDom.children[1].children[0];
          // let navWarp = mescroll.scrollDom.children[1].children[0].children[1];
          // let navContent = navWarp.children[0];
          // navWarp.style.height = navWarp.offsetHeight + "px";//固定高度占位,避免悬浮时列表抖动
          // console.log("up --> onScroll 列表当前滚动的距离 y = " + y, navWarp.offsetTop, homeAll.offsetTop + ", 是否向上滑动 isUp = " + isUp);
          // if (y >= (navWarp.offsetTop + homeAll.offsetTop)) {
          //   navContent.classList.add("nav-fixed");
          // } else {
          //   navContent.classList.remove("nav-fixed");
          // }

          //isUp=true向上滑,isUp=false向下滑
          let upwarpNodata = mescroll.scrollDom.children[2];
          mescroll.scrollDom.addEventListener("touchstart", function () {
            // #mescroll增加内边距
            // mescroll.scrollDom.style.paddingBottom = '10px';
          })
          mescroll.scrollDom.addEventListener("touchmove", function () {
            //.upwarpNodata 根据上拉距离显示动画
            // upwarpNodata.style.marginBottom = mescroll.startPoint.y - mescroll.lastPoint.y + 'px';//拉的高度
            // upwarpNodata.style.transition = 'marginBottom 300ms';
          })
          mescroll.scrollDom.addEventListener("touchend", function () {
            //停止上拉，还原
            // upwarpNodata.style.marginBottom = '0';
            // mescroll.scrollDom.style.paddingBottom = '0';
          })
        },
        lazyLoad: {
          use: true,
          attr: 'imgurl',
          showClass: 'mescroll-lazy-in',
          delay: 100,
          offset: 500
        },
      }
    });
    return mescroll;
  }


  // 下拉加载目前屏蔽
  downCallback = () => {
    // let { curPageSize, loading, onLoadMore, limitLen } = this.props;
    // if (!loading) {
    mescroll.endSuccess();
    // 更新列表数据
    // onLoadMore(curPageSize / limitLen);
    // } else {
    //   mescroll.endErr();
    // }
  }

  getListData = (page) => {
    // 默认page={num: 1, size: 10} 
    const { onLoadMore, limitLen, listTabKey } = this.props;
    // let pageSize = page.size; page.size = limitLen;
    // let pageNum = page.num; 
    //请求成功
    if (!loading) {
      if (listTabKey != tabKey || curPageSize === undefined) {
        page.num = 1
      } else { page.num = Math.ceil(curPageSize / limitLen); }
      page.size = limitLen;
      //必传参数(当前页的数据个数, 总数据量)
      timeOut = setTimeout(function () {
        if (listTabKey != tabKey || curPageSize === undefined) {
          page.num = 1;
        } else { page.num = Math.ceil(curPageSize / limitLen); }
        console.log("====", tabKey, totalSize, Math.floor(totalSize / limitLen), curPageSize, page.num);
        mescroll.endByPage(curPageSize, Math.floor(totalSize / limitLen));
        //更新列表数据
        if (totalSize > limitLen) onLoadMore(page.num, tabKey);
      }, 800)
    } else {
      mescroll.endErr();
    }
  }

  // 到达底部
  getToBottom = () => {
    mescroll.scrollTo(999999999, 300);
  }

  render () {
    const { children, className, title, mescrollRef } = this.props;
    return (
      <>
        {/* <div onClick={this.getToBottom} style={{ fontSize: '30px', position: 'fixed', zIndex: '999' }}>Bottom</div> */}
        <div className={className} >
          <div id="mescroll" className="mescroll" ref={mescrollRef}>
            <div>
              {title}
              {children}
            </div>
          </div>
        </div>
      </>
    )
  }
}

const GamesWithRouter = withRouter(withApollo(MescrollList));
delete GamesWithRouter.contextType;
export default injectIntl(GamesWithRouter);
