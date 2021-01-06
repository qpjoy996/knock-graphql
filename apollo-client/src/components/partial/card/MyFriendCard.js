import React from 'react';
import { Drawer } from 'antd';
import { importAll } from "utils";
import ListCard from 'components/partial/card/ListCard'
import { PlatformContext } from "states/context/PlatformContext";
import FriendCardContext from '@/states/context/FriendCardContext'

class MyFriendCard extends React.Component {
  static contextType = PlatformContext;

  state = {
    refetchFriends: null,
  }

  _setState(state) {
    this.setState(state)
  }

  UNSAFE_componentWillReceiveProps(props) {
    const { refetchFriends } = this.state
    const { visible } = props
    if (visible) {
      refetchFriends && refetchFriends()
    }
  }

  render() {
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);

    const { visible, onClose } = this.props;
    return (
      <FriendCardContext.Provider value={{ ...this.state, _setState: state => this._setState(state) }}>
        <div className="card-container">
          <Drawer
            // title="My Friend"
            placement="right"
            closable={false}
            onClose={onClose}
            visible={visible}
            className={"myfriend-card-drawer"}
          >
            <div className="card-title">
              <span style={{ backgroundImage: `url(${images['Icon_circle.svg']})` }} className="span-img"></span>
              {/* <img src={images['Icon_circle.svg']} /> */}
              <span>My Friends</span>
            </div>
            <div className="card-drawer-content">
              <ListCard onRef={ref => this.listcard = ref} typ={'FRIEND'} invited={true} />
            </div>
          </Drawer>
        </div>
      </ FriendCardContext.Provider>
    )
  }


}

export default MyFriendCard;
