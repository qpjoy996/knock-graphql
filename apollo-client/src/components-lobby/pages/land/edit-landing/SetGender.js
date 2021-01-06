import React, {Component} from 'react';
import {withApollo} from 'react-apollo';
import {withRouter} from 'react-router-guard';

import AntMessage from 'components-lobby/partial/message/AntMessage';

import {_historyHandler, errorHandler} from "utils";
import {SET_GENDER_MUTATION} from "@gql";
import {PlatformContext} from "states/context/PlatformContext";

class SetGender extends Component {

  static contextType = PlatformContext;

  constructor(props) {
    super(props);
    this.state = {
      gender: 1
    }
  }

  componentDidMount() {
    const gender = localStorage.getItem('GENDER');
    this.setState({
      gender: gender ? Number(gender) : 1
    })
  }

  setGenderLast = (e) => {
    const {
      gender
    } = this.state;
    const {
      history
    } = this.props;
    localStorage.setItem('GENDER', gender);
    _historyHandler({step: 'last', history});
  }

  setGenderNext = (e) => {
    const {
      gender
    } = this.state;
    const {
      history
    } = this.props;

    this.props.client.mutate({
      mutation: SET_GENDER_MUTATION,
      variables: {
        gender
      }
    }).then(dt => {
      if (dt.data && dt.data.setUserGender) {
        if (dt.data.setUserGender.code === 0) {
          localStorage.setItem('GENDER', gender);
          _historyHandler({jump: '/landing/set-nickname', history})
          AntMessage.success('设置性别成功！');
        }
      } else {
        AntMessage.error('设置昵称失败，请联系管理员！');
      }
    }).catch(error => {
      if (error.graphQLErrors) {
        AntMessage.error(errorHandler({
          error,
          mapping: this.context.i18nConfig.messages
        }));
      }
    })
  }

  render() {
    // const webpackContext = require.context('assets/img/landing', false, /\.(png|jpe?g|svg)$/);
    // const images = importAll(webpackContext);

    const {
      gender
    } = this.state;
    return (
      <div className="log">
        <div className="log-header"></div>
        <div className="log-body set-gender">
          <div className="log-body_container">
            <div className="log-body_container--logo">
              <div className="tip-text">请选择角色性别</div>
            </div>

            <div className="log-body_container--form">
              <div className="form_group">
                <div className={gender == 1 ? `a-btn gender-boy active` : `a-btn gender-boy`}
                     onClick={(e) => this.setState({
                       gender: 1
                     })}>
                  男生
                </div>
              </div>
              <div className="form_group">
                <div className={gender == 0 ? `a-btn gender-girl active` : `a-btn gender-girl`}
                     onClick={(e) => this.setState({
                       gender: 0
                     })}>
                  女生
                </div>
              </div>
            </div>
            <div className="log-body_container--footer">
              <div className="footer--last_next">
                <div className="footer--last" onClick={(e) => this.setGenderLast(e)}>
                  上一步
                </div>
                <div className="footer--next a-btn" onClick={(e) => this.setGenderNext(e)}>
                  下一步
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const SetGenderRouter = withRouter(withApollo(SetGender));
delete SetGenderRouter.contextType;
export default SetGenderRouter;
