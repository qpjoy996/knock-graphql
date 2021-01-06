import React from 'react';
import {Modal, Button} from 'antd';
import Spinner from "components/partial/spinner/Spinner";

class LoginModal extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const {
            mask,
            handelMaskCancel
        } = this.props;

        return (
            <Modal
                className="login-mask"
                title="Tips:"
                visible={mask}
                // onOk={handelMaskCancel}
                onCancel={handelMaskCancel}
                // okButtonProps={{ disabled: true }}
                maskClosable={false}
                cancelButtonProps={{disabled: true}}
                destroyOnClose={true}
            >
                <Spinner/>登录中... 请稍后！
            </Modal>
        );
    }
}

export default LoginModal;
