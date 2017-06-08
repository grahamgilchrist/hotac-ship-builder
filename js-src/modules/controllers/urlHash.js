'use strict';

var _ = require('lodash');
var XpItem = require('../models/xpItem');

module.exports = {
    set: function (exportString) {
        document.location.hash = exportString;
    },
    get: function () {
        var hash = document.location.hash;
        var exportString = hash.replace('#', '');
        return exportString;
    },
    clear: function () {
        document.location.hash = '';
    },
    generateExportString: function (build) {
        var itemExports = _.map(build.xpHistory, function (xpItem) {
            return xpItem.exportString();
        });
        var exportString = itemExports.join(',');
        return exportString;
    },
    parseExportStringToHistory: function (exportString) {
        var splitItems = exportString.split(',');
        var xpHistory = _.map(splitItems, function (stringItem) {
            var xpItem = new XpItem();
            xpItem.parseExportString(stringItem);
            return xpItem;
        });

        return xpHistory;
    }
};
