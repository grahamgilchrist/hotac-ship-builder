'use strict';

var _ = require('lodash');
var allUpgrades = require('../upgrades').all;
var keyedUpgrades = require('../upgrades').keyed;
var pilots = require('../pilots').allRebels;
var events = require('../../controllers/events');
var arrayUtils = require('../../utils/array-utils');

var upgradesModel = function (build, upgradeIdList, equippedIdList, pilotIds, equippedAbilityIds) {
    this.build = build;
    // Upgrades in order of purchase
    this.purchased = this.upgradesFromIds(upgradeIdList);
    this.purchasedAbilities = this.abilitiesFromIds(pilotIds);
    this.equippedUpgrades = this.upgradesFromIds(equippedIdList);
    this.equippedAbilities = this.abilitiesFromIds(equippedAbilityIds);
    this.refreshUpgradesState();
};

upgradesModel.prototype.upgradesFromIds = function (upgradeIdList) {
    return _.map(upgradeIdList, this.getUpgradeById);
};

upgradesModel.prototype.abilitiesFromIds = function (abilityIdList) {
    return _.map(abilityIdList, this.getPilotById);
};

upgradesModel.prototype.refreshUpgradesState = function () {
    this.all = this.purchased.concat(this.build.currentShip.startingUpgrades);
    // Validate and equip upgrades to slots
    var validatedEquippedUpgrades = this.validateUpgrades(this.equippedUpgrades);
    var validatedEquippedAbilities = this.validateAbilities(this.equippedAbilities);
    this.equippedUpgrades = this.equipUpgradesToSlots(validatedEquippedUpgrades, validatedEquippedAbilities);
    // Can only call getDisabled() once equipped is set, as it needs to look at slots potentially added by equipping
    this.disabled = this.getDisabledUpgrades();
    this.disabledAbilities = this.getDisabledAbilities();
    this.unequipped = this.getUnequippedUpgrades();
    this.unequippedAbilities = this.getUnequippedAbilities();
};

upgradesModel.prototype.validateUpgrades = function (upgradesList) {
    // Make sure equipped list only contains upgrades we have purchased or started with
    var filteredUpgrades = arrayUtils.intersectionSingle(upgradesList, this.all);
    // Make sure equipped list only contains upgrade types allowed on ship
    filteredUpgrades = _.filter(filteredUpgrades, _.bind(this.upgradeAllowedOnShip, this));
    return filteredUpgrades;
};

upgradesModel.prototype.validateAbilities = function (pilotsList) {
    // Make sure equipped list only contains upgrades we have purchased
    var filteredUpgrades = arrayUtils.intersectionSingle(pilotsList, this.purchasedAbilities);
    // Make sure equipped list only contains abilities allowed in the build
    filteredUpgrades = _.filter(filteredUpgrades, _.bind(this.abilityAllowedOnShip, this));
    return filteredUpgrades;
};

upgradesModel.prototype.getDisabledUpgrades = function () {
    var thisModel = this;
    var slotsAllowedInBuild = this.build.upgradeSlots.allUsableSlotTypes();

    var disabledUpgrades = [];

    _.each(this.purchased, function (upgrade) {
        var allowedOnShip = thisModel.upgradeAllowedOnShip(upgrade);
        var allowedInSlots = (slotsAllowedInBuild.indexOf(upgrade.slot) > -1);

        if (!allowedOnShip || !allowedInSlots) {
            disabledUpgrades.push(upgrade);
        }
    });

    return disabledUpgrades;
};

upgradesModel.prototype.getDisabledAbilities = function () {
    var thisModel = this;
    var slotsAllowedInBuild = this.build.upgradeSlots.allUsableSlotTypes();

    var disabledUpgrades = [];

    // Abilities only go in Elite slots
    var allowedInSlots = (slotsAllowedInBuild.indexOf('Elite') > -1);

    _.each(this.purchasedAbilities, function (pilot) {
        var allowedOnShip = thisModel.abilityAllowedOnShip(pilot);

        if (!allowedOnShip || !allowedInSlots) {
            disabledUpgrades.push(pilot);
        }
    });

    return disabledUpgrades;
};

upgradesModel.prototype.getUnequippedUpgrades = function () {
    // Remove *All* copies of any upgrades which should be disabled
    var notDisabled = _.difference(this.purchased, this.disabled);
    // Remove one copy of each item which is equipped
    var unequipped = arrayUtils.differenceSingle(notDisabled, this.equippedUpgrades);
    return unequipped;
};

upgradesModel.prototype.getUnequippedAbilities = function () {
    // Remove *All* copies of any upgrades which should be disabled
    var notDisabled = _.difference(this.purchasedAbilities, this.disabledAbilities);
    // Remove one copy of each item which is equipped
    var unequipped = arrayUtils.differenceSingle(notDisabled, this.equippedAbilities);
    return unequipped;
};

upgradesModel.prototype.buyCard = function (upgradeId) {
    var upgrade = this.getUpgradeById(upgradeId);
    this.purchased.push(upgrade);
    this.refreshUpgradesState();
    events.trigger('model.build.upgrades.update', this.build);
};

upgradesModel.prototype.buyPilotAbility = function (pilotId) {
    var pilot = this.getPilotById(pilotId);
    this.purchasedAbilities.push(pilot);
    this.refreshUpgradesState();
    events.trigger('model.build.pilotAbilities.update', this.build);
};

upgradesModel.prototype.equip = function (upgradeId) {
    var upgrade = this.getUpgradeById(upgradeId);
    this.equippedUpgrades.push(upgrade);
    this.refreshUpgradesState();
    events.trigger('model.build.equippedUpgrades.update', this.build);
};

upgradesModel.prototype.equipAbility = function (pilotId) {
    var pilot = this.getPilotById(pilotId);
    this.equippedAbilities.push(pilot);
    this.refreshUpgradesState();
    events.trigger('model.build.equippedUpgrades.update', this.build);
};

upgradesModel.prototype.unequipUpgrade = function (upgradeId) {
    // find the first instance of this upgrade in the equipped list.
    // We only look for the first time it appears, as there may be several of the same card equipped
    var removeIndex = _.findIndex(this.equippedUpgrades, function (upgrade) {
        return upgrade.id === upgradeId;
    });
    // Now remove found index from equipped list
    if (removeIndex > -1) {
        this.equippedUpgrades.splice(removeIndex, 1);
        this.refreshUpgradesState();
        events.trigger('model.build.equippedUpgrades.update', this.build);
    }
};

upgradesModel.prototype.unequipAbility = function (pilotId) {
    // find the first instance of this upgrade in the equipped list.
    // We only look for the first time it appears, as there may be several of the same card equipped
    var removeIndex = _.findIndex(this.equippedAbilities, function (pilot) {
        return pilot.id === pilotId;
    });
    // Now remove found index from equipped list
    if (removeIndex > -1) {
        this.equippedAbilities.splice(removeIndex, 1);
        this.refreshUpgradesState();
        events.trigger('model.build.equippedUpgrades.update', this.build);
    }
};

upgradesModel.prototype.getUpgradeById = function (upgradeId) {
    return _.find(allUpgrades, function (upgradeItem) {
        return upgradeItem.id === upgradeId;
    });
};

upgradesModel.prototype.getPilotById = function (pilotId) {
    return _.find(pilots, function (pilotCard) {
        return pilotCard.id === pilotId;
    });
};

// Return array of upgrades of specific type which are legal to purchased for current build
//  (e.g. restricted by chassis, size, already a starting upgrade, already purchased etc.)
upgradesModel.prototype.getAvailableToBuy = function (upgradeType) {
    var upgradesOfType = keyedUpgrades[upgradeType];
    var allowedUpgrades = _.filter(upgradesOfType, _.bind(this.upgradeAllowedOnShip, this));
    allowedUpgrades = _.filter(allowedUpgrades, _.bind(this.upgradeAllowed, this));
    return allowedUpgrades;
};

upgradesModel.prototype.upgradeAllowedOnShip = function (upgrade) {
    // Remove any upgrades for different ships
    if (upgrade.ship && upgrade.ship.indexOf(this.build.currentShip.shipData.name) < 0) {
        return false;
    }

    // Remove any upgrades for different ship sizes
    if (upgrade.size && upgrade.size.indexOf(this.build.currentShip.shipData.size) < 0) {
        return false;
    }

    return true;
};

upgradesModel.prototype.abilityAllowedOnShip = function (pilot) {
    // Remove pilots whose PS is higher than build
    if (pilot.skill > this.build.pilotSkill) {
        return false;
    }

    return true;
};

upgradesModel.prototype.upgradeAllowed = function (upgrade) {
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
    var upgradeExists = _.find(this.all, function (existingUpgrade) {
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

upgradesModel.prototype.equipUpgradesToSlots = function (upgradesToEquip, abilitiesToEquip) {
    var thisModel = this;

    var remainingUpgradesToEquip = _.clone(upgradesToEquip);
    var remainingAbilitiesToEquip = _.clone(abilitiesToEquip);
    var equippedUpgrades = [];
    var equippedAbilities = [];

    var upgradeSlots = this.build.upgradeSlots;
    // Reset additonal slots as we are about to repopulate through equipping
    upgradeSlots.resetAdditionalSlots();

    var newSlotIndices = [];

    _.each(upgradeSlots.free, function (upgradeSlot) {
        var matchingUpgrade = thisModel.matchFreeSlot(upgradeSlot, remainingUpgradesToEquip);
        var slotsAddedIndices = thisModel.equipSlot(upgradeSlot, matchingUpgrade, equippedUpgrades, equippedAbilities, remainingUpgradesToEquip, remainingAbilitiesToEquip);
        // If we added any new slots as part of equipping this upgrade, add them to the list
        newSlotIndices = newSlotIndices.concat(slotsAddedIndices);
    });

    _.each(upgradeSlots.enabled, function (upgradeSlot) {
        var matchingUpgrade = thisModel.matchSlot(upgradeSlot, remainingUpgradesToEquip, remainingAbilitiesToEquip);
        var slotsAddedIndices = thisModel.equipSlot(upgradeSlot, matchingUpgrade, equippedUpgrades, equippedAbilities, remainingUpgradesToEquip, remainingAbilitiesToEquip);
        // If we added any new slots as part of equipping this upgrade, add them to the list
        newSlotIndices = newSlotIndices.concat(slotsAddedIndices);
    });

    // If we added any slots via upgrades, equip to them now
    while (newSlotIndices.length > 0) {
        // get the first item index from the array
        var itemIndex = newSlotIndices.shift();
        // try to equip to the additional slot at that index
        var matchingUpgrade = this.matchSlot(this.build.upgradeSlots.slotsFromUpgrades[itemIndex], remainingUpgradesToEquip, remainingAbilitiesToEquip);
        var slotsAddedIndices = this.equipSlot(this.build.upgradeSlots.slotsFromUpgrades[itemIndex], matchingUpgrade, equippedUpgrades, equippedAbilities, remainingUpgradesToEquip, remainingAbilitiesToEquip);
        // If we added yet more slots as part of equipping this upgrade, add them to the list
        newSlotIndices = newSlotIndices.concat(slotsAddedIndices);
    }

    return equippedUpgrades;
};

upgradesModel.prototype.matchFreeSlot = function (upgradeSlot, remainingUpgradesToEquip) {
    // Is there an equipped upgrade for this slot?
    var matchingUpgrade = _.find(remainingUpgradesToEquip, function (upgrade) {
        return upgrade.id === upgradeSlot.upgrade.id;
    });
    return matchingUpgrade;
};

upgradesModel.prototype.matchSlot = function (upgradeSlot, remainingUpgradesToEquip, remainingAbilitiesToEquip) {
    // Is there an equipped upgrade for this slot?
    var matchingUpgrade = _.find(remainingUpgradesToEquip, function (upgrade) {
        return upgrade.slot === upgradeSlot.type;
    });

    if (!matchingUpgrade && upgradeSlot.type === 'Elite') {
        // We didn't find a match, and this is elite, so also check for matching abilities
        matchingUpgrade = _.first(remainingAbilitiesToEquip);
    }
    return matchingUpgrade;
};

upgradesModel.prototype.equipSlot = function (upgradeSlot, upgradeToEquip, equippedUpgrades, equippedAbilities, remainingUpgradesToEquip, remainingAbilitiesToEquip) {
    var addedSlotsIndices = [];

    // clear existing upgrade from slot
    delete upgradeSlot.equipped;

    if (upgradeToEquip) {
        if (this.upgradeisAbility(upgradeToEquip)) {
            // remove this upgrade from the list available to match slots
            arrayUtils.removeFirstMatchingValue(remainingAbilitiesToEquip, upgradeToEquip);
            equippedAbilities.push(upgradeToEquip);
        } else {
            // remove this upgrade from the list available to match slots
            arrayUtils.removeFirstMatchingValue(remainingUpgradesToEquip, upgradeToEquip);
            equippedUpgrades.push(upgradeToEquip);
            // Add any extra slots granted by the upgrade
            addedSlotsIndices = this.addUpgradeGrantsSlot(upgradeToEquip);
        }
        upgradeSlot.equipped = upgradeToEquip;
    }

    // If we added additional slots via a grant on this upgrade, let the caller know
    return addedSlotsIndices;
};

upgradesModel.prototype.addUpgradeGrantsSlot = function (upgrade) {
    var thisModel = this;
    var addedSlotIndices = [];
    _.each(upgrade.grants, function (grant) {
        if (grant.type === 'slot') {
            var addedSlotIndex = thisModel.build.upgradeSlots.addAdditionalSlot(grant.name);
            addedSlotIndices.push(addedSlotIndex);
        }
    });
    return addedSlotIndices;
};

// Return boolean whether upgrade is an ability. Can be used to differentiate between equipped upgrades
//  which are card and which are pilot abilities
upgradesModel.prototype.upgradeisAbility = function (upgrade) {
    if (upgrade.skill) {
        // only pilot cards have skill property, not upgrade cards
        return true;
    }
    return false;
};

module.exports = upgradesModel;
