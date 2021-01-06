import React from 'react';

class Mart extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    // 给body上添加一个class 方便控制滚动条样式
    let bodyClass = document.querySelector("body").className
    if (bodyClass.indexOf('mart-body') === -1) {
      document.querySelector("body").className = "mart-body"
    }
    console.log('bodyClass', bodyClass)
  }

  componentWillUnmount(){
    // 移除body一个class 方便控制滚动条样式
    let bodyClass = document.querySelector("body").className
    if (bodyClass.indexOf('mart-body') > -1) {
      bodyClass = bodyClass.replace('mart-body', '')
      document.querySelector("body").className = bodyClass
    }
  }

  render() {
    const {children} = this.props;

    return (
      <div className="mart">
        {children}
      </div>
    )
  }
}

export default Mart;
