import React from 'react';
import { withRouter } from 'react-router-guard';
import { withApollo } from 'react-apollo';

import { PlatformContext } from "states/context/PlatformContext";


let _startPosition = 0;
let maxAmplitude = 150;
class ListInfinite extends React.Component {

  static contextType = PlatformContext;

  constructor(props) {
    super(props);

    this.state = {
      hasMore: null,
      _transitionHeight: 0,
      isrefresh: false,
      isLoading: false
    }
  }

  componentDidMount () {
    console.log('games infinite...');
  }

  startDrag = (e) => {
    console.log(e, 'touch event', e.type);
    if (e.type === 'touchstart') {
      _startPosition = e.touches[0].pageY;
    }

  }

  getClick = (e) => {
    var event = e || window.event;
    event.stopPropagation();
    console.log('click...');
  }

  duringDrag = (e) => {
    console.log(e.type, ' - - - startMove');
    if (e.type === 'touchmove') {
      // let _transitionHeight = e.touches[0].pageY - _startPosition;
      // if (_transitionHeight > 100) {
      //   _transitionHeight = 100;
      // }
      // this.setState({
      //   _transitionHeight
      // })
      let top = -this.ListInfiniteRef.scrollTop;
      if (top === 0 && this.state._transitionHeight === 0) {
        this.ListInfiniteRef.style.webkitTransform = `translate3d(0, ${maxAmplitude}px, 0)`;
        this.ListInfiniteRef.style.transform = `translate3d(0, ${maxAmplitude}px, 0)`;
      }
      this.setState({
        _transitionHeight: top
      })
    }
  }

  endDrag = (e) => {
    const {
      _transitionHeight
    } = this.state;
    if (_transitionHeight <= 0) {
      this.ListInfiniteRef.style.webkitTransform = `translate3d(0, ${0}px, 0)`;
      this.ListInfiniteRef.style.transform = `translate3d(0, ${0}px, 0)`;
    }
    this.setState({
      _transitionHeight: maxAmplitude
    })
    // console.log(e.type, ' - - - end drag...');
    // e.preventDefault();
    // if (e.type === 'touchend') {
    //   if (_transitionHeight > 0) {
    //     var event = e || window.event;
    //     event.stopPropagation();
    // this.setState({
    //   _transitionHeight: 0,
    //   isrefresh: true,
    // })
    // } else {
    //   this.setState({
    //     _transitionHeight: 0,
    //     isrefresh: false
    //   })
    // }
    // }
    // 刷新加载时长3s
    // setTimeout(() => {
    //   this.setState({ isrefresh: false })
    // }, 3000)
  }

  handleScroll = ({ currentTarget }, onLoadMore) => {
    if (currentTarget.scrollTop + currentTarget.clientHeight + 1 >= currentTarget.scrollHeight) {
      this.setState({
        isLoading: true
      })
      onLoadMore();
    } else {
      this.setState({
        isLoading: false
      })
    }
  }

  render () {

    const { _transitionHeight, isrefresh, isLoading } = this.state;
    const { onLoadMore, hasMore, loading, children, className, refresh, loadMore } = this.props;
    // const loader = <div className="loader" key={Math.random()}>Loading ...</div>

    return (
      <>
        <div
          className={className}
          onScroll={e => this.handleScroll(e, onLoadMore)}
          // pageStart={0}
          // loadMore={this.loadMoreGames.bind(this)}
          // hasMore={hasMore}
          // loader={loader}              
          onMouseDown={e => this.startDrag(e)}
          onTouchStart={e => this.startDrag(e)}
          onMouseMove={e => this.duringDrag(e)}
          onTouchMove={e => this.duringDrag(e)}
          onMouseUp={e => this.endDrag(e)}
          onTouchEndCapture={e => this.endDrag(e)}
          onClick={e => this.getClick(e)}
          ref={el => this.ListInfiniteRef = el}
          style={{
            transition: `transform 0.5s linear`
          }}
        >
          {
            refresh ? (
              <div className="data-refresh">
                {/* 需要请求一次接口 */}
                {_transitionHeight === 0 && isrefresh && (<div className="loading"></div>)}
                {_transitionHeight > 1 && (<span>下拉刷新</span>)}
              </div>
            ) : null
          }
          <div>
            {children}
          </div>
          {
            loadMore && hasMore ? (
              <div className="more-data-loading">
                {isLoading && (<div className="loading"></div>)}
                {!isLoading && (<span>上拉加载更多...</span>)}
              </div>
            ) : null
          }
        </div>
      </>
    )
  }
}

const GamesWithRouter = withRouter(withApollo(ListInfinite));
delete GamesWithRouter.contextType;
export default GamesWithRouter;
