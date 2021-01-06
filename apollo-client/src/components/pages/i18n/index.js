import React from 'react';
import {IntlProvider} from 'react-intl';
import i18n from "i18n";

class I18NIndex extends React.Component {

  state = {
    i18nConfig: {
      locale: 'en',
      messages: i18n.en
    }
  }
  
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        i18nConfig: {
          locale: 'zh',
          messages: i18n.zh
        }
      })
    }, 3000);
  }

  render() {
    const {
      children
    } = this.props;
    const {
      i18nConfig
    } = this.state;
    return (
      <IntlProvider locale={i18nConfig.locale} messages={i18nConfig.messages}>
        <div className="i18n-container">
          {
            children
          }
        </div>
      </IntlProvider>
    )
  }
}

export default I18NIndex;
