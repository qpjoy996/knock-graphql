import React from 'react';
import { importAll } from "utils";
// import { Drawer } from "antd";
import BtnEdit from 'components/partial/button/BtnEdit'
// import BasicModal from 'components/partial/modal/BasicModal'
// import AlertModal from 'components/partial/modal/AlertModal'

const cardList = [
  { title: 'Snow Ball', count: '2-4', bgColor: '#6ea0ff', key: '1', image: 'Pic_game04.png' },
  { title: 'Mining Simulator 2020 ', count: '1-24', bgColor: '#ffa450', key: '2', image: 'Pic_game02.png' },
  { title: 'Mining Simulator 2020 ', count: '1-24', bgColor: '#ff6363', key: '3', image: 'Pic_game03.png' }
]
let shifoutuisong = true;

class Game extends React.Component {
  state = {
    showPlay: false,
    visibleModal: true,
    visibleAlert: shifoutuisong,
    IsDrawerBottom: true
  }

  onClose = () => {
    this.setState({
      IsDrawerBottom: false
    })
  }

  render () {
    const webpackContext = require.context('assets/img/home', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    return (
      <div>
        <BtnEdit type="['friend','rehandling']" />
        <div className="overlay" ref="overlay" onClick={this.getOverlay}></div>

        <div className="home-play" ref="animatePlay">
          <p onClick={this.anmaitePlay} style={{ backgroundImage: `url(${images['Icon_arrow.svg']})` }}>Lets Play !</p>
          <div className="home-play-card" ref="playCard">
            {
              cardList.map((item) => {
                return (
                  <div className="home-play-card-item" style={{ backgroundColor: item.bgColor }} key={item.key} onClick={this.getGameDetail}>
                    <div className={`card-img ${!item.image ? 'imgError' : ''}`}
                      style={{ backgroundImage: `url(${images[item.image]}` }}></div>
                    <div className="card-text">
                      <span>{item.title}</span>
                      <div className="card-text-count">
                        <img className="text-img" src={images['Icon_friends.svg']} alt='' />
                        <span className="text-span">{item.count}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            }
            <div className="home-play-card-bottom-text">
              <span>More Coming Soon...</span>
            </div>
          </div>
        </div>
        {/* <AlertModal options={{ type: '', title: 'No account provide', description: '', avatar: "Icon_Warning.png" }} /> */}
        {/* <AlertModal options={{ type: 'info', title: 'No account provide', description: '', avatar: "images['Icon_Info.png']" }} />*/}
        {/*错误警告 type="Warning" */}
        {/* <BasicModal visible={this.state.visibleModal} hideModal={this.hideModal} okText="Reconnect" cancelText="Ok"
          title="" description="Connection Lost!" icon="Icon_Disconnect.png" type="Warning" doLoading={true} /> */}
      </div>
    )
  }

  getOverlay = () => {
    this.anmaitePlay();
  }

  anmaitePlay = () => {
    const { showPlay } = this.state
    this.setState({ showPlay: !showPlay });
    const overlay = this.refs.overlay;
    const animatePlay = this.refs.animatePlay;
    const playCard = this.refs.playCard;
    if (showPlay) {
      animatePlay.style.animation = 'bounceInTop 0.25s';
      animatePlay.style.height = '7vh';
      overlay.style.display = 'none';
      setTimeout(function () {
        playCard.style.display = 'none';
      }, 500);
    } else {
      animatePlay.style.animation = 'bounceInBottom 0.25s';
      animatePlay.style.height = '68vh';
      playCard.style.display = 'block';
      overlay.style.display = 'block';
    }
  }


  showModal = (value) => {
    this.setState({
      visibleAlert: !value,
      visibleModal: value
    })
  }
  hideAlert = (value) => {
    this.setState({
      visibleAlert: value
    })
  }

  hideModal = () => {
    this.setState({
      visibleModal: false
    });
  };

  getGameDetail = () => {
    this.props.history.push("/home/gameDetail");
  }
}

export default Game;
