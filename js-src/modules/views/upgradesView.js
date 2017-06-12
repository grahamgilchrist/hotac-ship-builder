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
        // Get a list of the slots allowed for this build (determined by ship and PS) and the number of each upgrade per slot
        var numUpgradesAllowedInBuildByType = module.exports.numberOfUsableUpgrades(build.pilotSkill, build.currentShip, build.upgrades);

        // Get grouped allowed/disallowed upgrade slots for this build
        var upgradesBySlot = module.exports.getAllowedDisallowedUpgradesBySlot(build, numUpgradesAllowedInBuildByType);

        // Sort ships starting upgrades by slot type
        var startingUpgradesByType = module.exports.groupStartingUpgradesByType(build.currentShip.startingUpgrades);

        $('#upgrade-list').empty();
        var $slotList;
        var $upgradeItem;
        _.forEach(upgradesBySlot.allowed, function (upgradesList, slotType) {
            $upgradeItem = $('<li>');
            // List of upgrades that match this slot type
            $slotList = module.exports.renderSlotList(slotType, startingUpgradesByType[slotType], upgradesList, numUpgradesAllowedInBuildByType[slotType].allowed, build.pilotAbilities);
            $upgradeItem.append($slotList);

            // Add new upgrade button
            var $upgradeAddButton = module.exports.renderAddUpgradeButton(slotType, build.currentShip, build.upgrades, build.pilotSkill);
            $upgradeItem.append($upgradeAddButton);

            $('#upgrade-list').append($upgradeItem);
        });

        // Show disallowed upgrades
        _.forEach(upgradesBySlot.disallowed, function (upgradesList, slotType) {
            $upgradeItem = $('<li class="disallowed">');
            $slotList = module.exports.renderSlotList(slotType, [], upgradesList, 0, build.pilotAbilities);
            $upgradeItem.append($slotList);
            $('#upgrade-list').append($upgradeItem);
        });
    },
    getAllowedDisallowedUpgradesBySlot: function (build, numUpgradesAllowedInBuildByType) {
        var purchasedUpgradesByType = _.clone(build.upgrades, true);

        var allowedUpgradesBySlot = {};
        var disallowedUpgradesBySlot = {};

        // Make sure we have at least an empty entry for every slot the build is allowed to take
        _.forEach(numUpgradesAllowedInBuildByType, function (slotSizes, slotTypeString) {
            allowedUpgradesBySlot[slotTypeString] = [];
        });

        // Populate allowed and disallowed slot lists with the purchased upgrades
        _.forEach(purchasedUpgradesByType, function (upgradesList, slotType) {
            // Find the keys of any slots in the build that match these upgrades
            var matchingSlotKeys = module.exports.getMatchingBuildSlots(numUpgradesAllowedInBuildByType, slotType);
            if (matchingSlotKeys.length > 0) {
                // Allowed in build
                _.forEach(matchingSlotKeys, function (matchingSlotKey) {
                    allowedUpgradesBySlot[matchingSlotKey] = allowedUpgradesBySlot[matchingSlotKey].concat(upgradesList);
                });
            } else {
                // This slot not allowed in this build (restricted by ship?)
                disallowedUpgradesBySlot[slotType] = upgradesList;
            }
        });

        return {
            allowed: allowedUpgradesBySlot,
            disallowed: disallowedUpgradesBySlot
        };
    },
    // Given a set of upgrades and a slot type, assign the upgrades to any slot which
    getMatchingBuildSlots: function (slotTypesAllowedInBuild, upgradesSlotType) {
        var matchingSlotKeys = [];

        // Look through all the allowed slots for this build and return any that match the specified slot type
        // Build may have multiple of the same slots (e.g. bombs) or have some combined slots (e.g. mod/crew in b-wing)
        _.forEach(slotTypesAllowedInBuild, function (slotSizes, allowedSlotTypeKey) {
            // this may be a slot which allows multiple upgrade types, so convert to an array
            var allowedSlotTypes = allowedSlotTypeKey.split(',');

            // Does the specified Slot type match any of the possible allowed types for this build?
            if (allowedSlotTypes.indexOf(upgradesSlotType) >= 0) {
                matchingSlotKeys.push(allowedSlotTypeKey);
            }
        });
        return matchingSlotKeys;
    },
    groupStartingUpgradesByType: function (startingUpgrades) {
        // Sort ships starting upgrades by slot type
        var startingUpgradesByType = {};
        _.each(startingUpgrades, function (startingUpgrade) {
            var slotType = startingUpgrade.slot;
            if (!startingUpgradesByType[slotType]) {
                startingUpgradesByType[slotType] = [];
            }
            startingUpgradesByType[slotType].push(startingUpgrade);
        });
        return startingUpgradesByType;
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
        var $footer = $('<div class="modal-footer">');
        var $summary = $('<div class="summary">');
        var $upgradeList = $('<ul>');

        _.forEach(filteredUpgrades, function (item) {
            var $upgrade = $('<li><img src="/components/xwing-data/images/' + item.image + '" alt="' + item.name + '"></li>');
            $upgrade.on('click', function () {
                var $text = $('<span>' + item.name + ': ' + item.hotacPoints + 'XP</span>');
                var $summaryElement = $('.featherlight .summary');
                $summaryElement.html($text);
                chosenUpgradeId = item.id;
                $(this).closest('.featherlight').find('.modal-footer button').removeAttr('disabled');
            });
            $upgradeList.append($upgrade);
        });

        var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" disabled>Buy upgrade</button>');
        $button.on('click', function () {
            events.trigger('view.upgrades.buy', chosenUpgradeId);
            $.featherlight.close();
        });

        $footer.append($summary);
        $footer.append($button);
        $modalContent.append($upgradeList);
        $modalContent.append($footer);

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
    numberOfUsableUpgrades: function (pilotSkill, currentShip, upgradesByType) {

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

        // Array to track the actual slot names allowed by the ship (not just the combined keys)
        // Used to check validity of slots added by upgrade cards
        var allowedShipSlots = [];
        var addToSlot = function (slotKey, max, allowed) {
            if (!usableUpgrades[slotKey]) {
                usableUpgrades[slotKey] = {
                    max: max,
                    allowed: allowed
                };
            } else {
                usableUpgrades[slotKey].max += max;
                usableUpgrades[slotKey].allowed += allowed;
            }
        };

        // array to track which upgrades we've processed grants for, and prevent infinite loop
        var processedGrantForIds = [];
        var processGrants = function (upgrade) {
            // Is the type of this upgrade allowed on this ship?
            var foundGrant = false;
            if (processedGrantForIds.indexOf(upgrade.id) === -1) {
                // Only process this if we haven't already done so
                var slotType = upgrade.slot;
                if (usableUpgrades[slotType] || allowedShipSlots.indexOf(slotType) >= 0) {
                    // slot is allowed on ship, so lets process any addiitonal slots the upgrade grants
                    if (upgrade.grants) {
                        _.each(upgrade.grants, function (grant) {
                            if (grant.type === 'slot') {
                                foundGrant = true;
                                addToSlot(grant.name, 1, 1);
                            }
                        });
                    }
                }
            }
            return foundGrant;
        };

        var processGrantsList = function (upgradeList) {
            var found = false;
            // keep looping while we find results. If we find a grant, we have to process the
            // whole list again, in case it affects another upgrade
            do {
                found = _.find(upgradeList, processGrants);
                if (found && found.id) {
                    processedGrantForIds.push(found.id);
                }
            } while (found);
        };

        // Add slots for the ship type
        var upgradeSlots = currentShip.upgradeSlots;
        _.each(upgradeSlots, function (upgradeArray) {
            var upgradeKey = upgradeArray.join(',');
            addToSlot(upgradeKey, 1, 1);
            allowedShipSlots = allowedShipSlots.concat(upgradeArray);
        });

        // Do any starting upgrade grants before the purchased ones
        processGrantsList(currentShip.startingUpgrades);

        // Add slots given by upgrades/starting upgrades
        _.each(upgradesByType, function (upgradesList) {
            processGrantsList(upgradesList);
        });

        return usableUpgrades;
    }
};
