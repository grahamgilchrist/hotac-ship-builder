'use strict';

var $ = require('jquery');
var _ = require('lodash');

var pilotsWithAbilities = require('../models/pilots').pilotsWithAbilities;
var pilots = _.uniqBy(pilotsWithAbilities, function (pilot) {
    return pilot.text;
});
var upgrades = require('../models/upgrades').keyed;
var modalController = require('../controllers/modals');

module.exports = {
    renderUpgradesList: function (build) {
        // Get a list of the slots allowed for this build (determined by ship and PS) and the number of each upgrade per slot
        var upgradesAllowedInBuild = module.exports.numberOfUsableUpgrades(build.pilotSkill, build.currentShip, build.upgrades);
        var upgrades = module.exports.getAllowedUpgrades(build, upgradesAllowedInBuild);

        var $freeList = $('#free-upgrade-list');
        $freeList.empty();
        if (build.currentShip.startingUpgrades && build.currentShip.startingUpgrades.length > 0) {
            $('.free-upgrades').show();
            // Add starting upgrades to the list
            _.forEach(build.currentShip.startingUpgrades, function (upgrade) {
                var $upgradeItem = module.exports.renderUpgradeItem(upgrade);
                $freeList.append($upgradeItem);
            });
        } else {
            $('.free-upgrades').hide();
        }

        var $allowedList = $('#allowed-upgrade-list');
        $allowedList.empty();
        if (upgrades.allowed.length > 0 || build.pilotAbilities.length > 0) {
            $('.purchased-upgrades .no-upgrades').hide();
            // Add purchased upgrades to the list
            _.forEach(upgrades.allowed, function (upgrade) {
                var $upgradeItem = module.exports.renderUpgradeItem(upgrade);
                $allowedList.append($upgradeItem);
            });
            // Add pilot abilities to the list
            _.forEach(build.pilotAbilities, function (pilotAbility) {
                var $upgradeItem = module.exports.renderPilotUpgradeItem(pilotAbility);
                $allowedList.append($upgradeItem);
            });
        } else {
            $('.purchased-upgrades .no-upgrades').show();
        }

        var $disallowedList = $('#disabled-upgrade-list');
        $disallowedList.empty();
        if (upgrades.disallowed.length > 0) {
            // there's some disabled upgrades here
            $('.disabled-upgrades').show();
            _.forEach(upgrades.disallowed, function (upgrade) {
                var $upgradeItem = module.exports.renderUpgradeItem(upgrade);
                $disallowedList.append($upgradeItem);
            });
        } else {
            $('.disabled-upgrades').hide();
        }

        // var $buyNewList = $('#buy-upgrades-list');
        // $buyNewList.empty();
        // _.forEach(upgradesAllowedInBuild, function (slotInfo, slotType) {
        //     var $button = module.exports.renderAddUpgradeButton(slotType, build);
        //     $buyNewList.append($button);
        // });

    },
    getAllowedUpgrades: function (build, upgradesAllowedInBuild) {
        var purchasedUpgradesByType = _.clone(build.upgrades, true);

        var allowedUpgrades = [];
        var disallowedUpgrades = [];

        // Populate allowed and disallowed slot lists with the purchased upgrades
        _.forEach(purchasedUpgradesByType, function (upgradesList, slotType) {
            // Find the keys of any slots in the build that match these upgrades
            if (upgradesAllowedInBuild[slotType]) {
                // Allowed in build
                allowedUpgrades = allowedUpgrades.concat(upgradesList);
            } else {
                // This slot not allowed in this build (restricted by ship?)
                disallowedUpgrades = disallowedUpgrades.concat(upgradesList);
            }
        });

        return {
            allowed: allowedUpgrades,
            disallowed: disallowedUpgrades
        };
    },
    renderUpgradeItem: function (upgrade) {
        var imageUrl = '/components/xwing-data/images/' + upgrade.image;
        var $item = $('<li class="upgrade" data-featherlight="' + imageUrl + '">' + module.exports.getIconString(upgrade.slot) + '<span>' + upgrade.name + '</span><i class="material-icons eye">remove_red_eye</i><img class="preview" src="' + imageUrl + '"></li>');
        return $item;
    },
    renderPilotUpgradeItem: function (pilot) {
        var escapedText = pilot.text.replace(/"/g, '&quot;');
        var $item = $('<li class="upgrade" data-featherlight="' + escapedText + '" data-featherlight-type="text" data-featherlight-variant="preview-pilot-ability">' + module.exports.getIconString('Elite') + '<span>Ability: ' + pilot.name + '</span><i class="material-icons eye">remove_red_eye</i></li>');

        return $item;
    },
    getIconString: function (upgradeSlotType) {
        var iconId = upgradeSlotType.replace(' ', '').replace('-', '');
        iconId = iconId.toLowerCase();
        var iconString = '<i class="xwing-miniatures-font xwing-miniatures-font-' + iconId + '"></i>';
        return iconString;
    },
    renderAddUpgradeButton: function (upgradeType, build) {
        var $li = $('<li>');
        var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">' + module.exports.getIconString(upgradeType) + '<span>' + upgradeType + '</span></button>');
        var filteredUpgrades = module.exports.getFilteredUpgrades(upgradeType, build.upgrades, build.currentShip);
        // Disable button if nothing to show in modal
        if (_.size(filteredUpgrades) === 0) {
            $button.attr('disabled', 'disabled');
        }

        $button.on('click', function () {
            var $modalContent = module.exports.renderUpgradeModalContent(build, filteredUpgrades);
            modalController.openOptionSelectModal($modalContent, 'Buy upgrade');
        });
        $li.append($button);

        return $li;
    },
    getFilteredUpgrades: function (upgradeTypeString, existingUpgrades, currentShip) {
        var upgradeTypes = upgradeTypeString.split(',');

        var filteredUpgradesByType = {};

        _.each(upgradeTypes, function (upgradeType) {
            var upgradesOfType = upgrades[upgradeType];
            var existingUpgradesOfType = existingUpgrades[upgradeType];
            var filteredUpgrades = module.exports.getUpgradesToShow(upgradesOfType, currentShip, existingUpgradesOfType);
            if (filteredUpgrades.length > 0) {
                filteredUpgradesByType[upgradeType] = filteredUpgrades;
            }
        });

        return filteredUpgradesByType;
    },
    renderUpgradeModalContent: function (build, filteredUpgradesByType) {
        var tabs = [];
        _.each(filteredUpgradesByType, function (filteredUpgrades, upgradeType) {
            var $tab = module.exports.renderCardListModalContent(upgradeType, build, filteredUpgrades);
            var tabName = upgradeType;
            if (upgradeType === 'Elite') {
                tabName = 'Elite cards';
            }
            tabs.push({
                name: tabName,
                $content: $tab
            });

            if (upgradeType === 'Elite') {
                var $abilityTab = module.exports.renderPilotAbilityModalContent(build);
                tabs.push({
                    name: 'Pilot abilities',
                    $content: $abilityTab
                });
            }
        });

        return module.exports.renderTabs(tabs);
    },
    renderTabs: function (tabsObject) {
        var $modalContent = $('<div>');

        if (tabsObject.length > 1) {
            // tab link elements
            var $tabsBar = $('<div class="mdl-tabs__tab-bar">');
            _.each(tabsObject, function (tab) {
                var tabId = tab.$content.attr('id');
                var $tabLink = $('<a href="#' + tabId + '" class="mdl-tabs__tab">' + tab.name + '</a>');
                $tabsBar.append($tabLink);
            });
            $tabsBar.find('a').first().addClass('is-active');

            // create DOM structure
            $modalContent.addClass('mdl-tabs mdl-js-tabs mdl-js-ripple-effect');
            $modalContent.prepend($tabsBar);
            tabsObject[0].$content.addClass('is-active');
            _.each(tabsObject, function (tab) {
                tab.$content.addClass('mdl-tabs__panel');
            });
        }

        _.each(tabsObject, function (tab) {
            $modalContent.append(tab.$content);
        });

        return $modalContent;
    },
    renderCardListModalContent: function (upgradeType, build, filteredUpgrades) {
        var $modalContent = $('<div class="card-image-list" id="modal-card-image-list-' + upgradeType + '">');
        var $upgradeList = $('<ul>');

        _.forEach(filteredUpgrades, function (item) {
            var $upgrade = $('<li><img src="/components/xwing-data/images/' + item.image + '" alt="' + item.name + '"></li>');
            if (build.currentXp >= item.points) {
                // We have enough XP to buy this item
                $upgrade.on('click', function () {
                    $(this).trigger('select', {
                        selectedUpgradeEvent: 'view.upgrades.buy',
                        selectedUpgradeId: item.id,
                        text: item.name + ': ' + item.hotacPoints + 'XP'
                    });
                });
            } else {
                // not enough XP
                $upgrade.addClass('cannot-afford');
            }

            $upgradeList.append($upgrade);
        });

        $modalContent.append($upgradeList);

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
    renderPilotAbilityModalContent: function (build) {
        var $modalContent = $('<div class="pilot-ability-list" id="modal-pilot-ability-list">');
        var $upgradeList = $('<ul>');

        _.forEach(pilots, function (pilotCard) {
            var upgradeCost = pilotCard.skill;
            var $upgrade = $('<li><h3>' + pilotCard.name + ' <span class="cost">(' + upgradeCost + 'XP)</span></h3><p>' + pilotCard.text + '</p></li>');
            if (build.currentXp >= upgradeCost) {

                if (build.pilotSkill >= pilotCard.skill) {
                    // We have enough XP to buy this item
                    $upgrade.on('click', function () {
                        $(this).trigger('select', {
                            selectedUpgradeEvent: 'view.pilotAbilities.buy',
                            selectedUpgradeId: pilotCard.id,
                            text: pilotCard.name + ': ' + pilotCard.skill + 'XP'
                        });
                    });
                } else {
                    // not high enough PS level yet
                    $upgrade.addClass('disabled');
                }
            } else {
                // not enough XP
                $upgrade.addClass('cannot-afford');
            }

            $upgradeList.append($upgrade);
        });

        $modalContent.append($upgradeList);

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

        // Add slots for the ship type
        var upgradeSlots = currentShip.upgradeSlots;
        _.each(upgradeSlots, function (slotType) {
            addToSlot(slotType, 1, 1);
        });

        // Add slots for the upgrade cards
        var slotsFromUpgrades = module.exports.getSlotsFromUpgrades(usableUpgrades, currentShip.startingUpgrades, upgradesByType);
        _.each(slotsFromUpgrades, function (slotType) {
            addToSlot(slotType, 1, 1);
        });

        return usableUpgrades;
    },
    getSlotsFromUpgrades: function (usableUpgrades, startingUpgrades, upgradesByType) {
        var additionalSlotTypes = [];

        // array to track which upgrades we've processed grants for, and prevent infinite loop
        var processedGrantForIds = [];
        var processGrants = function (upgrade) {
            // Is the type of this upgrade allowed on this ship?
            var foundGrant = false;
            if (processedGrantForIds.indexOf(upgrade.id) === -1) {
                // Only process this if we haven't already done so
                var slotType = upgrade.slot;
                if (usableUpgrades[slotType] || additionalSlotTypes.indexOf(slotType) >= 0) {
                    // slot is allowed on ship chassis, or is allowed by another upgrade, so lets process any additional slots the upgrade grants
                    if (upgrade.grants) {
                        _.each(upgrade.grants, function (grant) {
                            if (grant.type === 'slot') {
                                foundGrant = true;
                                additionalSlotTypes.push(grant.name);
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

        // Do any starting upgrade grants before the purchased ones
        processGrantsList(startingUpgrades);

        // Add slots given by upgrades/starting upgrades
        _.each(upgradesByType, function (upgradesList) {
            processGrantsList(upgradesList);
        });

        return additionalSlotTypes;
    },
    renderShipUpgrades: function (currentShip, pilotSkill, upgradesByType) {
        // Process and create list for ship chassis slots
        var $shipSlots = $('#ship-slots-default');
        $shipSlots.empty();

        var $ul = $('<ul>');

        var upgradeSlots = module.exports.getShipUpgradeSlots(currentShip);

        _.each(upgradeSlots, function (upgradeSlot) {
            var $li = module.exports.renderShipSlot(upgradeSlot, pilotSkill);
            $ul.append($li);
        });

        $shipSlots.append($ul);

        // Process and create list for slots added by upgrades
        var usableUpgrades = {};
        _.each(upgradeSlots, function (upgradeSlot) {
            usableUpgrades[upgradeSlot.type] = {};
        });
        var slotsFromUpgrades = module.exports.getSlotsFromUpgrades(usableUpgrades, currentShip.startingUpgrades, upgradesByType);

        if (slotsFromUpgrades.length > 0) {
            var $shipSlotsFromUpgrades = $('#ship-slots-upgrades');
            $shipSlotsFromUpgrades.empty();
            $ul = $('<ul>');

            _.each(slotsFromUpgrades, function (slotType) {
                var $li = module.exports.renderSlotFromUpgrade(slotType);
                $ul.append($li);
            });

            $shipSlotsFromUpgrades.append($ul);
            $('#ship-slots-upgrades-wrapper').show();
        } else {
            $('#ship-slots-upgrades-wrapper').hide();
        }

        // refresh any material lite components added
        window.componentHandler.upgradeDom();
    },
    renderShipSlot: function (upgradeSlot, pilotSkill) {
        var $li = $('<li>');
        var $title = $('<div class="ship-slot">' + module.exports.getIconString(upgradeSlot.type) + ' <span>' + upgradeSlot.type + '</span></div>');
        $li.append($title);
        if (pilotSkill < upgradeSlot.pilotSkill) {
            $li.addClass('disabled');
            $title.append('<span> (PS ' + upgradeSlot.pilotSkill + ')</span>');
        } else {
            $li.addClass('enabled');
            var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"><i class="material-icons">add</i></button>');
            // var filteredUpgrades = module.exports.getFilteredUpgrades(upgradeSlot.type, build.upgrades, currentShip);
            // // Disable button if nothing to show in modal
            // if (_.size(filteredUpgrades) === 0) {
            //     $button.attr('disabled', 'disabled');
            // }

            // $button.on('click', function () {
            //     var $modalContent = module.exports.renderUpgradeModalContent(build, filteredUpgrades);
            //     modalController.openOptionSelectModal($modalContent, 'Buy upgrade');
            // });
            $li.append($button);
        }
        return $li;
    },
    renderSlotFromUpgrade: function (slotType) {
        var titleString = '<div class="ship-slot">' + module.exports.getIconString(slotType) + ' <span>' + slotType + '</span></div>';
        var $li = $('<li>' + titleString + '</li>');
        return $li;
    },
    // return a list of all the slots types allowed on this ship, and the PS required to use them
    getShipUpgradeSlots: function (currentShip) {
        // elite slots are dependent on pilot level

        var usableUpgrades = _.map(currentShip.upgradeSlots, function (upgradeSlot) {
            return {
                type: upgradeSlot
            };
        });

        usableUpgrades = usableUpgrades.concat([
            {
                type: 'Title'
            },
            {
                type: 'Modification'
            },
            {
                type: 'Modification',
                pilotSkill: 4
            },
            {
                type: 'Modification',
                pilotSkill: 6
            },
            {
                type: 'Modification',
                pilotSkill: 8
            },
            {
                type: 'Elite',
                pilotSkill: 3
            },
            {
                type: 'Elite',
                pilotSkill: 5
            },
            {
                type: 'Elite',
                pilotSkill: 7
            },
            {
                type: 'Elite',
                pilotSkill: 9
            }
        ]);

        return usableUpgrades;
    }
};
