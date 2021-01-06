import React, { Component, Fragment } from 'react';
import { importAll } from "utils";
import { unityJSON, unityListen } from "utils/lib/unity";


// 屏幕的宽度
let screenWidth = document.documentElement.offsetWidth;
let timer = null;
// 初始三个固定的位置
let left = 0;
let center = 0;
let right = 1;
let startX = 0; // 手指落点
let startTime = null // 开始触摸时间

class GameListBanner extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }


  componentDidMount () {
    let carouselUl = this.carouseUlEl;
    let carouselLis = this.carouseUlEl.children;
    let points = this.pointsEl;

    // 设置 ul 的高度
    // carouselUl.style.height = carouselLis[0].offsetHeight + 'px';

    // 初始三个固定的位置
    left = carouselLis.length - 1;
    center = 0;
    right = 1;

    if (carouselLis.length === 1) {
      carouselLis[0].style.height = "4.5rem";
      carouselLis[0].style.transform = 'none';
    } else {
      // 动态生成小圆点
      for (let i = 0; i < carouselLis.length; i++) {
        let li = document.createElement('li');
        if (i == 0) {
          li.classList.add('active');
        }
        points.appendChild(li);
      }
      // 重新启动定时器
      clearInterval(timer);
      // 调用定时器
      timer = setInterval(this._showNext, 5000);
      // 归位（多次使用，封装成函数）
      this._setTransform();
      // 分别绑定touch事件
      carouselUl.addEventListener('touchstart', this._touchstartHandler); // 滑动开始绑定的函数 _touchstartHandler
      carouselUl.addEventListener('touchmove', this._touchmoveHandler); // 持续滑动绑定的函数 _touchmoveHandler
      carouselUl.addEventListener('touchend', this._touchendHandeler); // 滑动结束绑定的函数 _touchendHandeler
      // this._showPrev();
      this._setTransition()
      this._setPoint()
    }

  }

  componentWillUnmount () {
    // 清除定时器
    clearInterval(timer);
  }


  // 轮播图片切换下一张
  _showNext = () => {
    let carouselLis = this.carouseUlEl.children;
    // 轮转下标
    left = center;
    center = right;
    right++;
    //　极值判断
    if (right > carouselLis.length - 1) {
      right = 0;
    }
    //添加过渡（多次使用，封装成函数）
    this._setTransition(1, 1, 0);
    // 归位

    this._setTransform();
    // 自动设置小圆点
    this._setPoint();
  }

  // 轮播图片切换上一张
  _showPrev = () => {
    let carouselLis = this.carouseUlEl && this.carouseUlEl.children;
    // 轮转下标
    right = center;
    center = left;
    left--;
    //　极值判断
    if (left < 0) {
      left = carouselLis.length - 1;
    }
    //添加过渡
    this._setTransition(0, 1, 1);
    // 归位
    this._setTransform();
    // 自动设置小圆点
    this._setPoint();
  }

  // 滑动开始
  _touchstartHandler = (e) => {
    // 清除定时器
    clearInterval(timer);
    // 记录滑动开始的时间
    startTime = Date.now();
    // 记录手指最开始的落点
    startX = e.changedTouches[0].clientX;
  }


  // 滑动持续中
  _touchmoveHandler = (e) => {
    // 获取差值 自带正负
    let dx = e.changedTouches[0].clientX - startX;
    // 干掉过渡
    this._setTransition(0, 0, 0);
    //左负右正
    // 归位
    this._setTransform(dx);
  }


  //　滑动结束
  _touchendHandeler = (e) => {
    // 在手指松开的时候，要判断当前是否滑动成功
    let dx = e.changedTouches[0].clientX - startX;
    let carouselLis = this.carouseUlEl && this.carouseUlEl.children;
    // 获取时间差
    let dTime = Date.now() - startTime;
    // 滑动成功的依据是滑动的距离（绝对值）超过屏幕的三分之一 或者滑动的时间小于300毫秒同时滑动的距离大于30
    if (Math.abs(dx) > screenWidth / 3 || (dTime < 300 && Math.abs(dx) > 30)) {
      // 滑动成功了
      // 判断用户是往哪个方向滑
      if (dx > 0) {
        // 往右滑 看到上一张
        this._showPrev();
      } else {
        // 往左滑 看到下一张
        this._showNext();
      }
    } else {
      // 添加上过渡
      let carouselLis = this.carouseUlEl && this.carouseUlEl.children;
      if (carouselLis.length === 2) {
        this._setTransition(0, 1, 0);
      } else {
        this._setTransition(1, 1, 1);
      }

      // 滑动失败了
      this._setTransform();
    }
    // 重新启动定时器
    clearInterval(timer);
    // 调用定时器
    timer = setInterval(this._showNext, 5000);
  }

  // 设置过渡
  _setTransition = (a, b, c) => {
    let carouselLis = this.carouseUlEl && this.carouseUlEl.children;
    if (a) {
      carouselLis[left].style.transition = 'transform .5s';
    } else {
      carouselLis[left].style.transition = 'none';
    }
    if (b) {
      carouselLis[center].style.transition = 'transform .5s';
    } else {
      carouselLis[center].style.transition = 'none';
    }
    if (c) {
      carouselLis[right].style.transition = 'transform .5s';
    } else {
      carouselLis[right].style.transition = 'none';
    }
  }

  //　封装归位
  _setTransform = (dx) => {
    let carouselLis = this.carouseUlEl && this.carouseUlEl.children;
    // console.log("dx===", dx, this.carouseUlEl.offsetWidth);
    dx = dx || 0;
    carouselLis[left].style.transform = 'translateX(' + (-this.carouseUlEl.clientWidth + dx) + 'px)';
    carouselLis[center].style.transform = 'translateX(' + dx + 'px)';
    carouselLis[right].style.transform = 'translateX(' + (this.carouseUlEl.clientWidth + dx) + 'px)';
  }

  _setPoint = () => {
    let points = this.pointsEl;
    const { bannerLists } = this.props
    // 动态设置小圆点的active类
    let pointsLis = points && points.children;
    for (let i = 0; i < pointsLis.length; i++) {
      pointsLis[i].classList.remove('active');
    }
    pointsLis[center].classList.add('active');
    // 2个banner的情况
    if (bannerLists.bigBanner.length === 2 && pointsLis[2] && pointsLis[3]) {
      pointsLis[2].style.position = "absolute"
      pointsLis[3].style.position = "absolute"
      pointsLis[3].style.left = "0.66rem"
    }
  }

  render () {
    const webpackContext = require.context('assets/img/home', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const { bannerLists, getBannerClick, getQueryWard, getGameDetail } = this.props

    let bannerList = bannerLists.bigBanner.map((item, index) => {
      return (
        <Fragment key={item.id}>
          <li onClick={() => {
            getBannerClick(item);
            if (item.link.type === "BannerLinkWebsite") {
              let userID = localStorage.getItem("USER_ID")
              if (item.title === "调查问卷") unityJSON('openExternalUrl', item.link.url + "&user_id=" + userID);
              else { unityJSON('openExternalUrl', item.link.url); }
            } else getGameDetail(item.link, "banner")
            if (["调查问卷", "facebook跳转", "discord跳转"].indexOf(item.title) > -1) {
              console.log("======" + item.id, item.title + "======")
              getQueryWard(item.id);
            }
          }}
            style={{ backgroundImage: `url(${item.thumbnailURLs[0] ? item.thumbnailURLs[0] : images['header_list_game.png']})` }}
          ></li>
        </Fragment>
      )
    })

    return (
      <div className="game-carousel" ref={el => this.carouselEl = el}>
        <ul ref={el => this.carouseUlEl = el}>
          {bannerList}
          {
            bannerLists.bigBanner && bannerLists.bigBanner.length === 2 ? (<>{bannerList}</>) : null
          }
        </ul>
        <ol className={`points ${bannerLists.bigBanner.length === 2 ? 'opacity' : ''}`} ref={el => this.pointsEl = el}></ol>
      </div>
    )
  }
}

export default GameListBanner;
