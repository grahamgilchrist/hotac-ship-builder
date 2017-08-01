'use strict';

var $ = require('jquery');
var enemies = require('../models/enemies');

module.exports = {
    renderTable: function () {
        var $table = $('#kill-history');
        $table.empty();

        enemies.forEach(function (enemy) {
            var $row = module.exports.renderTableRow(enemy);
            $table.append($row);
        });
    },
    renderTableRow: function (enemy) {
        var $row = $('<tr>');
        var label = enemy.ship.name;
        if (enemy.ship.xws) {
            // we've got some ship data
            label = '<i class="xwing-miniatures-ship xwing-miniatures-ship-' + enemy.xws + '"></i>';
        }
        $row.append('<td class="label">' + label + '</td>');
        $row.append('<td>XXX</td>');
        return $row;
    }
};
