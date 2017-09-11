'use strict';

var _ = require('lodash');

module.exports = {
    // Return array of all the possible slots allowed on the ship
    // Each item contains slot type and required pilotSkill to unlock
    // This is the total number of slots possible base don the ship chassis
    getShipSlots: function (build) {
        // elite slots are dependent on pilot level

        var allBaseSlots = _.map(build.currentShip.upgradeSlots, function (upgradeSlot) {
            return {
                type: upgradeSlot
            };
        });

        allBaseSlots = allBaseSlots.concat([
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

        // Now work out what slots are allowed in current build dependent on PS
        var enabledSlots = [];
        var disabledSlots = [];

        _.each(allBaseSlots, function (slot) {
            if (build.pilotSkill < slot.pilotSkill) {
                // slot should be disabled
                disabledSlots.push(slot);
            } else {
                enabledSlots.push(slot);
            }
        });

        var slotsFromUpgrades = module.exports.getSlotsFromUpgrades(build, enabledSlots);

        return {
            allBase: allBaseSlots,
            enabled: enabledSlots,
            disabled: disabledSlots,
            fromUpgrades: slotsFromUpgrades
        };
    },
    // Returns array of slot types granted by starting and purchased upgrade cards
    getSlotsFromUpgrades: function (build, enabledSlots) {
        var additionalSlotTypes = [];

        var enabledTypes = _.map(enabledSlots, function (slot) {
            return slot.type;
        });

        var unProcessedUpgrades = _.filter(build.upgrades.equipped, function (upgrade) {
            return upgrade.grants;
        });

        // Determines if upgrade fits in a slot on the ship or one allowed by another equipped upgrade
        var isAllowedOnShip = function (upgrade) {
            if (enabledTypes.indexOf(upgrade.slot) > -1 || additionalSlotTypes.indexOf(upgrade.slot) > -1) {
                return true;
            }
            return false;
        };

        // array to track which upgrades we've processed grants for, and prevent infinite loop
        var processGrants = function (upgrade) {
            _.each(upgrade.grants, function (grant) {
                if (grant.type === 'slot') {
                    additionalSlotTypes.push(grant.name);
                }
            });
        };

        var foundUpgrade = false;
        // keep looping while we find results. If we find a grant, we have to process the
        // whole list again, in case it affects another upgrade
        do {
            foundUpgrade = _.find(unProcessedUpgrades, isAllowedOnShip);
            if (foundUpgrade && foundUpgrade.id) {
                // process item
                processGrants(foundUpgrade);
                // remove from list to process
                _.remove(unProcessedUpgrades, function (item) {
                    return item.id === foundUpgrade.id;
                });
            }
        } while (foundUpgrade);

        // format slot type array to match getShipSlots() output
        additionalSlotTypes = _.map(additionalSlotTypes, function (upgradeType) {
            var upgradeSlot = {
                type: upgradeType
            };
            return upgradeSlot;
        });

        return additionalSlotTypes;
    },
    // Return array of upgrade types enabled in current state of ship build (enabled + upgrades)
    allUsableSlotTypes: function (build) {
        var shipSlots = module.exports.getShipSlots(build);

        var allowedSlots = shipSlots.enabled;
        var slotsFromUpgrades = shipSlots.fromUpgrades;

        var allEnabledSlotTypes = allowedSlots.concat(slotsFromUpgrades);
        // map output so that it is just a list of types
        allEnabledSlotTypes = _.map(allEnabledSlotTypes, function (item) {
            return item.type;
        });

        // Remove any duplicates in array
        allEnabledSlotTypes = _.uniq(allEnabledSlotTypes);

        return allEnabledSlotTypes;
    }
};
