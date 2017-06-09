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
        var purchasedUpgradesByType = _.clone(build.upgrades, true);

        // Sort ships starting upgrades by slot type
        var startingUpgradesByType = {};
        _.each(build.currentShip.startingUpgrades, function (startingUpgrade) {
            var slotType = startingUpgrade.slot;
            if (!startingUpgradesByType[slotType]) {
                startingUpgradesByType[slotType] = [];
            }
            startingUpgradesByType[slotType].push(startingUpgrade);
        });

        // Get a list of the slots allowed for this build (determined by ship and PS) and the number of each upgrade per slot
        var numUpgradesAllowedInBuildByType = module.exports.numberOfUsableUpgrades(build.pilotSkill, build.currentShip);

        // keep track of which allowed slots on the ship have been filled
        var slotTypesUsed = [];

        // Sort purchased upgrades into the allowed slot bins by type. This includes sorting into slots with multiple types
        var allowedUpgradesBySlot = {};
        for (var upgradeTypeString in numUpgradesAllowedInBuildByType) {
            // Add an empty slot here, even if no upgrades purchased
            allowedUpgradesBySlot[upgradeTypeString] = [];
            // this may be a slot which allows multiple upgrade types, so convert to an array
            var upgradeTypes = upgradeTypeString.split(',');
            // Add purchased upgrades which match any of the possible allowed types for this slot
            _.each(upgradeTypes, function (upgradeType) {
                if (purchasedUpgradesByType[upgradeType]) {
                    slotTypesUsed.push(upgradeType);
                    allowedUpgradesBySlot[upgradeTypeString] = allowedUpgradesBySlot[upgradeTypeString].concat(purchasedUpgradesByType[upgradeType]);
                }
            });
        }

        // Find any keys frompurchasedupgradesby type that are not in allowed build and create array for those as disabled upgrades
        var disallowedUpgradesBySlot = {};
        for (var slotType in purchasedUpgradesByType) {
            if (slotTypesUsed.indexOf(slotType) === -1) {
                // this upgrade type was not in the allowed list
                disallowedUpgradesBySlot[slotType] = purchasedUpgradesByType[slotType];
            }
        }

        $('#upgrade-list').empty();
        var $slotList;
        var $upgradeItem;
        for (var allowedSlotType in allowedUpgradesBySlot) {
            $upgradeItem = $('<li>');
            // List of upgrades that match this slot type
            $slotList = module.exports.renderSlotList(allowedSlotType, startingUpgradesByType[allowedSlotType], allowedUpgradesBySlot[allowedSlotType], numUpgradesAllowedInBuildByType[allowedSlotType].allowed, build.pilotAbilities);
            $upgradeItem.append($slotList);

            // Add new upgrade button
            var $upgradeAddButton = module.exports.renderAddUpgradeButton(allowedSlotType, build.currentShip, build.upgrades, build.pilotSkill);
            $upgradeItem.append($upgradeAddButton);

            $('#upgrade-list').append($upgradeItem);
        }

        // TODO: show disallowed upgrades
        for (var disallowedSlotType in disallowedUpgradesBySlot) {
            $upgradeItem = $('<li class="disallowed">');
            $slotList = module.exports.renderSlotList(disallowedSlotType, [], disallowedUpgradesBySlot[disallowedSlotType], 0, build.pilotAbilities);
            $upgradeItem.append($slotList);
            $('#upgrade-list').append($upgradeItem);
        }
    },
    renderSlotList: function (slotType, startingUpgrades, purchasedUpgrades, numUpgradesAllowedInSlot, pilotAbilities) {
        var $ul = $('<ul>');

        // Get title of slot
        var upgradeNames = slotType.split(',');
        var titleStrings = _.map(upgradeNames, function (upgradeName) {
            return module.exports.getIconString(upgradeName) + '<span>' + upgradeName + '</span>';
        });
        var titleString = titleStrings.join(' / ');

        var $li = $('<li class="slot">' + titleString + '<div class="equip">Can equip ' + numUpgradesAllowedInSlot + '</div></li>');
        $ul.append($li);

        _.each(startingUpgrades, function (upgrade) {
            var $li = $('<li class="starting-upgrade" data-featherlight="/components/xwing-data/images/' + upgrade.image + '">' + upgrade.name + '</li>');
            $ul.append($li);
        });

        _.each(purchasedUpgrades, function (upgrade) {
            var $li = $('<li class="upgrade" data-featherlight="/components/xwing-data/images/' + upgrade.image + '">' + upgrade.name + '</li>');
            $ul.append($li);
        });

        if (slotType === 'Elite') {
            _.each(pilotAbilities, function (pilot) {
                var escapedText = pilot.text.replace(/"/g, '&quot;');
                var $li = $('<li class="upgrade" data-featherlight="' + escapedText + '" data-featherlight-type="text">Ability: ' + pilot.name + '</li>');
                $ul.append($li);
            });
        }

        return $ul;
    },
    getIconString: function (upgradeSlotType) {
        var iconId = upgradeSlotType.replace(' ', '').replace('-', '');
        iconId = iconId.toLowerCase();
        var iconString = '<i class="xwing-miniatures-font xwing-miniatures-font-' + iconId + '"></i>';
        return iconString;
    },
    renderAddUpgradeButton: function (upgradeType, currentShip, existingUpgrades, pilotSkill) {
        var $div = $('<div>');
        var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Add</button>');
        $button.on('click', function () {
            var $modalContent = module.exports.renderUpgradeModalContent(upgradeType, currentShip, existingUpgrades, pilotSkill);
            $.featherlight($modalContent);
        });
        $div.append($button);

        return $div;
    },
    renderUpgradeModalContent: function (upgradeTypeString, currentShip, existingUpgrades, pilotSkill) {
        var $modalContent = $('<div>');

        var upgradeTypes = upgradeTypeString.split(',');

        var tabs = [];
        _.each(upgradeTypes, function (upgradeType) {
            var $tab = module.exports.renderCardListModalContent(upgradeType, currentShip, existingUpgrades);
            tabs.push({
                name: upgradeType,
                $content: $tab
            });

            if (upgradeType === 'Elite') {
                var $abilityTab = module.exports.renderPilotAbilityModalContent(pilotSkill);
                tabs.push({
                    name: 'Elite pilot talent cards',
                    $content: $abilityTab
                });
            }
        });

        if (tabs.length > 1) {
            // tab link elements
            var $tabsBar = $('<div class="mdl-tabs__tab-bar">');
            _.each(tabs, function (tab) {
                var tabId = tab.$content.attr('id');
                var $tabLink = $('<a href="#' + tabId + '" class="mdl-tabs__tab">' + tab.name + '</a>');
                $tabsBar.append($tabLink);
            });
            $tabsBar.find('a').first().addClass('is-active');

            // create DOM structure
            $modalContent.addClass('mdl-tabs mdl-js-tabs mdl-js-ripple-effect');
            $modalContent.prepend($tabsBar);
            tabs[0].$content.addClass('is-active');
            _.each(tabs, function (tab) {
                tab.$content.addClass('mdl-tabs__panel');
            });
        }

        _.each(tabs, function (tab) {
            $modalContent.append(tab.$content);
        });

        return $modalContent;
    },
    renderCardListModalContent: function (upgradeType, currentShip, existingUpgrades) {
        var upgradesOfType = upgrades[upgradeType];
        var existingUpgradesOfType = existingUpgrades[upgradeType];

        var filteredUpgrades = module.exports.getUpgradesToShow(upgradesOfType, currentShip, existingUpgradesOfType);

        var chosenUpgradeId;

        var $modalContent = $('<div class="card-image-list" id="modal-card-image-list-' + upgradeType + '">');
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
            var $upgrade = $('<li><h3>' + pilotCard.name + ' (PS ' + pilotCard.skill + ')</h3><p>' + pilotCard.text + '</p></li>');
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
        if (pilotSkill >= 9) {
            eliteSlots = 4;
        } else if (pilotSkill >= 7) {
            eliteSlots = 3;
        } else if (pilotSkill >= 5) {
            eliteSlots = 2;
        } else if (pilotSkill >= 3) {
            eliteSlots = 1;
        }

        // mod slots are dependent on pilot level
        var modSlots = 1;
        if (pilotSkill >= 8) {
            modSlots = 4;
        } else if (pilotSkill >= 6) {
            modSlots = 3;
        } else if (pilotSkill >= 4) {
            modSlots = 2;
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
        var upgradeSlots = currentShip.upgradeSlots;
        _.each(upgradeSlots, function (upgradeArray) {
            var upgradeKey = upgradeArray.join(',');
            if (!usableUpgrades[upgradeKey]) {
                usableUpgrades[upgradeKey] = {
                    max: 1,
                    allowed: 1
                };
            } else {
                usableUpgrades[upgradeKey].max += 1;
                usableUpgrades[upgradeKey].allowed += 1;
            }
        });

        return usableUpgrades;
    }
};
