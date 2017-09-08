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
        var urlComponents = [];

        // add callsign and playername as first items
        urlComponents.push(window.encodeURIComponent(build.callsign));
        urlComponents.push(window.encodeURIComponent(build.playerName));

        // Add defeated enemies
        var enemiesList = build.enemyDefeats.exportString();
        urlComponents.push(enemiesList);

        // Add equipped upgrades
        var upgradesString = build.exportEquippedUpgradesString();
        var abilitiesString = build.exportEquippedAbilitiesString();
        urlComponents.push(upgradesString);
        urlComponents.push(abilitiesString);

        // Add XP history items
        var xpHistoryUrlItems = _.map(build.xpHistory, function (xpItem) {
            return xpItem.exportString();
        });
        var xpHistoryString = xpHistoryUrlItems.join(',');
        urlComponents.push(xpHistoryString);

        var exportString = '/v3/' + urlComponents.join('|');
        return exportString;
    },
    parseExportStringToHistory: function (exportString) {
        var splitParts = exportString.split('/');
        var urlVersion = splitParts[1];

        var parseVersionFunction = module.exports.parseUrlStringVersions[urlVersion];
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
                enemies: {},
                equippedUpgrades: [],
                equippedAbilities: []
            };
        },
        // v2 adds enemies
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
                enemies: enemyDefeats.get(),
                equippedUpgrades: [],
                equippedAbilities: []
            };
        },
        // v3 adds equipped upgrades
        v3: function (splitParts) {
            var items = splitParts[2];

            var splitItems = items.split('|');

            var playerName = window.decodeURIComponent(splitItems.shift());
            var callsign = window.decodeURIComponent(splitItems.shift());

            var enemyDefeats = new EnemyDefeatsModel();
            enemyDefeats.parseUrlString(splitItems.shift());

            var equippedUpgrades = JSON.parse(splitItems.shift());
            var equippedAbilities = JSON.parse(splitItems.shift());

            var xpHistoryString = splitItems.shift();
            var xpHistoryItems = xpHistoryString.split(',');
            var xpHistory = _.map(xpHistoryItems, function (stringItem) {
                var xpItem = new XpItem();
                xpItem.parseExportString(stringItem);
                return xpItem;
            });

            return {
                xpHistory: xpHistory,
                callsign: callsign,
                playerName: playerName,
                enemies: enemyDefeats.get(),
                equippedUpgrades: equippedUpgrades,
                equippedAbilities: equippedAbilities
            };
        }
    }
};
