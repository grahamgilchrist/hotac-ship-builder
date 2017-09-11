'use strict';

var _ = require('lodash');
var allUpgrades = require('../upgrades').all;
var keyedUpgrades = require('../upgrades').keyed;
var upgradeSlotsModel = require('./upgradeSlotsHelper');
// var pilots = require('../pilots').allRebels;
var events = require('../../controllers/events');

var upgradesModel = function (build, upgradeIdList, equippedIdList) {
    this.build = build;
    // Upgrades in order of purchase
    this.all = this.upgradesFromIds(upgradeIdList);
    this.equipped = this.upgradesFromIds(equippedIdList);
    this.validateEquipped();
};

upgradesModel.prototype.upgradesFromIds = function (upgradeIdList) {
    return _.map(upgradeIdList, this.getUpgradeById);
};

upgradesModel.prototype.validateEquipped = function () {
    // Make sure equipped list only contains upgrades we have purchased
    this.equipped = _.intersection(this.equipped, this.all);

    // TODO: Make sure equipped list only contains upgrade types allowed on ship
};

upgradesModel.prototype.allForType = function (slotType) {
    return _.filter(this.all, function (upgrade) {
        return upgrade.slot === slotType;
    });
};

upgradesModel.prototype.refreshUpgradesState = function () {
    // Upgrades sorted alphabetically by slot type and then name
    this.sorted = this.getSorted();
    // upgrades object keyed by slot type with values being array or upgrades for that slot
    this.allbyType = this.getAllByType();
    this.unequipped = _.difference(this.all, this.equipped);
    // Can only call refreshDisabled() once equipped is set
    this.disabled = this.getDisabled();
};

upgradesModel.prototype.getSorted = function () {
    var sortedUpgrades = _.clone(this.all);
    sortedUpgrades.sort(function (a, b) {
        // sort by slot type first
        if (a.slot < b.slot) {
            return -1;
        }
        if (a.slot > b.slot) {
            return 1;
        }
        // sort by name alphabetically second
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        // a must be equal to b
        return 0;
    });

    return sortedUpgrades;
};

upgradesModel.prototype.getAllByType = function () {
    var allbyType = {};
    _.each(this.all, function (upgrade) {
        var slotType = upgrade.slot;
        if (!allbyType[slotType]) {
            allbyType[slotType] = [];
        }
        allbyType[slotType].push(upgrade);
    });

    return allbyType;
};

upgradesModel.prototype.getDisabled = function () {
    var upgradesAllowedInBuild = upgradeSlotsModel.allUsableSlotTypes(this.build);

    var purchasedUpgradesByType = _.clone(this.allbyType, true);

    var disabledUpgrades = [];

    _.forEach(purchasedUpgradesByType, function (upgradesList, slotType) {
        // Find the keys of any slots in the build that match these upgrades
        if (upgradesAllowedInBuild.indexOf(slotType) === -1) {
            // This slot not allowed in this build
            disabledUpgrades = disabledUpgrades.concat(upgradesList);
        }
    });

    return disabledUpgrades;
};

upgradesModel.prototype.buyCard = function (upgradeId) {
    var upgrade = this.getUpgradeById(upgradeId);
    this.all.push(upgrade);
    this.refreshUpgradesState();
    events.trigger('model.build.upgrades.update', this.build);
};

// upgradesModel.prototype.buyPilotAbility = function () {

// };

upgradesModel.prototype.equip = function (upgradeId) {
    var upgrade = this.getUpgradeById(upgradeId);
    this.equipped.push(upgrade);
    this.validateEquipped();
    this.refreshUpgradesState();
    events.trigger('model.build.equippedUpgrades.update', this.build);
};

upgradesModel.prototype.unequip = function (upgradeId) {
    // find the first instance of this upgrade in the equipped list.
    // We only look for the first time it appears, as there may be several of the same card equipped
    var removeIndex = _.findIndex(this.equipped, function (upgrade) {
        return upgrade.id === upgradeId;
    });
    // Now remove found index from equipped list
    if (removeIndex > -1) {
        this.equipped.splice(removeIndex, 1);
        this.refreshUpgradesState();
        events.trigger('model.build.equippedUpgrades.update', this.build);
    }
};

upgradesModel.prototype.getUpgradeById = function (upgradeId) {
    return _.find(allUpgrades, function (upgradeItem) {
        return upgradeItem.id === upgradeId;
    });
};

// Return array of upgrades of specific type which are legal to purchased for current build
//  (e.g. restricted by chassis, size, already a starting upgrade, already purchased etc.)
upgradesModel.prototype.getAvailableToBuy = function (upgradeType) {
    var thisModel = this;
    var upgradesOfType = keyedUpgrades[upgradeType];
    var existingUpgradesOfType = this.allForType(upgradeType);

    var filteredUpgrades = _.filter(upgradesOfType, function (upgrade) {
        // Remove any upgrades for different ships
        if (upgrade.ship && upgrade.ship.indexOf(thisModel.build.currentShip.shipData.name) < 0) {
            return false;
        }

        // Remove any upgrades for different ship sizes
        if (upgrade.size && upgrade.size.indexOf(thisModel.build.currentShip.shipData.size) < 0) {
            return false;
        }

        // Don't show anything which is a starting upgrade for the ship
        if (thisModel.build.currentShip.startingUpgrades) {
            var found = _.find(thisModel.build.currentShip.startingUpgrades, function (startingUpgrade) {
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
};

module.exports = upgradesModel;
