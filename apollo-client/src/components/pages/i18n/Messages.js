import React from 'react';
import {
  FormattedMessage,
  FormattedDate,
  FormattedTime,
  FormattedDateParts,
} from "react-intl";

class HomeIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'Eric',
      unreadCount: 1000,
      currentTime: new Date()
    }
  }

  render() {
    const {name, unreadCount} = this.state;

    const {
      children
    } = this.props;

    const {
      currentTime
    } = this.state;
    return (
      <>
        <p>
          <FormattedMessage id="1035"/>
          <br/>
          {/*<FormattedMessage id="placeholder" values={{name: 'John'}}/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage id="date" values={{ts: Date.now()}}/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage id="time" values={{ts: Date.now()}}/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage id="number" values={{num: Math.random() * 1000}}/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage id="plural" values={{num: 1}}/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage id="plural" values={{num: 99}}/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage id="select" values={{gender: 'male'}}/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage id="select" values={{gender: 'female'}}/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage id="selectordinal" values={{order: 1}}/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage id="selectordinal" values={{order: 2}}/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage id="selectordinal" values={{order: 3}}/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage id="selectordinal" values={{order: 4}}/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage*/}
          {/*    id="richtext"*/}
          {/*    values={{num: 99, bold: (...chunks) => <strong>{chunks}</strong>}}*/}
          {/*/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage*/}
          {/*    id="richertext"*/}
          {/*    values={{num: 99, bold: (...chunks) => <strong>{chunks}</strong>}}*/}
          {/*/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage*/}
          {/*    id="random"*/}
          {/*    defaultMessage="I have < &nbsp; <bold>{num, plural, one {# dog} other {# & dogs}}</bold>"*/}
          {/*    values={{num: 99, bold: (...chunks) => <strong>{chunks}</strong>}}*/}
          {/*/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage id="unicode" values={{placeholder: 'world'}}/>*/}
          {/*<br/>*/}
          {/*<FormattedMessage*/}
          {/*    id="whatever"*/}
          {/*    defaultMessage="Hello\u0020{placeholder}"*/}
          {/*    values={{placeholder: 'world'}}*/}
          {/*/>*/}
        </p>
      </>
    )
  }
}

export default HomeIndex;
