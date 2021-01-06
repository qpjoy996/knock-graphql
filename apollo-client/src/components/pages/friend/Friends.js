import React from 'react';
import SearchCard from 'components/partial/card/SearchCard';
import {unityJSON} from "utils/lib/unity";
import BtnBack from 'components/partial/button/BtnBack';

class Friends extends React.Component {

  state = {
    visible: true
  }

  constructor(props) {
    super(props);
    console.log(window.location)
  }

  onClose = () => {
    this.setState({
      visible: false
    })
    // setTimeout(() => {
    //   unityJSON('back', {from: 'friends'})
    // }, 500);
  }

  backToAvatar = () => {
    console.log('show avatar...');
    unityJSON('back', {});
  }

  render() {
    return (
      <div className="my-friend-inner">
        <BtnBack goBack={() => this.backToAvatar()}/>
        <SearchCard className={'test-search'} visible={this.state.visible} onClose={this.onClose}/>
      </div>
    )
  }
}

export default Friends;
