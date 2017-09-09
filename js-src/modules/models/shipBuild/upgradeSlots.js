'use strict';

var _ = require('lodash');

module.exports = {
    // Return array of all the possible slots allowed on the ship
    // Each item contains slot type and required pilotSkill to unlock
    // This is the total number of slots possible base don the ship chassis
    getShipSlots: function (currentShip) {
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
    },
    // Return array of upgrade types allowed in current state of ship build
    allowedUpgradeTypes: function (pilotSkill, currentShip, upgradesByType) {
        var usableUpgrades = _.extend([], currentShip.upgradeSlots);

        // Add slots for the upgrade cards
        var slotsFromUpgrades = module.exports.getSlotsFromUpgrades(currentShip, upgradesByType);
        _.each(slotsFromUpgrades, function (slotType) {
            usableUpgrades.push(slotType);
        });

        usableUpgrades.push('Modification');
        usableUpgrades.push('Title');

        // elite slots are dependent on pilot level
        if (pilotSkill >= 3) {
            usableUpgrades.push('Elite');
        }

        // Remove any duplicates in array
        usableUpgrades = _.uniq(usableUpgrades);

        return usableUpgrades;
    },
    // Returns array of slot types granted by starting and purchased upgrade cards
    getSlotsFromUpgrades: function (currentShip, upgradesByType) {
        // Add slots for the ship type and unlocked PS levels
        var usableUpgrades = {};
        var upgradeSlots = module.exports.getShipSlots(currentShip);
        _.each(upgradeSlots, function (upgradeSlot) {
            usableUpgrades[upgradeSlot.type] = {};
        });

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
                    // slot is allowed on ship, so lets process any additional slots the upgrade grants
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
        processGrantsList(currentShip.startingUpgrades);

        // Add slots given by upgrades/starting upgrades
        _.each(upgradesByType, function (upgradesList) {
            processGrantsList(upgradesList);
        });

        return additionalSlotTypes;
    }
};
