'use strict';

module.exports = {
    init: function () {
        if (!('serviceWorker' in navigator)) {
            return;
        }
        navigator.serviceWorker.register('/service-worker.js');
    }
};
