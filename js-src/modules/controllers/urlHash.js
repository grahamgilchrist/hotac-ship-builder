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
        var enemiesList = build.enemyExportString();
        itemExports.unshift(enemiesList);
        itemExports.unshift(window.encodeURIComponent(build.callsign));
        itemExports.unshift(window.encodeURIComponent(build.playerName));
        var exportString = '/v1/' + itemExports.join(',');
        return exportString;
    },
    parseExportStringToHistory: function (exportString) {
        var splitParts = exportString.split('/');
        var items = splitParts[2];

        var splitItems = items.split(',');

        var playerName = window.decodeURIComponent(splitItems.shift());
        var callsign = window.decodeURIComponent(splitItems.shift());
        var enemies = build.parseEnemyString(splitItems.shift());

        var xpHistory = _.map(splitItems, function (stringItem) {
            var xpItem = new XpItem();
            xpItem.parseExportString(stringItem);
            return xpItem;
        });

        return {
            xpHistory: xpHistory,
            callsign: callsign,
            playerName: playerName,
            enemies: enemies
        };
    }
};
