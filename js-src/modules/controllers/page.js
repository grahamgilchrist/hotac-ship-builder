'use strict';

var XpItem = require('../models/shipBuild/xpItem');
var itemTypes = require('../models/shipBuild/itemTypes');
var Build = require('../models/shipBuild');
var events = require('./events');
var headerView = require('../views/header');
var newView = require('../views/newView');
var mainView = require('../views/mainView');
var XpView = require('../views/XpView');
var shipInfoView = require('../views/shipInfo');
var pilotSkillView = require('../views/pilotSkillView');
var changeShipView = require('../views/changeShipView');
var upgradesView = require('../views/upgradesView');
var xpHistoryView = require('../views/xpHistory');
var enemiesView = require('../views/enemiesView');
var messageView = require('../views/message');
var summaryView = require('../views/summary');
var hashController = require('./urlHash');

var currentBuild;

module.exports = {
    init: function () {
        module.exports.bindNewViewEvents();
        module.exports.bindMainViewEvents();
        module.exports.bindOtherViewEvents();
        module.exports.bindModelEvents();

        headerView.init();
        XpView.init();
        newView.init();

        var urlHash = hashController.get();
        if (urlHash && urlHash.length > 0) {
            // We got a hash in URL, so create a build based on it
            var promise = hashController.parseExportStringToHistory(urlHash);
            promise.then(function (buildData) {
                currentBuild = new Build(buildData.xpHistory, buildData.callsign, buildData.playerName, buildData.enemies, buildData.equippedUpgrades, buildData.equippedAbilities);
                mainView.show();
                headerView.setMainState();
            });
        } else {
            // No build provided via URL, so show new build form
            newView.show();
            headerView.setNewState();
        }
    },
    bindNewViewEvents: function () {
        events.on('view.new.start', function (event, data) {
            var startingXpHistory = [
                new XpItem(itemTypes.STARTING_SHIP_TYPE, {
                    shipId: data.shipId
                })
            ];
            currentBuild = new Build(startingXpHistory, data.callsign, data.playerName, {});
            newView.hide();
            mainView.show();
            headerView.setMainState();
        });
    },
    bindMainViewEvents: function () {
        events.on('view.main.reset', function () {
            mainView.hide();
            newView.reset();
            newView.show();
            headerView.setNewState();
            hashController.clear();
        });

        events.on('view.main.increasePs', function () {
            currentBuild.increasePilotSkill();
        });

        events.on('view.main.addMissionXp', function (event, xpAmount) {
            currentBuild.addMissionXp(xpAmount);
        });
    },
    bindOtherViewEvents: function () {
        events.on('view.upgrades.buy', function (event, upgradeId) {
            currentBuild.addToHistory(itemTypes.BUY_UPGRADE, {
                upgradeId: upgradeId
            });
            currentBuild.upgrades.buyCard(upgradeId);
            currentBuild.upgrades.equip(upgradeId);
        });

        events.on('view.pilotAbilities.buy', function (event, pilotId) {
            currentBuild.addToHistory(itemTypes.BUY_PILOT_ABILITY, {
                pilotId: pilotId
            });
            currentBuild.upgrades.buyPilotAbility(pilotId);
            currentBuild.upgrades.equipAbility(pilotId);
        });

        events.on('view.upgrades.lose', function (event, upgradeId) {
            currentBuild.addToHistory(itemTypes.LOSE_UPGRADE, {
                upgradeId: upgradeId
            });
            currentBuild.upgrades.loseCard(upgradeId);
        });

        events.on('view.pilotAbilities.lose', function (event, pilotId) {
            currentBuild.addToHistory(itemTypes.LOSE_PILOT_ABILITY, {
                pilotId: pilotId
            });
            currentBuild.upgrades.loseAbility(pilotId);
        });

        events.on('view.changeShip.changeShip', function (event, shipId) {
            currentBuild.changeShip(shipId);
        });

        events.on('view.upgrades.equipUpgrade', function (event, upgradeId) {
            currentBuild.upgrades.equip(upgradeId);
        });

        events.on('view.upgrades.equipAbility', function (event, pilotId) {
            currentBuild.upgrades.equipAbility(pilotId);
        });

        events.on('view.upgrades.unequipUpgrade', function (event, upgradeId) {
            currentBuild.upgrades.unequipUpgrade(upgradeId);
        });

        events.on('view.upgrades.unequipAbility', function (event, pilotId) {
            currentBuild.upgrades.unequipAbility(pilotId);
        });

        events.on('view.xpHistory.revert', function (event, xpItemIndex) {
            // Get the XP items up to the point specified
            var newHistory = [];
            for (var i = 0; i <= xpItemIndex; i++) {
                newHistory.push(currentBuild.xpHistory[i]);
            }
            // trash the existing build and start a new one with the new history
            currentBuild = new Build(newHistory, currentBuild.callsign, currentBuild.playerName);
        });

        events.on('view.enemies.adjustCount', function (event, data) {
            currentBuild.enemyDefeats.adjustCount(data.xws, data.amount);
        });
    },
    bindModelEvents: function () {
        events.on('model.build.ready', function (event, build) {
            mainView.renderTitle(build);
            XpView.renderXp(build.currentXp);
            shipInfoView.renderShipStats(build);
            shipInfoView.renderShipActions(build);
            shipInfoView.renderShipImage(build.currentShip);
            shipInfoView.renderShipDial(build.currentShip);
            upgradesView.renderShipSlotsList(build);
            pilotSkillView.renderWithPs(build.pilotSkill, build.currentXp);
            upgradesView.renderUpgradesList(build);
            upgradesView.renderLoseButton(build);
            xpHistoryView.renderTable(build);
            changeShipView.renderShipView(build.pilotSkill, build.currentShip, build.currentXp);
            enemiesView.renderTable(build.enemyDefeats.get());
            messageView.clear();
            summaryView.renderEquippedUpgrades(build);
            hashController.generateAndSet(build);
        });

        events.on('model.build.currentShip.update', function (event, build) {
            if (build.ready) {
                mainView.renderTitle(build);
                shipInfoView.renderShipStats(build);
                shipInfoView.renderShipActions(build);
                shipInfoView.renderShipImage(build.currentShip);
                shipInfoView.renderShipDial(build.currentShip);
                upgradesView.renderShipSlotsList(build);
                upgradesView.renderUpgradesList(build);
                changeShipView.renderShipView(build.pilotSkill, build.currentShip, build.currentXp);
            }
        });

        events.on('model.build.pilotSkill.update', function (event, build) {
            if (build.ready) {
                pilotSkillView.renderWithPs(build.pilotSkill, build.currentXp);
                upgradesView.renderUpgradesList(build);
                changeShipView.renderShipView(build.pilotSkill, build.currentShip, build.currentXp);
                upgradesView.renderShipSlotsList(build);
            }
        });

        events.on('model.build.xp.update', function (event, build) {
            XpView.renderXp(build.currentXp);
            changeShipView.renderShipView(build.pilotSkill, build.currentShip, build.currentXp);
            pilotSkillView.renderWithPs(build.pilotSkill, build.currentXp);
        });

        events.on('model.build.equippedUpgrades.update model.build.upgrades.lose model.build.pilotAbilities.lose', function (event, build) {
            if (build.ready) {
                upgradesView.renderShipSlotsList(build);
                upgradesView.renderUpgradesList(build);
                shipInfoView.renderShipActions(build);
                shipInfoView.renderShipStats(build);
                summaryView.renderEquippedUpgrades(build);
                hashController.generateAndSet(build);
            }
        });

        events.on('model.build.xpHistory.add', function (event, data) {
            if (data.build.ready) {
                var xpItemIndex = data.build.xpHistory.length - 1;
                xpHistoryView.renderTable(data.build);
                messageView.renderMessage(data.xpItem, xpItemIndex);
                hashController.generateAndSet(data.build);
            }
        });

        events.on('model.enemies.change', function (event, enemyDefeats) {
            if (currentBuild.ready) {
                enemiesView.renderTable(enemyDefeats.get());
                hashController.generateAndSet(currentBuild);
            }
        });
    }
};
