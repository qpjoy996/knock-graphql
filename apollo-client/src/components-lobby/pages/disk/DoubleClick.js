import React from 'react';

const cancelablePromise = promise => {
    let isCanceled = false;

    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(
            value => (isCanceled ? reject({ isCanceled, value }) : resolve(value)),
            error => reject({ isCanceled, error }),
        );
    });

    return {
        promise: wrappedPromise,
        cancel: () => (isCanceled = true),
    };
};

const delay = n => new Promise(resolve => setTimeout(resolve, n));


const stopTriggerClicksOnDoubleClick = WrappedComponent => {
    class ComponentWrapper extends React.Component {
        componentWillUnmount() {
            // cancel all pending promises to avoid
            // side effects when the component is unmounted
            this.clearPendingPromises();
        }

        pendingPromises = [];

        appendPendingPromise = promise =>
            (this.pendingPromises = [...this.pendingPromises, promise]);

        removePendingPromise = promise =>
            (this.pendingPromises = this.pendingPromises.filter(p => p !== promise));

        clearPendingPromises = () => this.pendingPromises.map(p => p.cancel());

        handleClick = () => {
            // create the cancelable promise and add it to
            // the pending promises queue
            const waitForClick = cancelablePromise(delay(300));
            this.appendPendingPromise(waitForClick);

            return waitForClick.promise
                .then(() => {
                    // if the promise wasn't cancelled, we execute
                    // the callback and remove it from the queue
                    this.removePendingPromise(waitForClick);
                    this.props.onClick();
                })
                .catch(errorInfo => {
                    // rethrow the error if the promise wasn't
                    // rejected because of a cancelation
                    this.removePendingPromise(waitForClick);
                    if (!errorInfo.isCanceled) {
                        throw errorInfo.error;
                    }
                });
        };

        handleDoubleClick = () => {
            // all (click) pending promises are part of a 
            // dblclick event so we cancel them
            this.clearPendingPromises();
            this.props.onDoubleClick();
        };

        render() {
            return (
                <WrappedComponent
                    {...this.props}
                    onClick={this.handleClick}
                    onDoubleClick={this.handleDoubleClick}
                />
            );
        }
    }

    ComponentWrapper.displayName = `withClickPrevention(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

    return ComponentWrapper;
};


class DoubleClick extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { onClick, onDoubleClick } = this.props;

        const EnhancedClickableBox = stopTriggerClicksOnDoubleClick(({ onClick, onDoubleClick }) => (
            <button onClick={onClick} onDoubleClick={onDoubleClick}>
                Click or double click
            </button>
        ))

        return (
            <EnhancedClickableBox
                onClick={() => console.log("on click")}
                onDoubleClick={() => console.log("on double click")}
            />
        )
    }
}

export default DoubleClick;