import React from 'react';
import { Alert, List, Avatar } from 'antd';
import { importAll } from "utils";

class AlertModal extends React.Component {

  state = {
    timer: null
  }

  constructor(props) {
    super(props);
    this.alertRef = React.createRef();
  }

  componentDidMount () {
    const {
      options
    } = this.props;

    let timer;

    if (options && options.timeout !== 0) {
      timer = setTimeout(() => {
        this.cancelAlert();
      }, options.timeout || 3000);

      this.setState({
        timer
      })
    }
  }

  UNSAFE_componentWillUnmount () {
    const {
      timer
    } = this.state;
    if (timer) clearTimeout(timer)
  }

  cancelAlert = () => {
    if (this.alertRef.current) {
      this.alertRef.current.click();
    }
  }


  render () {
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const {
      options
    } = this.props;

    let type = options.type || 'info';
    let avatar = options.avatar || null;
    let description = options.description || '';
    // images['Icon_game01.png']
    return (
      <div className="alert-modal">
        {
          options ? (
            <Alert
              description={<List.Item onClick={() => {
                options._alerGo && options._alerGo()
              }}>
                <List.Item.Meta
                  avatar={
                    avatar ? <Avatar src={images[avatar]} /> : null
                  }
                  title={
                    options.title
                  }
                  description={description}
                />
              </List.Item>}
              closeText={<img src={images['Pic_ch.svg']} ref={this.alertRef} />}
              type={type}
              // 四种icon警告通知显示时，统一添加.info-alert样式,
              className={`${description == '' ? "info-alert" : ""}`}
            />
          ) : null
        }
      </div>
    )
  }

  // AlertModal显示时触发,5s后自动消失

  // setTimeAlert = () => {
  //   setTimeout(function () {
  //     this.props.cancelAlert(false);
  //     // 收缩样式
  //   }, 5000)
  // }
}

export default AlertModal;
