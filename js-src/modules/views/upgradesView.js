'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');
var pilotsWithAbilities = require('../models/pilots').pilotsWithAbilities;
var pilots = _.uniqBy(pilotsWithAbilities, function (pilot) {
    return pilot.text;
});
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

        var keyedStartingUpgrades = {};
        _.each(build.currentShip.startingUpgrades, function (startingUpgrade) {
            if (!keyedStartingUpgrades[startingUpgrade.slot]) {
                keyedStartingUpgrades[startingUpgrade.slot] = [];
            }
            keyedStartingUpgrades[startingUpgrade.slot].push(startingUpgrade);
        });

        var $upgradeItem;
        var $ul;
        var numAvailableofType;
        $('#upgrade-list').empty();
        for (var type in keyedUpgrades) {
            $upgradeItem = $('<li>');
            numAvailableofType = numUsableUpgrades[type].allowed;
            $ul = $('<ul>');

            var upgradeNames = type.split(',');
            var titleStrings = _.map(upgradeNames, function (upgradeName) {
                return module.exports.getIconString(upgradeName) + '<span>' + upgradeName + '</span>';
            });
            var titleString = titleStrings.join(' / ');

            var $li = $('<li class="slot">' + titleString + '<div class="equip">Can equip ' + numAvailableofType + '</div></li>');
            $ul.append($li);

            _.each(keyedStartingUpgrades[type], function (upgrade) {
                var $li = $('<li class="starting-upgrade" data-featherlight="/components/xwing-data/images/' + upgrade.image + '">' + upgrade.name + '</li>');
                $ul.append($li);
            });

            _.each(keyedUpgrades[type], function (upgrade) {
                var $li = $('<li class="upgrade" data-featherlight="/components/xwing-data/images/' + upgrade.image + '">' + upgrade.name + '</li>');
                $ul.append($li);
            });
            if (type === 'Elite') {
                _.each(build.pilotAbilities, function (pilot) {
                    var escapedText = pilot.text.replace(/"/g, '&quot;');
                    var $li = $('<li class="upgrade" data-featherlight="' + escapedText + '" data-featherlight-type="text">Ability: ' + pilot.name + '</li>');
                    $ul.append($li);
                });
            }
            $upgradeItem.append($ul);

            var $upgradePurchaseList = module.exports.renderNewUpgrades(type, build.currentShip, build.upgrades, build.pilotSkill);
            $upgradeItem.append($upgradePurchaseList);

            $('#upgrade-list').append($upgradeItem);
        }
    },
    getIconString: function (upgradeSlotType) {
        var iconId = upgradeSlotType.replace(' ', '').replace('-', '');
        iconId = iconId.toLowerCase();
        var iconString = '<i class="xwing-miniatures-font xwing-miniatures-font-' + iconId + '"></i>';
        return iconString;
    },
    renderNewUpgrades: function (upgradeType, currentShip, existingUpgrades, pilotSkill) {
        var $div = $('<div>');
        var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Add</button>');
        $button.on('click', function () {
            var $modalContent = module.exports.renderUpgradeModalContent(upgradeType, currentShip, existingUpgrades, pilotSkill);
            $.featherlight($modalContent);
        });
        $div.append($button);

        return $div;
    },
    renderUpgradeModalContent: function (upgradeType, currentShip, existingUpgrades, pilotSkill) {
        var $modalContent = $('<div>');

        var $cardListTab = module.exports.renderCardListModalContent(upgradeType, currentShip, existingUpgrades);
        $modalContent.append($cardListTab);

        if (upgradeType === 'Elite') {
            $cardListTab.addClass('mdl-tabs__panel is_active');
            var $abilityTab = module.exports.renderPilotAbilityModalContent(pilotSkill);
            $abilityTab.addClass('mdl-tabs__panel');

            $modalContent.addClass('mdl-tabs');
            var $tabsBar = $('<div class="mdl-tabs__tab-bar">');
            var $tabLink1 = $('<a href="#modal-card-image-list" class="mdl-tabs__tab is-active">Elite pilot talent cards</a>');
            var $tabLink2 = $('<a href="#modal-pilot-ability-list" class="mdl-tabs__tab">Named pilot abilities</a>');
            $tabsBar.append($tabLink1);
            $tabsBar.append($tabLink2);
            $abilityTab.hide();
            $tabLink1.on('click', function (event) {
                $('.featherlight #modal-pilot-ability-list').hide();
                $('.featherlight #modal-card-image-list').show();
                event.preventDefault();
                return false;
            });
            $tabLink2.on('click', function (event) {
                $('.featherlight #modal-card-image-list').hide();
                $('.featherlight #modal-pilot-ability-list').show();
                $abilityTab.show();
                event.preventDefault();
                return false;
            });
            $modalContent.prepend($tabsBar);
            $modalContent.append($abilityTab);
        }

        return $modalContent;
    },
    renderCardListModalContent: function (upgradeType, currentShip, existingUpgrades) {
        var upgradesOfType = upgrades[upgradeType];
        var existingUpgradesOfType = existingUpgrades[upgradeType];

        var filteredUpgrades = module.exports.getUpgradesToShow(upgradesOfType, currentShip, existingUpgradesOfType);

        var chosenUpgradeId;

        var $modalContent = $('<div class="card-image-list" id="modal-card-image-list">');
        var $summary = $('<div class="summary">');
        var $upgradeList = $('<ul>');

        _.forEach(filteredUpgrades, function (item) {
            var $upgrade = $('<li><img src="/components/xwing-data/images/' + item.image + '" alt="' + item.name + '"></li>');
            $upgrade.on('click', function () {
                var $text = $('<span>' + item.name + ': ' + item.hotacPoints + 'XP</span>');
                var $summaryElement = $('.featherlight .summary');
                $summaryElement.html($text);
                chosenUpgradeId = item.id;
            });
            $upgradeList.append($upgrade);
        });

        var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Buy upgrade</button>');
        $button.on('click', function () {
            events.trigger('view.upgrades.buy', chosenUpgradeId);
            $.featherlight.close();
        });

        $modalContent.append($upgradeList);
        $modalContent.append($summary);
        $modalContent.append($button);

        return $modalContent;
    },
    getUpgradesToShow: function (upgrades, currentShip, existingUpgrades) {
        var filteredUpgrades = _.filter(upgrades, function (upgrade) {
            // Remove any upgrades for different ships
            if (upgrade.ship && upgrade.ship.indexOf(currentShip.shipData.name) < 0) {
                return false;
            }

            // Remove any upgrades for different ship sizes
            if (upgrade.size && upgrade.size.indexOf(currentShip.shipData.size) < 0) {
                return false;
            }

            // Don't show anything which is a starting upgrade for the ship
            if (currentShip.startingUpgrades) {
                var found = _.find(currentShip.startingUpgrades, function (startingUpgrade) {
                    return startingUpgrade.xws === upgrade.xws;
                });
                if (found) {
                    return false;
                }
            }

            // Remove any upgrades the build already has
            var upgradeExists = _.find(existingUpgrades, function (existingUpgrade) {
                return existingUpgrade.id === upgrade.id;
            });

            if (upgradeExists) {
                var upgradeIsAllowed = false;
                // filter out any upgrades the player already has
                // except
                // * secondary weapons & bombs
                if (upgrade.slot === 'Bomb' || upgrade.slot === 'Torpedo' || upgrade.slot === 'Cannon' || upgrade.slot === 'Turret' || upgrade.slot === 'Missile') {
                    upgradeIsAllowed = true;
                // * hull upgrade and shield upgrade
                } else if (upgrade.xws === 'hullupgrade' || upgrade.xws === 'shieldupgrade') {
                    upgradeIsAllowed = true;
                }
                if (!upgradeIsAllowed) {
                    return false;
                }
            }

            return true;
        });

        return filteredUpgrades;
    },
    renderPilotAbilityModalContent: function (pilotSkill) {
        // Only show pilots of current PS or lower
        var availablePilots = _.filter(pilots, function (pilot) {
            return pilot.skill <= pilotSkill;
        });

        var chosenPilotId;

        var $modalContent = $('<div class="pilot-ability-list" id="modal-pilot-ability-list">');
        var $summary = $('<div class="summary">');
        var $upgradeList = $('<ul>');

        _.forEach(availablePilots, function (pilotCard) {
            var $upgrade = $('<li><h3>' + pilotCard.name + '</h3><p>' + pilotCard.text + '</p></li>');
            $upgrade.on('click', function () {
                var $text = $('<span>' + pilotCard.name + ': ' + pilotCard.skill + 'XP</span>');
                var $summaryElement = $('.featherlight .summary');
                $summaryElement.html($text);
                chosenPilotId = pilotCard.id;
            });
            $upgradeList.append($upgrade);
        });

        var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Buy ability</button>');
        $button.on('click', function () {
            events.trigger('view.pilotAbilities.buy', chosenPilotId);
            $.featherlight.close();
        });

        $modalContent.append($upgradeList);
        $modalContent.append($summary);
        $modalContent.append($button);

        return $modalContent;
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
            },
            Title: {
                max: 1,
                allowed: 1
            }
        };
        if (eliteSlots > 0) {
            usableUpgrades.Elite = {
                max: 4,
                allowed: eliteSlots
            };
        }

        // Add slots for the ship type
        var shipUpgrades = currentShip.upgradeSlots;
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
