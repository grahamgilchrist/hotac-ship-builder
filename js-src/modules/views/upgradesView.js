'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');
var pilots = require('../models/pilots');
var upgrades = require('../models/upgrades').keyed;

module.exports = {
    renderUpgradesList: function (build) {
        var keyedUpgrades = _.clone(build.upgrades, true);
        var numUsableUpgrades = module.exports.numberOfUsableUpgrades(build.pilotSkill, build.currentShip);
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

            var $upgradePurchaseList = module.exports.renderNewUpgrades(type, build.currentShip);
            $upgradeItem.append($upgradePurchaseList);

            if (type === 'Elite') {
                var $pilotPurchaseList = module.exports.renderPilotAbilityUpgrade(build);
                $upgradeItem.append($pilotPurchaseList);
            }
            $('#upgrade-list').append($upgradeItem);
        }
    },
    renderNewUpgrades: function (upgradeType, currentShip) {
        var $div = $('<div>');
        var $button = $('<button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored"><i class="material-icons">add</i></button>');
        $button.on('click', function () {
            var $modalContent = module.exports.renderUpgradeModalContent(upgradeType, currentShip);
            $.featherlight($modalContent);
        });
        $div.append($button);

        return $div;
    },
    renderUpgradeModalContent: function (upgradeType, currentShip) {
        var upgradesOfType = upgrades[upgradeType];

        // filter out
        var filteredUpgrades = _.filter(upgradesOfType, function (upgrade) {
            if (upgrade.ship && upgrade.ship.indexOf(currentShip.shipData.name) < 0) {
                // There's a ship restriction, and it doesn't match this one
                return false;
            }
            if (upgrade.size && upgrade.size.indexOf(currentShip.shipData.size) < 0) {
                // There's a ship size restriction, and it doesn't match this one
                return false;
            }

            return true;
        });

        var chosenUpgradeId;

        var $modalContent = $('<div>');
        var $summary = $('<div class="summary">');
        var $upgradeList = $('<ul>');

        _.forEach(filteredUpgrades, function (item) {
            var $upgrade = $('<li><img src="/components/xwing-data/images/' + item.image + '" alt="' + item.name + '"></li>');
            $upgrade.on('click', function () {
                var $text = $('<span>' + item.name + ': ' + item.points + 'XP</span>');
                var $summaryElement = $('.featherlight .summary');
                $summaryElement.html($text);
                chosenUpgradeId = item.id;
            });
            $upgradeList.append($upgrade);
        });

        var $button = $('<button>Buy upgrade</button>');
        $button.on('click', function () {
            events.trigger('view.upgrades.buy', chosenUpgradeId);
            $.featherlight.close();
        });

        $modalContent.append($upgradeList);
        $modalContent.append($summary);
        $modalContent.append($button);

        return $modalContent;
    },
    renderPilotAbilityUpgrade: function (build) {
        // Only show pilots of current PS or lower
        var availablePilots = _.filter(pilots.pilotsWithAbilities, function (pilot) {
            return pilot.skill <= build.pilotSkill;
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
            events.trigger('view.pilotAbilities.buy', pilotId);
        });
        $div.append($button);

        return $div;
    },
    numberOfUsableUpgrades: function (pilotSkill, currentShip) {

        // elite slots are dependent on pilot level
        var eliteSlots = 0;
        if (pilotSkill >= 3) {
            eliteSlots = 1;
        } else if (pilotSkill >= 5) {
            eliteSlots = 2;
        } else if (pilotSkill >= 7) {
            eliteSlots = 3;
        } else if (pilotSkill >= 9) {
            eliteSlots = 4;
        }

        // mod slots are dependent on pilot level
        var modSlots = 1;
        if (pilotSkill >= 4) {
            modSlots = 2;
        } else if (pilotSkill >= 6) {
            modSlots = 3;
        } else if (pilotSkill >= 8) {
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
        var shipUpgrades = currentShip.upgrades;
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
