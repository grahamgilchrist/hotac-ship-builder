'use strict';

var _ = require('lodash');
var allUpgrades = require('../upgrades').all;
var keyedUpgrades = require('../upgrades').keyed;
// var pilots = require('../pilots').allRebels;
var events = require('../../controllers/events');
var arrayUtils = require('../../utils/array-utils');

var upgradesModel = function (build, upgradeIdList, equippedIdList) {
    this.build = build;
    // Upgrades in order of purchase
    this.purchased = this.upgradesFromIds(upgradeIdList);
    this.equipped = this.upgradesFromIds(equippedIdList);
    this.validateEquipped();
};

upgradesModel.prototype.upgradesFromIds = function (upgradeIdList) {
    return _.map(upgradeIdList, this.getUpgradeById);
};

upgradesModel.prototype.validateEquipped = function () {
    // Make sure equipped list only contains upgrades we have purchased or started with
    this.equipped = arrayUtils.intersectionSingle(this.equipped, this.all);

    // TODO: Make sure equipped list only contains upgrade types allowed on ship
};

upgradesModel.prototype.allForType = function (slotType) {
    return _.filter(this.purchased, function (upgrade) {
        return upgrade.slot === slotType;
    });
};

upgradesModel.prototype.refreshUpgradesState = function () {
    this.all = this.purchased.concat(this.build.currentShip.startingUpgrades);
    // Upgrades sorted alphabetically by slot type and then name
    this.sorted = this.getSorted();
    // upgrades object keyed by slot type with values being array or upgrades for that slot
    this.allbyType = this.getPurchasedByType();
    // Can only call refreshDisabled() once equipped is set
    this.disabled = this.getDisabled();
    this.unequipped = this.getUnequipped();
};

upgradesModel.prototype.getUnequipped = function () {
    // Remove *All* copies of any upgrades which should be disabled
    var notDisabled = _.difference(this.purchased, this.disabled);
    // Remove one copy of each item which is equipped
    var unequipped = arrayUtils.differenceSingle(notDisabled, this.equipped);
    return unequipped;
};

upgradesModel.prototype.getSorted = function () {
    var sortedUpgrades = _.clone(this.purchased);
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

upgradesModel.prototype.getPurchasedByType = function () {
    var allbyType = {};
    _.each(this.purchased, function (upgrade) {
        var slotType = upgrade.slot;
        if (!allbyType[slotType]) {
            allbyType[slotType] = [];
        }
        allbyType[slotType].push(upgrade);
    });

    return allbyType;
};

upgradesModel.prototype.getDisabled = function () {
    var slotsAllowedInBuild = this.build.upgradeSlots.allUsableSlotTypes();

    var purchasedUpgradesByType = _.clone(this.getPurchasedByType, true);

    var disabledUpgrades = [];

    _.forEach(purchasedUpgradesByType, function (upgradesList, slotType) {
        // Find the keys of any slots in the build that match these upgrades
        if (slotsAllowedInBuild.indexOf(slotType) === -1) {
            // This slot not allowed in this build
            disabledUpgrades = disabledUpgrades.concat(upgradesList);
        }
    });

    return disabledUpgrades;
};

upgradesModel.prototype.buyCard = function (upgradeId) {
    var upgrade = this.getUpgradeById(upgradeId);
    this.purchased.push(upgrade);
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
    this.build.upgradeSlots.assignEquipped();
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
        this.build.upgradeSlots.assignEquipped();
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
    var upgradesOfType = keyedUpgrades[upgradeType];
    var allowedUpgrades = _.filter(upgradesOfType, _.bind(this.upgradeAllowed, this));
    return allowedUpgrades;
};

upgradesModel.prototype.upgradeAllowed = function (upgrade) {
    // Remove any upgrades for different ships
    if (upgrade.ship && upgrade.ship.indexOf(this.build.currentShip.shipData.name) < 0) {
        return false;
    }

    // Remove any upgrades for different ship sizes
    if (upgrade.size && upgrade.size.indexOf(this.build.currentShip.shipData.size) < 0) {
        return false;
    }

    // Don't show anything which is a starting upgrade for the ship
    if (this.build.currentShip.startingUpgrades) {
        var found = _.find(this.build.currentShip.startingUpgrades, function (startingUpgrade) {
            return startingUpgrade.xws === upgrade.xws;
        });
        if (found) {
            return false;
        }
    }

    // Remove any upgrades the build already has
    var upgradeExists = _.find(this.purchased, function (existingUpgrade) {
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
};

module.exports = upgradesModel;
