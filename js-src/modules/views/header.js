'use strict';

var $ = require('jquery');

module.exports = {
    init: function () {
        // bind new button
        $('#drawer-button').on('click', module.exports.openDrawer);
        $('#drawer-wrapper .drawer-background').on('click', module.exports.closeDrawer);
    },
    openDrawer: function () {
        $('#drawer-wrapper').addClass('active');
    },
    closeDrawer: function () {
        $('#drawer-wrapper').removeClass('active');
    }
};
