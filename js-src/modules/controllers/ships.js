'use strict';

var $ = require('jquery');
var _ = require('lodash');
var ships = require('../models/ships');
var upgrades = require('../models/upgrades').keyed;
var Build = require('../models/shipBuild');
var events = require('./events');
var shipInfoView = require('../views/shipInfo');
var xpHistoryView = require('../views/xpHistory');
var upgradesView = require('../views/upgradesView');

var currentBuild;

module.exports = {
    init: function () {
        module.exports.bindStatus();
        module.exports.initResetButton();
        module.exports.initStartingShips();
        module.exports.initShipChange();
        module.exports.initPsIncrease();
        module.exports.initAddXp();
    },
    initResetButton: function () {
        $('.new').addClass('active');

        // bind new button
        $('#new-build').on('click', module.exports.clickResetButton);
    },
    clickResetButton: function () {
        if (currentBuild) {
            var result = window.confirm('Are you sure you want to start a new ship? The existing build will be lost');
            if (!result) {
                return;
            }
        }
        $('.main').removeClass('active');
        $('.new').addClass('active');
    },
    initStartingShips: function () {
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

        // bind starting ship change
        $('#start-build').on('click', function () {
            var chosenShipId = $('#starting-ships').val();
            currentBuild = new Build(chosenShipId);
            $('.new').removeClass('active');
            $('.main').addClass('active');
        });
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
    renderShipUpgrade: function (upgradeType) {
        var $div = $('<div>');
        var $select = $('<select>');
        var $noneOption = $('<option value="0">Select an upgrade...</option>');
        $select.append($noneOption);
        var upgradesOfType = upgrades[upgradeType];
        _.each(upgradesOfType, function (upgradeCard) {
            var $option = $('<option value="' + upgradeCard.id + '">' + upgradeCard.name + '</option>');
            $select.append($option);
        });
        $div.append($select);

        var $button = $('<button>Buy</button>');
        $button.on('click', function () {
            var upgradeId = parseInt($select.val(), 10);
            currentBuild.buyUpgrade(upgradeId);
        });
        $div.append($button);

        return $div;
    },
    initAddXp: function () {
        $('#add-mission-xp').on('click', function () {
            var stringXpAmount = prompt('Add XP earned from a mission');
            var xpAmount = parseInt(stringXpAmount, 10);

            if (!_.isNaN(xpAmount)) {
                currentBuild.addMissionXp(xpAmount);
            }
        });
    },
    bindStatus: function () {
        events.on('build.currentShip.update', function (event, build) {
            $('#ship-current').text(build.currentShip.label).prepend('<i class="xwing-miniatures-ship xwing-miniatures-ship-' + build.currentShip.id + '"></i>');
            shipInfoView.renderShipInfo(build.currentShip);
            upgradesView.renderUpgradesList(build);
        });

        events.on('build.pilotSkill.update', function (event, data) {
            $('#pilot-skill').text(data.pilotSkill);
            $('#pilot-skill-plus-one').text(data.pilotSkill + 1);
            $('#pilot-skill-next-xp-cost').text((data.pilotSkill + 1) * 2);
            upgradesView.renderUpgradesList(data.build);
        });

        events.on('build.xp.update', function (event, xp) {
            $('#xp-current').text(xp);
        });

        events.on('build.upgrades.update', function (event, build) {
            upgradesView.renderUpgradesList(build);
        });

        events.on('build.xpHistory.add', function (event, data) {
            xpHistoryView.renderTableRow(data);
        });

        events.on('build.pilotAbilities.update', function (event, build) {
            upgradesView.renderUpgradesList(build);
        });
    }
};
