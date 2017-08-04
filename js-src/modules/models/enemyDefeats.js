'use strict';

var _ = require('lodash');
var events = require('../controllers/events');
var enemies = require('../models/enemies');

// Ship build
var enemyDefeats = function (startingValues) {
    this.enemyDefeats = startingValues || {};
};

enemyDefeats.prototype.get = function () {
    return this.enemyDefeats;
};

enemyDefeats.prototype.adjustCount = function (enemyShipXws, amount) {
    var existingNumber = this.enemyDefeats[enemyShipXws] || 0;
    var newCount = existingNumber + amount;
    if (newCount > 0) {
        this.enemyDefeats[enemyShipXws] = newCount;
    } else {
        delete this.enemyDefeats[enemyShipXws];
    }
    events.trigger('model.enemies.change', this);
};

enemyDefeats.prototype.exportString = function () {
    var exportValues = [];
    _.forEach(this.enemyDefeats, function (count, xws) {
        var enemyShip = _.find(enemies, {
            xws: xws
        });
        var exportValue = enemyShip.id + '=' + count;
        exportValues.push(exportValue);
    });
    var exportString = exportValues.join(':');
    return exportString;
};

enemyDefeats.prototype.parseUrlString = function (string) {
    var enemiesDefeated = {};

    if (string) {
        var itemValues = string.split(':');

        itemValues.forEach(function (itemString) {
            var splitParts = itemString.split('=');
            var shipId = parseInt(splitParts[0], 10);
            var count = parseInt(splitParts[1], 10);
            var enemyModel = _.find(enemies, {
                id: shipId
            });
            if (enemyModel.xws && count) {
                enemiesDefeated[enemyModel.xws] = count;
            }
        });

    }

    this.enemyDefeats = enemiesDefeated;
};

module.exports = enemyDefeats;

