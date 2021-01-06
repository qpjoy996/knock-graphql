import React from 'react'
import { importAll } from 'utils'

const iconMap = {
  info: 'Icon_Info.png',
  warning: 'Icon_Warning.png',
  error: 'Icon_Error.png',
  success: 'Icon_Success.png',
}

class GlobalMessage extends React.Component {
  closeMsg = (e) => {
    e.stopPropagation()
    const { onClose } = this.props
    onClose && onClose()
  }

  render() {
    const webpackContext = require.context(
      'assets/img/basic',
      false,
      /\.(png|jpe?g|svg)$/
    )
    const images = importAll(webpackContext)
    const { avatar, type, title, description, onOpen, onClose } = this.props

    let iconURL = iconMap[type] || 'Icon_Info.png'

    return (
      <div className="msg-container" onClick={() => onOpen && onOpen()}>
        <div className={`msg-avatar ${avatar ? 'avatar-img' : ''}`}>
          <img src={avatar || images[iconURL]} alt="icon"></img>
        </div>
        <div className="msg-content">
          <div>{title}</div>
          <div>{description}</div>
        </div>
        {onClose && (
          <img
            className="msg-close"
            onClick={(e) => this.closeMsg(e)}
            src={images['close.png']}
            alt="close"
          />
        )}
      </div>
    )
  }
}

export default GlobalMessage
