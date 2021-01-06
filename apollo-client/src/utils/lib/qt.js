export function getChannel() {
    if (window.qtChannel) {
        return Promise.resolve(window.qtChannel);
    } else {
        return new Promise((resolve, reject) => {
            try {
                new window.QWebChannel(window.qt.webChannelTransport, function (channel) {
                    window.core = channel.objects.core;
                    window.qtChannel = channel;
                    // window.core.refresh.connect(function () {
                    //     alert('mmmmm');
                    // });

                    // window.qtData = {};
                    // window.core.showPlayerHub.connect(function (dt) {
                    //     alert(dt);
                    //     window.qtData['showPlayerHub'] = dt;
                    // });
                    resolve(channel);

                    // for(let i = 0; i < arr.length; i++) {
                    //     // arr[i]
                    //     let item = arr[i];
                    //     if(item.type == 'on') {
                    //         window.core[item.name];
                    //     }else if(item.type == 'emit') {
                    //         window.core[item.name](item.cb());
                    //     }
                    // }
                    // var operation = {
                    //     name: '',
                    //     type: '',
                    //     cb: function () {
                    //     }
                    // }

                    // window.qtJSON = function ({type, name, cb}) {
                    //     if (type == 'on') {
                    //         window.core[name].connect(cb);
                    //     } else if (type == 'emit') {
                    //         window.core[name](cb());
                    //     }
                    // }
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}