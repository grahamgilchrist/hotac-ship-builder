'use strict';

// eslint-disable-next-line new-cap
var codec = window.JsonUrl('lzma');

var _map = require('lodash/map');
var $ = require('jquery');
var XpItem = require('../models/shipBuild/xpItem');
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
    generateAndSet: function (build) {
        var promise = module.exports.generateExportString(build);
        promise.then(function (newHash) {
            var exportString = '/v4/' + newHash;
            module.exports.set(exportString);
        });
    },
    generateExportString: function (build) {
        var urlComponents = [];

        // add callsign and playername as first items
        urlComponents.push(window.encodeURIComponent(build.playerName));
        urlComponents.push(window.encodeURIComponent(build.callsign));

        // Add defeated enemies
        var enemiesList = build.enemyDefeats.exportString();
        urlComponents.push(enemiesList);

        // Add equipped upgrades
        var upgradesString = build.exportEquippedUpgradesString();
        var abilitiesString = build.exportEquippedAbilitiesString();
        urlComponents.push(upgradesString);
        urlComponents.push(abilitiesString);

        // Add XP history items
        var xpHistoryUrlItems = _map(build.xpHistory, function (xpItem) {
            return xpItem.exportString();
        });
        urlComponents.push(xpHistoryUrlItems);

        return codec.compress(urlComponents);
    },
    parseExportStringToHistory: function (exportString) {
        var decodedString = window.decodeURIComponent(exportString);
        var splitParts = decodedString.split('/');
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

            var xpHistory = _map(splitItems, function (stringItem) {
                var xpItem = new XpItem();
                xpItem.parseExportStringLessV3(stringItem);
                return xpItem;
            });

            var parsedData = {
                xpHistory: xpHistory,
                callsign: callsign,
                playerName: playerName,
                enemies: {},
                equippedUpgrades: [],
                equippedAbilities: []
            };

            // eslint-disable-next-line new-cap
            var deferred = $.Deferred();
            deferred.resolve(parsedData);

            return deferred.promise();
        },
        // v2 adds enemies
        v2: function (splitParts) {
            var items = splitParts[2];

            var splitItems = items.split(',');

            var playerName = window.decodeURIComponent(splitItems.shift());
            var callsign = window.decodeURIComponent(splitItems.shift());
            var enemyDefeats = new EnemyDefeatsModel();
            enemyDefeats.parseUrlString(splitItems.shift());

            var xpHistory = _map(splitItems, function (stringItem) {
                var xpItem = new XpItem();
                xpItem.parseExportStringLessV3(stringItem);
                return xpItem;
            });

            var parsedData = {
                xpHistory: xpHistory,
                callsign: callsign,
                playerName: playerName,
                enemies: enemyDefeats.get(),
                equippedUpgrades: [],
                equippedAbilities: []
            };

            // eslint-disable-next-line new-cap
            var deferred = $.Deferred();
            deferred.resolve(parsedData);

            return deferred.promise();
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
            var xpHistory = _map(xpHistoryItems, function (stringItem) {
                var xpItem = new XpItem();
                xpItem.parseExportStringLessV3(stringItem);
                return xpItem;
            });

            var parsedData = {
                xpHistory: xpHistory,
                callsign: callsign,
                playerName: playerName,
                enemies: enemyDefeats.get(),
                equippedUpgrades: equippedUpgrades,
                equippedAbilities: equippedAbilities
            };

            // eslint-disable-next-line new-cap
            var deferred = $.Deferred();
            deferred.resolve(parsedData);

            return deferred.promise();
        },
        // v4 encodes and cmpresses JSON object
        v4: function (splitParts) {
            var compressedData = splitParts[2];

            // var afterCompressed
            return codec.decompress(compressedData).then(function (json) {
                var splitItems = json;

                var playerName = window.decodeURIComponent(splitItems.shift());
                var callsign = window.decodeURIComponent(splitItems.shift());

                var enemyDefeats = new EnemyDefeatsModel();
                enemyDefeats.parseUrlString(splitItems.shift());

                var equippedUpgrades = JSON.parse(splitItems.shift());
                var equippedAbilities = JSON.parse(splitItems.shift());

                var xpHistoryItems = splitItems.shift();
                var xpHistory = _map(xpHistoryItems, function (stringItem) {
                    var xpItem = new XpItem();
                    xpItem.parseExportString(stringItem);
                    return xpItem;
                });

                var parsedData = {
                    xpHistory: xpHistory,
                    callsign: callsign,
                    playerName: playerName,
                    enemies: enemyDefeats.get(),
                    equippedUpgrades: equippedUpgrades,
                    equippedAbilities: equippedAbilities
                };

                return parsedData;
            });

        }
    }
};
