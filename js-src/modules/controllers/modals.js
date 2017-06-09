'use strict';

var $ = require('jquery');

module.exports = {
    init: function () {
        $.featherlight.defaults.afterOpen = function () {
            window.componentHandler.upgradeDom();
        };
    }
};
