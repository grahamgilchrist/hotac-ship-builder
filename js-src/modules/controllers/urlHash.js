'use strict';

var _ = require('lodash');
var XpItem = require('../models/xpItem');
var EnemyDefeatsModel = require('../models/enemyDefeats');

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
        var enemiesList = build.enemyDefeats.exportString();
        itemExports.unshift(enemiesList);
        itemExports.unshift(window.encodeURIComponent(build.callsign));
        itemExports.unshift(window.encodeURIComponent(build.playerName));
        var exportString = '/v2/' + itemExports.join(',');
        return exportString;
    },
    parseExportStringToHistory: function (exportString) {
        var splitParts = exportString.split('/');
        var urlVersion = splitParts[1];

        var parseVersionFunction = module.exports.parseUrlStringVersions[urlVersion]
        return parseVersionFunction(splitParts);
    },
    parseUrlStringVersions: {
        v1: function (splitParts) {
            var items = splitParts[2];

            var splitItems = items.split(',');

            var playerName = window.decodeURIComponent(splitItems.shift());
            var callsign = window.decodeURIComponent(splitItems.shift());

            var xpHistory = _.map(splitItems, function (stringItem) {
                var xpItem = new XpItem();
                xpItem.parseExportString(stringItem);
                return xpItem;
            });

            return {
                xpHistory: xpHistory,
                callsign: callsign,
                playerName: playerName,
                enemies: {}
            };
        },
        v2: function (splitParts) {
            var items = splitParts[2];

            var splitItems = items.split(',');

            var playerName = window.decodeURIComponent(splitItems.shift());
            var callsign = window.decodeURIComponent(splitItems.shift());
            var enemyDefeats = new EnemyDefeatsModel();
            enemyDefeats.parseUrlString(splitItems.shift());

            var xpHistory = _.map(splitItems, function (stringItem) {
                var xpItem = new XpItem();
                xpItem.parseExportString(stringItem);
                return xpItem;
            });

            return {
                xpHistory: xpHistory,
                callsign: callsign,
                playerName: playerName,
                enemies: enemyDefeats.get()
            };
        }
    }
};
