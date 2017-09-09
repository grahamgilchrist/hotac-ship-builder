'use strict';

var _ = require('lodash');
var upgradeSlotsModel = require('./upgradeSlots');
var upgrades = require('../upgrades').keyed;

module.exports = {
    // Looks at purchased upgrades in current build and return arrays of upgrades split by allowed/disallowed
    //  e.g. Can they be equipped on with chassis/upgrades?
    getAllowedUpgrades: function (build) {
        var upgradesAllowedInBuild = upgradeSlotsModel.allowedUpgradeTypes(build.pilotSkill, build.currentShip, build.upgrades);

        var purchasedUpgradesByType = _.clone(build.upgrades, true);

        var allowedUpgrades = [];
        var disallowedUpgrades = [];

        // Populate allowed and disallowed slot lists with the purchased upgrades
        _.forEach(purchasedUpgradesByType, function (upgradesList, slotType) {
            // Find the keys of any slots in the build that match these upgrades
            if (upgradesAllowedInBuild.indexOf(slotType) > -1) {
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
    // Return array of upgrades of specific type which are legal to purchased for currernt build
    //  (e.g. restricted by chassis, size, already a starting upgrade, already purchased etc.)
    getFilteredUpgrades: function (upgradeType, existingUpgrades, currentShip) {
        var upgradesOfType = upgrades[upgradeType];
        var existingUpgradesOfType = existingUpgrades[upgradeType];

        var filteredUpgrades = _.filter(upgradesOfType, function (upgrade) {
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
            var upgradeExists = _.find(existingUpgradesOfType, function (existingUpgrade) {
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
    }
};
