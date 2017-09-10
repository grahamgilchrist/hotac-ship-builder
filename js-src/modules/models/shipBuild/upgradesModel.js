'use strict';

var _ = require('lodash');
var allUpgrades = require('../upgrades').all;
var upgradeSlotsModel = require('./upgradeSlots');
var pilots = require('../pilots').allRebels;
var events = require('../../controllers/events');

var upgradesModel = function (build, upgradeIdList, equippedIdList) {
    this.build = build;
    // Upgrades in order of purchase
    this.all = this.upgradesFromIds(upgradeIdList);
    this.equipped = this.upgradesFromIds(equippedIdList);
    this.validateEquipped();
    this.refreshUpgradesState();
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
    events.trigger('model.build.upgrades.update', this);
};

upgradesModel.prototype.buyPilotAbility = function () {

};

upgradesModel.prototype.equip = function () {

};

upgradesModel.prototype.unequip = function () {

};

upgradesModel.prototype.getUpgradeById = function (upgradeId) {
    return _.find(allUpgrades, function (upgradeItem) {
        return upgradeItem.id === upgradeId;
    });
};

module.exports = upgradesModel;
