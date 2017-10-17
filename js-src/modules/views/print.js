'use strict';

var $ = require('jquery');

var templateUtils = require('../utils/templates');

module.exports = {
    render: function (build) {
        var $printElement = $('#print-view');
        templateUtils.render('/templates/print.html', $printElement, build, 'build');
    }
};
