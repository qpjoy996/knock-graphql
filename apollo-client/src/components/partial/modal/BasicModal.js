import React from 'react';
import { Modal, List, Avatar } from 'antd';
import { importAll } from "utils";
import BtnBasic from 'components/partial/button/BtnBasic'
import { PlatformContext } from "states/context/PlatformContext";

class BasicModal extends React.Component {
  static contextType = PlatformContext;
  constructor(props) {
    super(props)
    this.state = {
      currentVisible: !!props.visible,
      currentLoading: false
    }
  }

  componentDidMount() {
    const { visible } = this.props
    this.setState({
      currentVisible: visible
    })
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      currentVisible: nextProps.visible
    })
  }

  handleConfirm = async () => {
    const { onConfirm, asyncConfirm } = this.props
    if (asyncConfirm) {
      this.setState({ currentLoading: true })
      asyncConfirm()
        .then(() => {
          this.setState({ currentLoading: false })
        })
        .catch(() => {
          this.setState({ currentLoading: false })
        })
      return
    }

    if (onConfirm) {
      onConfirm();
    }
    this.hideModal()
  }

  hideModal = () => {
    const {_updateState} = this.context
    this.setState({
      currentVisible: false
    })
    _updateState({
      basicModalOptions:null
    })
  }

  render() {
    const { i18nMsg } = this.context;
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    let { visible, onClose, type, topTitle, title, description, icon, okText, cancelText, options, avatar, loading, ...restProps } = this.props;
    const { currentVisible, currentLoading } = this.state

    title = (options && options.title) || title;
    description = (options && options.description) || description;
    okText = okText || '';

    return (
      <div>
        <Modal
          title={topTitle || (type === 'Warning' ? i18nMsg['message.warning'] : i18nMsg['message.info'])}
          visible={currentVisible && visible}
          closable={false}
          footer={null}
          ref={el => this.modal = el}
          {...restProps}
        >
          <div className="basic-modal">
            <List.Item>
              <List.Item.Meta
                avatar={(avatar || images[icon]) && <Avatar src={avatar || images[icon]} />}
                title={title}
                description={description}
              />
            </List.Item>
            <div className="modal-btn">
              <BtnBasic type="modal" okText={(currentLoading || loading) ? '' : okText || i18nMsg['message.confirm']} loading={currentLoading || loading} onClick={() => this.handleConfirm()} className="btn-join" />
              <BtnBasic type="modal" okText={cancelText || i18nMsg['message.cancel']} onClick={onClose || this.hideModal} className="btn-nope" />
            </div>
          </div>

        </Modal>
      </div >
    )
  }

  // showConfirm = () => {
  //   confirm({
  //     title: 'Do you want to delete these items?',
  //     content: 'When clicked the OK button, this dialog will be closed after 1 second',
  //     okText: 'Join',
  //     cancelText: 'Nope',
  //     onOk () {
  //       return new Promise((resolve, reject) => {
  //         setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
  //       }).catch(() => console.log('Oops errors!'));
  //     },
  //     onCancel () { },
  //   });
  // }

}

export default BasicModal;
