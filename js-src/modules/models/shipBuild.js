'use strict';

var _ = require('lodash');
var ships = require('./ships');
var events = require('../controllers/events');
var XpItem = require('./shipBuild/xpItem');
var itemTypes = require('./shipBuild/itemTypes');
var upgrades = require('../models/upgrades').all;
var pilots = require('../models/pilots').allRebels;
var EnemyDefeatsModel = require('../models/enemyDefeats');

// Ship build
var ShipBuild = function (xpHistory, callsign, playerName, enemyDefeats, equippedUpgrades, equippedAbilities) {
    this.callsign = callsign;
    this.playerName = playerName;
    this.currentShip = null;
    this.xpHistory = [];
    this.currentXp = 0;
    this.pilotAbilities = [];
    this.upgrades = {};
    this.enemyDefeats = new EnemyDefeatsModel(enemyDefeats);

    this.setPilotSkill(2);
    this.processHistory(xpHistory);
    this.processEquippedItems(equippedUpgrades, equippedAbilities);
    this.ready = true;

    events.trigger('model.build.ready', this);
};

ShipBuild.prototype.processEquippedItems = function (equippedUpgrades, equippedAbilities) {
    var thisBuild = this;

    this.equippedUpgrades = {
        upgrades: [],
        pilotAbilities: []
    };

    this.equippedUpgrades.upgrades = _.map(equippedUpgrades, function (upgradeId) {
        return thisBuild.getUpgradeById(upgradeId);
    });
    this.equippedUpgrades.pilotAbilities = _.map(equippedAbilities, function (pilotId) {
        return thisBuild.getPilotById(pilotId);
    });
};

ShipBuild.prototype.processHistory = function (xpHistory) {
    var thisBuild = this;

    _.each(xpHistory, function (xpItem) {
        if (xpItem.upgradeType === itemTypes.STARTING_SHIP_TYPE) {
            thisBuild.setStartingShip(xpItem.data.shipId);
        } else if (xpItem.upgradeType === itemTypes.SHIP_TYPE) {
            thisBuild.changeShip(xpItem.data.shipId);
        } else if (xpItem.upgradeType === itemTypes.PILOT_SKILL) {
            thisBuild.increasePilotSkill();
        } else if (xpItem.upgradeType === itemTypes.BUY_UPGRADE) {
            thisBuild.buyUpgrade(xpItem.data.upgradeId);
        } else if (xpItem.upgradeType === itemTypes.MISSION) {
            thisBuild.addMissionXp(xpItem.data.missionXp);
        } else if (xpItem.upgradeType === itemTypes.BUY_PILOT_ABILITY) {
            thisBuild.buyPilotAbility(xpItem.data.pilotId);
        }
    });
};

ShipBuild.prototype.getShipById = function (shipId) {
    var hotacShipModel = _.find(ships, function (ship) {
        return ship.id === shipId;
    });
    var newModel = _.clone(hotacShipModel, true);
    return newModel;
};

ShipBuild.prototype.getUpgradeById = function (upgradeId) {
    return _.find(upgrades, function (upgradeItem) {
        return upgradeItem.id === upgradeId;
    });
};

ShipBuild.prototype.getPilotById = function (pilotId) {
    return _.find(pilots, function (pilotCard) {
        return pilotCard.id === pilotId;
    });
};

ShipBuild.prototype.addXp = function (xp) {
    this.currentXp += xp;
    events.trigger('model.build.xp.update', this);
};

ShipBuild.prototype.setStartingShip = function (shipId) {
    this.currentShip = this.getShipById(shipId);
    this.addToHistory(itemTypes.STARTING_SHIP_TYPE, {
        shipId: shipId
    });
    events.trigger('model.build.currentShip.update', this);
};

ShipBuild.prototype.setPilotSkill = function (ps) {
    this.pilotSkill = ps;
    events.trigger('model.build.pilotSkill.update', this);
};

ShipBuild.prototype.increasePilotSkill = function () {
    this.setPilotSkill(this.pilotSkill + 1);
    this.addToHistory(itemTypes.PILOT_SKILL, {
        pilotSkill: this.pilotSkill
    });
};

ShipBuild.prototype.addToHistory = function (type, data) {
    var xpItem = new XpItem(type, data);
    this.addXp(xpItem.cost());
    this.xpHistory.push(xpItem);
    events.trigger('model.build.xpHistory.add', {
        build: this,
        xpItem: xpItem
    });
};

ShipBuild.prototype.changeShip = function (shipId) {
    this.addToHistory(itemTypes.SHIP_TYPE, {
        shipId: shipId
    });
    this.currentShip = this.getShipById(shipId);
    events.trigger('model.build.currentShip.update', this);
};

ShipBuild.prototype.addMissionXp = function (xpAmount) {
    this.addToHistory(itemTypes.MISSION, {
        missionXp: xpAmount
    });
};

ShipBuild.prototype.buyUpgrade = function (upgradeId) {
    this.addToHistory(itemTypes.BUY_UPGRADE, {
        upgradeId: upgradeId
    });
    var upgrade = this.getUpgradeById(upgradeId);
    if (!this.upgrades[upgrade.slot]) {
        this.upgrades[upgrade.slot] = [];
    }
    this.upgrades[upgrade.slot].push(upgrade);
    events.trigger('model.build.upgrades.update', this);
};

ShipBuild.prototype.buyPilotAbility = function (pilotId) {
    this.addToHistory(itemTypes.BUY_PILOT_ABILITY, {
        pilotId: pilotId
    });
    var pilot = this.getPilotById(pilotId);
    this.pilotAbilities.push(pilot);
    events.trigger('model.build.pilotAbilities.update', this);
};

ShipBuild.prototype.equipUpgrade = function (upgradeId) {
    // TODO: check if upgrade allowed on ship
    var upgrade = this.getUpgradeById(upgradeId);
    this.equippedUpgrades.upgrades.push(upgrade);
    events.trigger('model.build.equippedUpgrades.update', this);
};

ShipBuild.prototype.equipAbility = function (pilotId) {
    // TODO: check if ability allowed on ship
    var pilot = this.getPilotById(pilotId);
    this.equippedUpgrades.pilotAbilities.push(pilot);
    events.trigger('model.build.equippedUpgrades.update', this);
};

ShipBuild.prototype.unequipUpgrade = function (upgradeId) {
    // TODO: check if upgrade allowed on ship
    _.remove(this.equippedUpgrades.upgrades, function (item) {
        return item.id === upgradeId;
    });
    events.trigger('model.build.equippedUpgrades.update', this);
};

ShipBuild.prototype.exportEquippedUpgradesString = function () {
    var upgradeIds = _.map(this.equippedUpgrades.upgrades, function (item) {
        return item.id;
    });
    return JSON.stringify(upgradeIds);
};

ShipBuild.prototype.exportEquippedAbilitiesString = function () {
    var pilotIds = _.map(this.equippedUpgrades.pilotAbilities, function (item) {
        return item.id;
    });
    return JSON.stringify(pilotIds);
};

module.exports = ShipBuild;

