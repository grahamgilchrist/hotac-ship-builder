'use strict';

var XpItem = require('../models/xpItem');
var itemTypes = require('../models/itemTypes');
var Build = require('../models/shipBuild');
var events = require('./events');
var newView = require('../views/newView');
var mainView = require('../views/mainView');
var shipInfoView = require('../views/shipInfo');
var pilotSkillView = require('../views/pilotSkillView');
var upgradesView = require('../views/upgradesView');
var xpHistoryView = require('../views/xpHistory');
var hashController = require('./urlHash');

var currentBuild;

module.exports = {
    init: function () {
        module.exports.bindNewViewEvents();
        module.exports.bindMainViewEvents();
        module.exports.bindOtherViewEvents();
        module.exports.bindModelEvents();

        mainView.init();
        pilotSkillView.init();
        newView.init();

        var urlHash = hashController.get();
        if (urlHash && urlHash.length > 0) {
            // We got a hash in URL, so create a build based on it
            var buildData = hashController.parseExportStringToHistory(urlHash);
            currentBuild = new Build(buildData.xpHistory, buildData.callsign, buildData.playerName);
            mainView.show();
        } else {
            // No build provided via URL, so show new build form
            newView.show();
        }
    },
    bindNewViewEvents: function () {
        events.on('view.new.start', function (event, data) {
            var startingXpHistory = [
                new XpItem(itemTypes.STARTING_SHIP_TYPE, {
                    shipId: data.shipId
                })
            ];
            currentBuild = new Build(startingXpHistory, data.callsign, data.playerName);
            newView.hide();
            mainView.show();
        });
    },
    bindMainViewEvents: function () {
        events.on('view.main.reset', function () {
            mainView.hide();
            newView.reset();
            newView.show();
            hashController.clear();
        });

        events.on('view.main.changeShip', function (event, shipId) {
            currentBuild.changeShip(shipId);
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
        });

        events.on('view.pilotAbilities.buy', function (event, pilotId) {
            currentBuild.buyPilotAbility(pilotId);
        });
    },
    bindModelEvents: function () {
        events.on('model.build.ready', function (event, build) {
            mainView.renderTitle(build);
            mainView.renderXp(build.currentXp);
            shipInfoView.renderShipInfo(build.currentShip);
            upgradesView.renderUpgradesList(build);
            pilotSkillView.renderWithPs(build.pilotSkill);
            upgradesView.renderUpgradesList(build);
            xpHistoryView.renderTable(build);
        });

        events.on('model.build.currentShip.update', function (event, build) {
            if (build.ready) {
                mainView.renderTitle(build);
                shipInfoView.renderShipInfo(build.currentShip);
                upgradesView.renderUpgradesList(build);
            }
        });

        events.on('model.build.pilotSkill.update', function (event, build) {
            if (build.ready) {
                pilotSkillView.renderWithPs(build.pilotSkill);
                upgradesView.renderUpgradesList(build);
            }
        });

        events.on('model.build.xp.update', function (event, xp) {
            mainView.renderXp(xp);
        });

        events.on('model.build.upgrades.update', function (event, build) {
            if (build.ready) {
                upgradesView.renderUpgradesList(build);
            }
        });

        events.on('model.build.pilotAbilities.update', function (event, build) {
            if (build.ready) {
                upgradesView.renderUpgradesList(build);
            }
        });

        events.on('model.build.xpHistory.add', function (event, data) {
            xpHistoryView.renderTableRow(data.xpItem, data.build.currentXp);
            var newHash = hashController.generateExportString(data.build);
            hashController.set(newHash);
        });
    }
};
