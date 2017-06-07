'use strict';

var $ = require('jquery');
var _ = require('lodash');

var pilots = require('../models/pilots');

module.exports = {
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
                var $pilotPurchaseList = module.exports.renderPilotAbilityUpgrade(build);
                $upgradeItem.append($pilotPurchaseList);
            }
            $('#upgrade-list').append($upgradeItem);
        }
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
            build.buyPilotAbility(pilotId);
        });
        $div.append($button);

        return $div;
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
