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
        // add callsign and playername as first items
        itemExports.unshift(build.callsign);
        itemExports.unshift(build.playerName);
        var exportString = '/v1/' + itemExports.join(',');
        return exportString;
    },
    parseExportStringToHistory: function (exportString) {
        var splitParts = exportString.split('/');
        var items = splitParts[2];

        var splitItems = items.split(',');

        var playerName = splitItems.shift();
        var callsign = splitItems.shift();

        var xpHistory = _.map(splitItems, function (stringItem) {
            var xpItem = new XpItem();
            xpItem.parseExportString(stringItem);
            return xpItem;
        });

        return {
            xpHistory: xpHistory,
            callsign: callsign,
            playerName: playerName
        };
    }
};
