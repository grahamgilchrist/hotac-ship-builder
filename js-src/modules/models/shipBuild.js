'use strict';

var _ = require('lodash');
var ships = require('./ships');
var events = require('../controllers/events');
var XpItem = require('./shipBuild/xpItem');
var itemTypes = require('./shipBuild/itemTypes');
var arrayUtils = require('../utils/array-utils');

var EnemyDefeatsModel = require('../models/enemyDefeats');
var UpgradesModel = require('./shipBuild/upgradesModel');
var UpgradesSlotsModel = require('./shipBuild/upgradeSlots');

// Ship build
var ShipBuild = function (xpHistory, callsign, playerName, enemyDefeats, equippedUpgrades, equippedAbilities) {
    this.callsign = callsign;
    this.playerName = playerName;
    this.currentShip = null;
    this.xpHistory = [];
    this.currentXp = 0;

    this.enemyDefeats = new EnemyDefeatsModel(enemyDefeats);

    this.setPilotSkill(2);
    this.processHistory(xpHistory);

    var upgradeIds = this.getUpgradeIdsFromHistory();
    var pilotIds = this.getPilotIdsFromHistory();

    this.upgradeSlots = new UpgradesSlotsModel(this);
    this.upgrades = new UpgradesModel(this, upgradeIds, equippedUpgrades, pilotIds, equippedAbilities);

    this.ready = true;
    events.trigger('model.build.ready', this);
};

ShipBuild.prototype.getPilotIdsFromHistory = function () {
    var pilotIds = [];
    _.each(this.xpHistory, function (xpItem) {
        if (xpItem.upgradeType === itemTypes.BUY_PILOT_ABILITY) {
            pilotIds.push(xpItem.data.pilotId);
        }
        if (xpItem.upgradeType === itemTypes.LOSE_PILOT_ABILITY) {
            arrayUtils.removeFirstMatchingValue(pilotIds, xpItem.data.pilotId);
        }
    });

    return pilotIds;
};

ShipBuild.prototype.getUpgradeIdsFromHistory = function () {
    var upgradeIds = [];
    _.each(this.xpHistory, function (xpItem) {
        if (xpItem.upgradeType === itemTypes.BUY_UPGRADE) {
            upgradeIds.push(xpItem.data.upgradeId);
        }
        if (xpItem.upgradeType === itemTypes.LOSE_UPGRADE) {
            arrayUtils.removeFirstMatchingValue(upgradeIds, xpItem.data.upgradeId);
        }
    });

    return upgradeIds;
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
            thisBuild.addToHistory(itemTypes.BUY_UPGRADE, {
                upgradeId: xpItem.data.upgradeId
            });
        } else if (xpItem.upgradeType === itemTypes.LOSE_UPGRADE) {
            thisBuild.addToHistory(itemTypes.LOSE_UPGRADE, {
                upgradeId: xpItem.data.upgradeId
            });
        } else if (xpItem.upgradeType === itemTypes.MISSION) {
            thisBuild.completeMission(xpItem.data.missionId);
        } else if (xpItem.upgradeType === itemTypes.XP) {
            thisBuild.addMissionXp(xpItem.data.xp);
        } else if (xpItem.upgradeType === itemTypes.BUY_PILOT_ABILITY) {
            thisBuild.addToHistory(itemTypes.BUY_PILOT_ABILITY, {
                pilotId: xpItem.data.pilotId
            });
        } else if (xpItem.upgradeType === itemTypes.LOSE_PILOT_ABILITY) {
            thisBuild.addToHistory(itemTypes.LOSE_PILOT_ABILITY, {
                pilotId: xpItem.data.pilotId
            });
        }
    });
};

ShipBuild.prototype.addXp = function (xp) {
    this.currentXp += xp;
    events.trigger('model.build.xp.update', this);
};

ShipBuild.prototype.setStartingShip = function (shipId) {
    this.currentShip = ships.getById(shipId);
    this.addToHistory(itemTypes.STARTING_SHIP_TYPE, {
        shipId: shipId
    });
    events.trigger('model.build.currentShip.update', this);
};

ShipBuild.prototype.setPilotSkill = function (ps) {
    this.pilotSkill = ps;
};

ShipBuild.prototype.increasePilotSkill = function () {
    var newPilotSkill = this.pilotSkill + 1;
    this.addToHistory(itemTypes.PILOT_SKILL, {
        pilotSkill: newPilotSkill
    });
    this.setPilotSkill(newPilotSkill);
    if (this.ready === true) {
        this.upgradeSlots.reset();
        this.upgrades.refreshUpgradesState();
    }
    events.trigger('model.build.pilotSkill.update', this);
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
    this.currentShip = ships.getById(shipId);
    if (this.ready === true) {
        this.upgradeSlots.reset();
        this.upgrades.refreshUpgradesState();
    }
    events.trigger('model.build.currentShip.update', this);
};

ShipBuild.prototype.addMissionXp = function (xpAmount) {
    this.addToHistory(itemTypes.XP, {
        xp: xpAmount
    });
};

ShipBuild.prototype.completeMission = function (missionId) {
    this.addToHistory(itemTypes.MISSION, {
        missionId: missionId
    });
};

ShipBuild.prototype.exportEquippedUpgradesString = function () {
    var upgradeIds = _.map(this.upgrades.equippedUpgrades, function (item) {
        return item.id;
    });
    return JSON.stringify(upgradeIds);
};

ShipBuild.prototype.exportEquippedAbilitiesString = function () {
    var pilotIds = _.map(this.upgrades.equippedAbilities, function (item) {
        return item.id;
    });
    return JSON.stringify(pilotIds);
};

ShipBuild.prototype.getStats = function () {
    var statValues = {
        attack: this.currentShip.shipData.attack,
        agility: this.currentShip.shipData.agility,
        hull: this.currentShip.shipData.hull,
        shields: this.currentShip.shipData.shields
    };
    // Add nay stats from upgrades
    _.each(this.upgrades.equippedUpgrades, function (upgrade) {
        if (upgrade.grants) {
            _.each(upgrade.grants, function (grant) {
                if (grant.type === 'stats') {
                    statValues[grant.name] += grant.value;
                }
            });
        }
    });
    return statValues;
};

ShipBuild.prototype.getActions = function () {
    // Start with base ship actions
    var actions = _.clone(this.currentShip.shipData.actions, true);
    // Add any actions from upgrades
    _.each(this.upgrades.equippedUpgrades, function (upgrade) {
        if (upgrade.grants) {
            _.each(upgrade.grants, function (grant) {
                if (grant.type === 'action') {
                    actions.push(grant.name);
                }
            });
        }
    });
    actions = _.uniq(actions);

    var slugifiedActions = [];
    _.each(actions, function (action) {
        var slugifiedAction = action.replace(' ', '').replace('-', '');
        slugifiedAction = slugifiedAction.toLowerCase();
        slugifiedActions.push(slugifiedAction);
    });

    return slugifiedActions;
};

// Return Pilot as modified by any upgrades
ShipBuild.prototype.getModifiedPs = function () {
    var modifiedPilotSkill = this.pilotSkill;

    // Add any actions from upgrades
    _.each(this.upgrades.equippedUpgrades, function (upgrade) {
        if (upgrade.grants) {
            _.each(upgrade.grants, function (grant) {
                if (grant.type === 'stats' && grant.name === 'skill') {
                    var psIncrease = grant.value;
                    modifiedPilotSkill += psIncrease;
                }
            });
        }
    });

    return modifiedPilotSkill;
};

module.exports = ShipBuild;

