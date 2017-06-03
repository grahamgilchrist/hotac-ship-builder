'use strict';

var _ = require('lodash');
var itemTypes = require('./itemTypes');
var ships = require('./ships');

var XpItem = function (upgradeType, id, currentXp) {
    this.upgradeType = upgradeType;
    this.upgradeId = id;
    this.startingXp = currentXp;
};

XpItem.prototype.cost = function () {
    if (this.upgradeType === itemTypes.SHIP_TYPE) {
        return 5;
    } else if (this.upgradeType === itemTypes.PILOT_SKILL) {
        // pilot skill costs double skill level upgrading to
        return (this.upgradeId * 2);
    }
    return 0;
};

XpItem.prototype.remaining = function () {
    return this.startingXp - this.cost();
};

XpItem.prototype.type = function () {
    if (this.upgradeType === itemTypes.SHIP_TYPE) {
        return 'Change ship';
    } else if (this.upgradeType === itemTypes.PILOT_SKILL) {
        return 'Upgrade pilot skill';
    }
    return '';
};

XpItem.prototype.name = function () {
    var shipId = this.upgradeId;
    if (this.upgradeType === itemTypes.SHIP_TYPE) {
        var ship = _.find(ships, function (shipItem) {
            return shipItem.id === shipId;
        });
        return ship.label;
    } else if (this.upgradeType === itemTypes.PILOT_SKILL) {
        return 'PS ' + this.upgradeId;
    }
    return 0;
};

module.exports = XpItem;

