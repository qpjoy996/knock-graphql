import React, { useEffect } from 'react'
import ReactDOM from 'react-dom';

const root = document.getElementById('root');

const Modal = (props) => {
  const { visible, children, onClose, closable, transform, bgSrc, contentWidth } = props
  let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  const transformStyle = {
    width: height,
    height: width,
    top: '50%',
    left: '50%',
    transform: `translate3d(-50%,-50%,0) rotate(${transform}deg)`
  }

  const stopScroll = () => {
    if (visible) {
      document.body.style.position = visible ? 'fixed' : 'static'
    }
  }

  useEffect(() => {
    if (!visible) {
      document.body.style.position = 'static'
    }
  }, [visible])

  const handleClose = () => {
    document.body.style.position = 'static'
    if (closable !== undefined && !closable) {
      return
    }
    onClose && onClose();
  }
  const preventClose = (e) => {
    e.stopPropagation();
  }
  const renderModal = () => {
    return <div onTouchStart={() => stopScroll()} className="mask" style={visible ? {} : { display: 'none' }} onClick={() => handleClose()}>
      {bgSrc && <img src={bgSrc} alt="" className="mask-bg" style={transform ? transformStyle : {}} />}
      <div className={`mask-center ${transform ? "transform" : "original"}`} style={transform ? transformStyle : { width: contentWidth }} onClick={(e) => preventClose(e)}>
        {children}
      </div>
    </div>
  }
  return ReactDOM.createPortal(
    renderModal(),
    root
  )
}

export default Modal