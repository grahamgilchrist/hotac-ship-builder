'use strict';

var XpItem = require('../models/shipBuild/xpItem');
var itemTypes = require('../models/shipBuild/itemTypes');
var Build = require('../models/shipBuild');
var events = require('./events');
var headerView = require('../views/header');
var newView = require('../views/newView');
var mainView = require('../views/mainView');
var shipInfoView = require('../views/shipInfo');
var pilotSkillView = require('../views/pilotSkillView');
var changeShipView = require('../views/changeShipView');
var upgradesView = require('../views/upgradesView');
var xpHistoryView = require('../views/xpHistory');
var enemiesView = require('../views/enemiesView');
var messageView = require('../views/message');
var hashController = require('./urlHash');

var currentBuild;

module.exports = {
    init: function () {
        module.exports.bindNewViewEvents();
        module.exports.bindMainViewEvents();
        module.exports.bindOtherViewEvents();
        module.exports.bindModelEvents();

        headerView.init();
        mainView.init();
        newView.init();

        var urlHash = hashController.get();
        if (urlHash && urlHash.length > 0) {
            // We got a hash in URL, so create a build based on it
            var buildData = hashController.parseExportStringToHistory(urlHash);
            currentBuild = new Build(buildData.xpHistory, buildData.callsign, buildData.playerName, buildData.enemies, buildData.equippedUpgrades, buildData.equippedAbilities);
            mainView.show();
            headerView.showButtons();
        } else {
            // No build provided via URL, so show new build form
            newView.show();
            headerView.hideButtons();
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
            headerView.showButtons();
        });
    },
    bindMainViewEvents: function () {
        events.on('view.main.reset', function () {
            mainView.hide();
            newView.reset();
            newView.show();
            headerView.hideButtons();
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
            currentBuild.buyUpgrade(upgradeId);
            currentBuild.equipUpgrade(upgradeId);
        });

        events.on('view.pilotAbilities.buy', function (event, pilotId) {
            currentBuild.buyPilotAbility(pilotId);
            currentBuild.equipAbility(pilotId);
        });

        events.on('view.changeShip.changeShip', function (event, shipId) {
            currentBuild.changeShip(shipId);
        });

        events.on('view.equip.upgrade', function (event, upgradeId) {
            currentBuild.equipUpgrade(upgradeId);
        });

        events.on('view.unequip.upgrade', function (event, upgradeId) {
            currentBuild.unequipUpgrade(upgradeId);
        });

        events.on('view.xpHistory.revert', function (event, xpItemIndex) {
            // Get the XP items up to the point specified
            var newHistory = [];
            for (var i = 0; i <= xpItemIndex; i++) {
                newHistory.push(currentBuild.xpHistory[i]);
            }
            // trash the existing build and start a new one with the new history
            currentBuild = new Build(newHistory, currentBuild.callsign, currentBuild.playerName);
            mainView.resetTabs();
        });

        events.on('view.enemies.adjustCount', function (event, data) {
            currentBuild.enemyDefeats.adjustCount(data.xws, data.amount);
        });
    },
    bindModelEvents: function () {
        events.on('model.build.ready', function (event, build) {
            mainView.renderTitle(build);
            mainView.renderXp(build.currentXp);
            shipInfoView.renderShipStats(build.currentShip);
            shipInfoView.renderShipActions(build.currentShip, build.upgrades);
            shipInfoView.renderShipImage(build.currentShip);
            shipInfoView.renderShipDial(build.currentShip);
            upgradesView.renderShipSlotsList(build);
            pilotSkillView.renderWithPs(build.pilotSkill, build.currentXp);
            upgradesView.renderUpgradesList(build);
            xpHistoryView.renderTable(build);
            changeShipView.renderShipView(build.pilotSkill, build.currentShip, build.currentXp);
            enemiesView.renderTable(build.enemyDefeats.get());
            messageView.clear();
            var newHash = hashController.generateExportString(build);
            hashController.set(newHash);
        });

        events.on('model.build.currentShip.update', function (event, build) {
            if (build.ready) {
                mainView.renderTitle(build);
                shipInfoView.renderShipStats(build.currentShip);
                shipInfoView.renderShipActions(build.currentShip, build.upgrades);
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
            mainView.renderXp(build.currentXp);
            changeShipView.renderShipView(build.pilotSkill, build.currentShip, build.currentXp);
            pilotSkillView.renderWithPs(build.pilotSkill, build.currentXp);
        });

        events.on('model.build.upgrades.update', function (event, build) {
            if (build.ready) {
                upgradesView.renderUpgradesList(build);
                shipInfoView.renderShipActions(build.currentShip, build.upgrades);
                upgradesView.renderShipSlotsList(build);
            }
        });

        events.on('model.build.equippedUpgrades.update', function (event, build) {
            if (build.ready) {
                upgradesView.renderShipSlotsList(build);
                upgradesView.renderUpgradesList(build);
                var newHash = hashController.generateExportString(build);
                hashController.set(newHash);
            }
        });

        events.on('model.build.pilotAbilities.update', function (event, build) {
            if (build.ready) {
                upgradesView.renderUpgradesList(build);
            }
        });

        events.on('model.build.xpHistory.add', function (event, data) {
            if (data.build.ready) {
                var xpItemIndex = data.build.xpHistory.length - 1;
                xpHistoryView.renderTableRow(data.xpItem, data.build.currentXp, xpItemIndex);
                messageView.renderMessage(data.xpItem, xpItemIndex);
                var newHash = hashController.generateExportString(data.build);
                hashController.set(newHash);
            }
        });

        events.on('model.enemies.change', function (event, enemyDefeats) {
            if (currentBuild.ready) {
                enemiesView.renderTable(enemyDefeats.get());
                var newHash = hashController.generateExportString(currentBuild);
                hashController.set(newHash);
            }
        });
    }
};
