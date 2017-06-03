'use strict';

var _ = require('lodash');
var ships = require('./ships');
var events = require('../controllers/events');
var XpItem = require('./xpItem');
var itemTypes = require('./itemTypes');

// Ship build
var ShipBuild = function (startingShipId) {
    this.startingShip = _.find(ships, function (ship) {
        return ship.id === startingShipId;
    });
    this.shipType = this.startingShip;
    this.setPilotSkill(2);
    this.currentXp = 0;
    this.addXp(this.startingShip.startingXp);
    this.xpHistory = [];
};

ShipBuild.prototype.setPilotSkill = function (ps) {
    this.pilotSkill = ps;
    events.trigger('build.pilotSkill.update', this.pilotSkill);
};

ShipBuild.prototype.addXp = function (xp) {
    this.currentXp += xp;
    events.trigger('build.xp.update', this.currentXp);
};

ShipBuild.prototype.removeXp = function (xp) {
    this.currentXp -= xp;
    events.trigger('build.xp.update', this.currentXp);
};

ShipBuild.prototype.addToHistory = function (type, id) {
    var xpItem = new XpItem(type, id, this.currentXp);
    this.removeXp(xpItem.cost());
    this.xpHistory.push(xpItem);
    events.trigger('build.xpHistory.update', xpItem);
};

ShipBuild.prototype.changeShip = function (shipId) {
    this.addToHistory(itemTypes.SHIP_TYPE, shipId);
};

ShipBuild.prototype.increasePilotSkill = function () {
    this.setPilotSkill(this.pilotSkill + 1);
    this.addToHistory(itemTypes.PILOT_SKILL, this.pilotSkill);
};

ShipBuild.prototype.buyUpgrade = function (upgradeId) {
    this.addToHistory(itemTypes.BUY_UPGRADE, upgradeId);
};

module.exports = ShipBuild;

