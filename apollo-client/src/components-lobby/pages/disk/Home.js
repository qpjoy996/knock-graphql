import React from 'react';

import { DiskProvider } from 'states/context/DiskContext'

import Disk from './Disk';

class DiskHome extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <DiskProvider>
                <Disk />
            </DiskProvider>
        )
    }
}

export default DiskHome