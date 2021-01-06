import React from 'react';

class MartMaxIndex extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const {children} = this.props;

        return (
            <div className="mart-max">
                {children}
            </div>
        )
    }
}

export default MartMaxIndex;
