import React from 'react'
import {Transition, animated} from 'react-spring/renderprops'

import {MartConsumer} from "states/context/MartContext";

import MartP1 from "./MartP1";
import MartP2 from "./MartP2";

const pages = [
  style => (
    <animated.div className={'swipe-animate'} style={{...style}}>
      <MartP1/>
    </animated.div>
  ),
  style => (
    <animated.div className={'swipe-animate'} style={{...style}}>
      <MartP2/>
    </animated.div>
  )
]

class Swiper extends React.Component {

  constructor(props) {
    super(props)
  }

  componentDidMount() {
  }

  render() {
    return (
      <MartConsumer>
        {
          ({swipeIndex, _toggleSwipe, isAnimatedFn}) => {
            if (swipeIndex || swipeIndex === 0) {
              return (
                <div className="swipe-main">
                  <Transition
                    native
                    reset
                    unique
                    items={swipeIndex}
                    onDestroyed={() => {
                      isAnimatedFn(true)
                      // console.log('isAnimated', isAnimated)
                    }}
                    from={{opacity: 0, transform: 'translate3d(100%,0,0)'}}
                    enter={{opacity: 1, transform: 'translate3d(0%,0,0)'}}
                    leave={{opacity: 0, transform: 'translate3d(-50%,0,0)'}}>
                    {index => pages[index]}
                  </Transition>
                </div>
              )
            } else {
              return (
                <div>
                  swiping...
                </div>
              )
            }
          }
        }
      </MartConsumer>
    )
  }
}

export default Swiper
