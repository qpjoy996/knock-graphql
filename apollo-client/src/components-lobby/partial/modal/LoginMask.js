import React from "react";
import PropTypes from "prop-types";
import { Modal } from "antd";
import { isEqual } from "lodash";
import { injectIntl, FormattedMessage } from "react-intl";
import Spinner from "../spinner/Spinner";
import { PlatformContext } from "states/context/PlatformContext";

class LoginMask extends React.Component {

  static contextType = PlatformContext;

  static propTypes = {
    closable: PropTypes.bool, //是否显示右上角关闭按钮：默认显示
  };

  static defaultProps = {
    closable: true,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnObj = {};
    if (isEqual(prevState.mask, nextProps.mask)) {
      // console.log('editing same');
    } else {
      let mask = nextProps.mask;
      Object.assign(returnObj, { mask });
    }

    if (isEqual(prevState.from, nextProps.from)) {
      // console.log('moving same');
    } else {
      let from = nextProps.from;
      if(['set-nickname'].indexOf(from) >= 0) {
        let mask = false;
        Object.assign(returnObj, mask);
      }
      Object.assign(returnObj, { from });
    }

    if (JSON.stringify(returnObj) === "{}") {
      return null;
    } else {
      return returnObj;
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      from: '',
      mask: true
    }
  }

  // componentDidMount() {
  //   const { mask } = this.props;
  //   this.setState({
  //     mask,
  //   });
  // }

  render() {
    const { handelMaskCancel, closable } = this.props;
    const {mask,from} = this.state;

    return (
      <div>
        <Modal
          className="login-mask"
          title={<FormattedMessage id="landing.tips" />}
          visible={mask}
          keyboard={false}
          // onOk={handelMaskCancel}
          onCancel={handelMaskCancel}
          // okButtonProps={{ disabled: true }}
          maskClosable={false}
          cancelButtonProps={{ disabled: true }}
          destroyOnClose={true}
          closable={closable}
        >
          <Spinner />
          <FormattedMessage id="landing.login.waiting" />
          {/* 登录中... 请稍后！ */}
        </Modal>
      </div>
    );
  }
}

export default LoginMask;
