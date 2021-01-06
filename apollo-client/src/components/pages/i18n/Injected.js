import React from 'react';
import {
    IntlProvider,
    useIntl,
    injectIntl,
    IntlShape
} from 'react-intl';

const Comp = () => {
    const {formatDate} = useIntl();
    return <h1>{formatDate(Date.now())}</h1>;
}

const Comp2 = ({
                   intl: {
                       formatDate,
                       formatTime
                   }
               }) => {
    return (
        <>
            <h1>{formatDate(new Date(), {month: 'long'})}</h1>
            <h2>{formatTime(undefined)}</h2>
        </>
    )
}

const Comp2WithIntl = injectIntl(Comp2);

class Injected extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <IntlProvider locale="en" timeZone="Asia/Tokyo">
                <div>
                    <Comp/>
                    <Comp2WithIntl/>
                </div>
            </IntlProvider>
        )
    }
}

export default Injected;
