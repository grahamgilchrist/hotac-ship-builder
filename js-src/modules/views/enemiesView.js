'use strict';

var $ = require('jquery');
var _ = require('lodash');
var enemies = require('../models/enemies');
var events = require('../controllers/events');

module.exports = {
    renderTable: function (enemyData) {
        var $table = $('#kill-history');
        $table.empty();

        enemies.forEach(function (enemy) {
            var defeatCount = '';
            if (enemy.xws && enemyData && enemyData[enemy.xws]) {
                defeatCount = enemyData[enemy.xws];
            }
            var $row = module.exports.renderTableRow(enemy, defeatCount);
            $table.append($row);
        });
    },
    renderTableRow: function (enemy, defeatCount) {
        var $row = $('<tr>');
        var label = enemy.ship.name;
        if (enemy.ship.xws) {
            // we've got some ship data
            label = '<i class="xwing-miniatures-ship xwing-miniatures-ship-' + enemy.xws + '"></i>';
        }
        $row.append('<td class="label">' + label + '</td>');
        $row.append('<td>' + defeatCount + '</td>');

        var $buttonRow = $('<td>');
        var $plusButton = $('<button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored"><i class="material-icons">add</i></button>');
        var $minusButton = $('<button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored"><i class="material-icons">remove</i></button>');
        $plusButton.on('click', function () {
            module.exports.addEnemy(1, enemy.xws);
        });
        $minusButton.on('click', function () {
            module.exports.addEnemy(-1, enemy.xws);
        });
        $buttonRow.append($plusButton);
        $buttonRow.append($minusButton);
        $row.append($buttonRow);
        return $row;
    },
    addEnemy: function (amount, xws) {
        events.trigger('view.enemies.adjustNumber', {
            xws: xws,
            amount: amount
        });
    }
};
