'use strict';

var $ = require('jquery');
var _ = require('lodash');
var ships = require('../models/ships');
var Build = require('../models/shipBuild');
var events = require('./events');
var upgrades = require('xwing-data/data/upgrades.js');
console.log('upgrades', upgrades);

var currentBuild;

module.exports = {
    init: function () {
        module.exports.bindStatus();
        module.exports.initStartingShips();
        module.exports.initShipChange();
        module.exports.initPsIncrease();
        module.exports.initUpgrades();
    },
    initStartingShips: function () {
        // bind starting ship change
        $('#starting-ships').on('change', function () {
            var chosenItemValue = $(this).val();
            module.exports.chooseStartingShip(chosenItemValue);
        });

        // get list of starting ships
        var filterFunction = function (item) {
            return item.starting === true;
        };
        var startingShips = _.filter(ships, filterFunction);

        // bind starting ships to DOM
        _.forEach(startingShips, function (item) {
            var $newOption = $('<option value="' + item.id + '">' + item.label + '</option>');
            $('#starting-ships').append($newOption);
        });
        $('#starting-ships option').first().prop('selected', 'selected');
        $('#starting-ships').change();

    },
    chooseStartingShip: function (newShipId) {
        currentBuild = new Build(newShipId);
    },
    initShipChange: function () {
        // bind ships to DOM
        var $changeShipList = $('#change-ship-list');
        var $noneOption = $('<option value="0">Select a ship...</option>');
        $changeShipList.append($noneOption);
        // Add all ships to list
        _.forEach(ships, function (item) {
            var $newOption = $('<option value="' + item.id + '">' + item.label + '</option>');
            $changeShipList.append($newOption);
        });

        $('#change-ship').on('click', function () {
            var chosenItemValue = $changeShipList.val();
            currentBuild.changeShip(chosenItemValue);
        });
    },
    initPsIncrease: function () {
        $('#increase-ps').on('click', function () {
            currentBuild.increasePilotSkill();
        });
    },
    initUpgrades: function () {
        // bind ships to DOM
        var $upgradeList = $('#upgrades-list');
        var $noneOption = $('<option value="0">Select an upgrade...</option>');
        $upgradeList.append($noneOption);
        // Add all ships to list
        _.forEach(upgrades, function (item) {
            var $newOption = $('<option value="' + item.id + '">' + item.name + '</option>');
            $upgradeList.append($newOption);
        });

        $('#buy-upgrade').on('click', function () {
            var chosenItemValue = $upgradeList.val();
            currentBuild.buyUpgrade(chosenItemValue);
        });
    },
    bindStatus: function () {
        events.on('build.pilotSkill.update', function (event, pilotSkill) {
            $('#pilot-skill').text(pilotSkill);
        });

        events.on('build.xp.update', function (event, xp) {
            $('#xp-current').text(xp);
        });

        events.on('build.upgrades.add', function (event, upgradeId) {
            var $upgradeItem = $('<li>' + upgradeId + '</li>');
            $('#upgrade-list').append($upgradeItem);
        });

        events.on('build.xpHistory.update', function (event, xpItem) {
            var $historyItem = $('<tr>');
            $historyItem.append('<td>' + xpItem.type() + ': ' + xpItem.name() + '</td>');
            $historyItem.append('<td>' + xpItem.cost() + '</td>');
            $historyItem.append('<td>' + xpItem.remaining() + '</td>');
            $('#xp-history').append($historyItem);
        });

    }
};
