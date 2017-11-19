'use strict';

var _map = require('lodash/map');
var _each = require('lodash/each');
var _uniq = require('lodash/uniq');

var upgradeSlotsModel = function (build) {
    this.build = build;
    this.reset();
};

upgradeSlotsModel.prototype.reset = function () {
    var shipSlots = this.getShipSlots();
    this.free = shipSlots.free;
    this.allBase = shipSlots.allBase;
    this.enabled = shipSlots.enabled;
    this.disabled = shipSlots.disabled;
    this.resetAdditionalSlots();
};

// Return array of all the possible slots allowed on the ship
// Each item contains slot type and required pilotSkill to unlock
// This is the total number of slots possible base don the ship chassis
upgradeSlotsModel.prototype.getShipSlots = function () {
    var thisBuild = this.build;

    // elite slots are dependent on pilot level
    var allBaseSlots = _map(this.build.currentShip.upgradeSlots, function (upgradeSlot) {
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

    _each(allBaseSlots, function (slot) {
        if (thisBuild.pilotSkill < slot.pilotSkill) {
            // slot should be disabled
            disabledSlots.push(slot);
        } else {
            enabledSlots.push(slot);
        }
    });

    var startingSlots = _map(this.build.currentShip.startingUpgrades, function (upgrade) {
        return {
            type: upgrade.slot,
            upgrade: upgrade
        };
    });

    return {
        free: startingSlots,
        allBase: allBaseSlots,
        enabled: enabledSlots,
        disabled: disabledSlots
    };
};

upgradeSlotsModel.prototype.resetAdditionalSlots = function () {
    this.slotsFromUpgrades = [];
};

upgradeSlotsModel.prototype.addAdditionalSlot = function (upgradeType) {
    var upgradeSlot = {
        type: upgradeType
    };
    this.slotsFromUpgrades.push(upgradeSlot);

    // we return the index of the newly added slot, so that the caller can modify if needed
    return this.slotsFromUpgrades.length - 1;
};

// Return array of upgrade types enabled in current state of ship build (enabled + upgrades)
upgradeSlotsModel.prototype.allUsableSlotTypes = function () {
    var allowedSlots = this.enabled;
    var slotsFromUpgrades = this.slotsFromUpgrades;

    var allEnabledSlotTypes = allowedSlots.concat(slotsFromUpgrades);
    // map output so that it is just a list of types
    allEnabledSlotTypes = _map(allEnabledSlotTypes, function (item) {
        return item.type;
    });

    // Remove any duplicates in array
    allEnabledSlotTypes = _uniq(allEnabledSlotTypes);

    return allEnabledSlotTypes;
};

module.exports = upgradeSlotsModel;
