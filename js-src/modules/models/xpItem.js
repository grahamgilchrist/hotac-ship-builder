'use strict';

var _ = require('lodash');
var itemTypes = require('./itemTypes');
var ships = require('./ships');
var upgrades = require('../models/upgrades').all;

var XpItem = function (upgradeType, data) {
    this.upgradeType = upgradeType;
    this.data = data;
};

XpItem.prototype.cost = function () {
    if (this.upgradeType === itemTypes.SHIP_TYPE) {
        return -5;
    } else if (this.upgradeType === itemTypes.STARTING_SHIP_TYPE) {
        var startingShip = this.getShipById(this.data.shipId);
        return startingShip.startingXp;
    } else if (this.upgradeType === itemTypes.PILOT_SKILL) {
        // pilot skill costs double skill level upgrading to
        return (this.data.pilotSkill * 2) * -1;
    } else if (this.upgradeType === itemTypes.MISSION) {
        return this.data.missionXp;
    } else if (this.upgradeType === itemTypes.BUY_UPGRADE) {
        var upgrade = this.getUpgradeById(this.data.upgradeId);
        return upgrade.points * -1;
    }
    return 0;
};

XpItem.prototype.label = function () {
    if (this.upgradeType === itemTypes.SHIP_TYPE) {
        var ship = this.getShipById(this.data.shipId);
        return 'Change ship: ' + ship.label;
    } else if (this.upgradeType === itemTypes.STARTING_SHIP_TYPE) {
        var startingShip = this.getShipById(this.data.shipId);
        return 'Starting ship: ' + startingShip.label;
    } else if (this.upgradeType === itemTypes.PILOT_SKILL) {
        return 'Upgrade pilot skill: PS ' + this.data.pilotSkill;
    } else if (this.upgradeType === itemTypes.MISSION) {
        return 'Gain mission XP';
    } else if (this.upgradeType === itemTypes.BUY_UPGRADE) {
        var upgrade = this.getUpgradeById(this.data.upgradeId);
        return upgrade.slot +': ' + upgrade.name;
    }
    return '';
};

XpItem.prototype.getShipById = function (shipId) {
    return _.find(ships, function (shipItem) {
        return shipItem.id === shipId;
    });
};

XpItem.prototype.getUpgradeById = function (upgradeId) {
    return _.find(upgrades, function (upgradeItem) {
        return upgradeItem.id === upgradeId;
    });
};

module.exports = XpItem;

