'use strict';

var $ = require('jquery');
var _ = require('lodash');
var ships = require('../models/ships');
var upgrades = require('../models/upgrades').keyed;
var pilots = require('../models/pilots');
var Build = require('../models/shipBuild');
var events = require('./events');
var shipInfoView = require('../views/shipInfo');
var xpHistoryView = require('../views/xpHistory');

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
    renderPilotAbilityUpgrade: function (pilotSkill) {
        // Only show pilots of current PS or lower
        var availablePilots = _.filter(pilots.pilotsWithAbilities, function (pilot) {
            return pilot.skill <= pilotSkill;
        });

        var $div = $('<div>');
        $div.append('<h4>Named pilot abilities</h4>');
        var $select = $('<select>');
        var $noneOption = $('<option value="0">Select an upgrade...</option>');
        $select.append($noneOption);
        _.each(availablePilots, function (pilotCard) {
            var $option = $('<option value="' + pilotCard.id + '">PS' + pilotCard.skill + ' ' + pilotCard.name + '</option>');
            $select.append($option);
        });
        $div.append($select);

        var $button = $('<button>Buy</button>');
        $button.on('click', function () {
            var pilotId = parseInt($select.val(), 10);
            currentBuild.buyPilotAbility(pilotId);
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
            module.exports.renderUpgradesList(build);
        });

        events.on('build.pilotSkill.update', function (event, data) {
            $('#pilot-skill').text(data.pilotSkill);
            $('#pilot-skill-plus-one').text(data.pilotSkill + 1);
            $('#pilot-skill-next-xp-cost').text((data.pilotSkill + 1) * 2);
            module.exports.renderUpgradesList(data.build);
        });

        events.on('build.xp.update', function (event, xp) {
            $('#xp-current').text(xp);
        });

        events.on('build.upgrades.update', function (event, build) {
            module.exports.renderUpgradesList(build);
        });

        events.on('build.xpHistory.add', function (event, data) {
            xpHistoryView.renderTableRow(data);
        });

        events.on('build.pilotAbilities.update', function (event, build) {
            module.exports.renderUpgradesList(build);
        });
    },
    renderUpgradesList: function (build) {
        var keyedUpgrades = _.clone(build.upgrades, true);
        var numUsableUpgrades = module.exports.numberOfUsableUpgrades(build);
        for (var upgradeType in numUsableUpgrades) {
            if (!keyedUpgrades[upgradeType]) {
                keyedUpgrades[upgradeType] = [];
            }
        }

        var $upgradeItem;
        var $ul;
        var numAvailableofType;
        $('#upgrade-list').empty();
        for (var type in keyedUpgrades) {
            $upgradeItem = $('<li>');
            numAvailableofType = numUsableUpgrades[type].allowed;
            $ul = $('<ul>');

            var $li = $('<li class="slot">' + type + '<span class="equip">Can equip ' + numAvailableofType + '</span></li>');
            $ul.append($li);

            _.each(keyedUpgrades[type], function (upgrade) {
                var $li = $('<li class="upgrade">' + upgrade.name + '</li>');
                $ul.append($li);
            });
            if (type === 'Elite') {
                _.each(build.pilotAbilities, function (pilot) {
                    var $li = $('<li class="upgrade">Ability: ' + pilot.name + '</li>');
                    $ul.append($li);
                });
            }
            $upgradeItem.append($ul);

            var $upgradePurchaseList = module.exports.renderShipUpgrade(type);
            $upgradeItem.append($upgradePurchaseList);

            if (type === 'Elite') {
                var $pilotPurchaseList = module.exports.renderPilotAbilityUpgrade(currentBuild.pilotSkill);
                $upgradeItem.append($pilotPurchaseList);
            }
            $('#upgrade-list').append($upgradeItem);
        }
    },
    numberOfUsableUpgrades: function (build) {

        // elite slots are dependent on pilot level
        var eliteSlots = 0;
        if (build.pilotSkill >= 3) {
            eliteSlots = 1;
        } else if (build.pilotSkill >= 5) {
            eliteSlots = 2;
        } else if (build.pilotSkill >= 7) {
            eliteSlots = 3;
        } else if (build.pilotSkill >= 9) {
            eliteSlots = 4;
        }

        // mod slots are dependent on pilot level
        var modSlots = 1;
        if (build.pilotSkill >= 4) {
            modSlots = 2;
        } else if (build.pilotSkill >= 6) {
            modSlots = 3;
        } else if (build.pilotSkill >= 8) {
            modSlots = 4;
        }

        var usableUpgrades = {
            Modification: {
                max: 3,
                allowed: modSlots
            }
        };
        if (eliteSlots > 0) {
            usableUpgrades.Elite = {
                max: 4,
                allowed: eliteSlots
            };
        }

        // Add slots for the ship type
        var shipUpgrades = build.currentShip.upgrades;
        _.each(shipUpgrades, function (shipUpgrade) {
            if (!usableUpgrades[shipUpgrade.type]) {
                usableUpgrades[shipUpgrade.type] = {
                    max: 1,
                    allowed: 1
                };
            } else {
                usableUpgrades[shipUpgrade.type].max += 1;
                usableUpgrades[shipUpgrade.type].allowed += 1;
            }
        });

        return usableUpgrades;
    }
};
