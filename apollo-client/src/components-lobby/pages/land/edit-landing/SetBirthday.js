import React, {Component} from 'react';
import {withApollo} from 'react-apollo';
import {withRouter} from 'react-router-guard';

import AntMessage from 'components-lobby/partial/message/AntMessage';

import {_historyHandler, errorHandler} from "utils";
import {SET_BIRTHDAY_MUTATION} from '@gql'
import {PlatformContext} from "states/context/PlatformContext";

class SetBirthday extends Component {

  static contextType = PlatformContext;

  constructor(props) {
    super(props);
    this.state = {
      birthday: 2000
    }
  }

  async componentDidMount() {
    const birthday = localStorage.getItem('BIRTHDAY');
    console.log(Number(birthday))
    this.setState({
      birthday: Number(birthday) || 2000
    });
  }

  setBirthdayNext = (e) => {
    const {
      birthday
    } = this.state;
    const {
      history
    } = this.props;

    this.props.client.mutate({
      mutation: SET_BIRTHDAY_MUTATION,
      variables: {
        birthday: birthday + ''
      }
    }).then(dt => {
      // console.log(dt);
      if (dt.data && dt.data.setUserBirthday) {
        if (dt.data.setUserBirthday.code === 0) {
          localStorage.setItem('BIRTHDAY', birthday);
          _historyHandler({jump: '/landing/set-gender', history});
          AntMessage.success('设置生日成功！');
        }
      } else {
        AntMessage.error('设置生日失败，请联系管理员！');
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
    const {
      birthday
    } = this.state;

    return (
      <div className="log">
        <div className="log-header"></div>

        <div className="log-body set-birthday">
          <div className="log-body_container">
            <div className="log-body_container--logo">
              <div className="tip-text">请问你的出生日期是？</div>
            </div>

            <div className="log-body_container--form">
              <div className="form_group">
                <input className="form-input--number" type="number" value={birthday}
                       placeholder="请输入Number"
                       onChange={(e) => this.setState({
                         birthday: e.target.value || ''
                       })}
                />
                <div className="number--up_down">
                  <div className="number--up a-btn" onClick={(e) => {
                    this.setState((preState) => {
                      const birthday = preState.birthday + 1;
                      return {
                        birthday
                      }
                    })
                  }}>
                    +
                  </div>

                  <div className="number--down a-btn" onClick={(e) => this.setState((preState) => {
                    const birthday = preState.birthday - 1;
                    return {
                      birthday
                    }
                  })}>
                    -
                  </div>
                </div>
              </div>
            </div>
            <div className="log-body_container--footer">
              <div className="footer--last_next">
                <div className="footer--next a-btn"
                     onClick={(e) => this.setBirthdayNext(e)}>
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

const SetBirthdayRouter = withRouter(withApollo(SetBirthday));
delete SetBirthdayRouter.contextType;
export default SetBirthdayRouter;
