import React from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';

class DiskIndex extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { children } = this.props;

        return (
            <DndProvider backend={Backend}>
                <div className="disk-container">
                    {children}
                </div>
            </DndProvider>
        )
    }
}

export default DiskIndex;
