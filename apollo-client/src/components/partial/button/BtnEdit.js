import React from 'react';
import { importAll } from "utils";
import { Drawer } from 'antd';
import SearchCard from 'components/partial/card/SearchCard';
import { unityJSON } from "utils/lib/unity";

class BtnEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    }
  }

  showDrawerFriend = () => {
    unityJSON('showFriends');
    this.setState({
      visible: false,
    });
  };
  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  render () {
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const { type } = this.props;
    return (
      <div>
        <div className="right-edit-btn">
          {
            type.indexOf('friend') > -1 ? (
              <div className="right-edit-btn-img" onClick={this.showDrawerFriend}>
                <img src={images['Icon_friends.svg']} alt="好友" />
              </div>
            ) : null
          }
          {
            type.indexOf('rehandling') > -1 ? (
              <div className="right-edit-btn-img">
                <img src={images['Icon_suit.svg']} alt="换装" />
              </div>
            ) : null
          }
          {
            type.indexOf('save') > -1 ? (
              <div className="right-edit-btn-img">
                <img src={images['save.png']} alt="编辑保存" />
              </div>
            ) : null
          }
        </div>
        {this.state.visible && <div className="card-container">
          <Drawer
            // title="My Friend"
            placement="right"
            closable={false}
            onClose={this.onClose}
            visible={this.state.visible}
            // mask={false}
            className="search-card-drawer device"
          >
            <SearchCard />
          </Drawer>
        </div>}
      </div >
    )
  }


}

export default BtnEdit;
