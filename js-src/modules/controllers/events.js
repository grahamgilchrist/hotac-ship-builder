'use strict';

var $ = require('jquery');

module.exports = {
    trigger: function (eventName, data) {
        $(document).trigger(eventName, data);
    },
    on: function (eventName, callback) {
        $(document).on(eventName, callback);
    }
};
