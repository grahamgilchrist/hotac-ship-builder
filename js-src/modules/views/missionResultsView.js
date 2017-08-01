'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');
var missions = require('../models/missions');
var enemies = require('../models/enemies');

module.exports = {
    renderView: function () {
        var $modalContent = $('<div>');
        var $header = $('<h2>Add Mission results</h2>');
        var $form = $('<form>');
        var $input = $('<label for="mission-xp-amount">XP:</label><input type="text" id="mission-xp-amount">');

        var $missionSelect = $('<select id="mission-select">');
        missions.forEach(function (mission) {
            var $option = $('<option vlaue="' + mission.id + '">' + mission.label + '</option>');
            $missionSelect.append($option);
        });

        var $table = $('<table>');
        _.each(enemies, function (enemy) {
            var $row = module.exports.renderTableRow(enemy);
            $table.append($row);
        });

        var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Add</button>');
        $button.on('click', function () {
            var stringXpAmount = $('#mission-xp-amount').val();
            var xpAmount = parseInt(stringXpAmount, 10);

            if (!_.isNaN(xpAmount) && xpAmount > 0) {
                events.trigger('view.main.addMissionXp', xpAmount);
            }

            $.featherlight.close();
        });

        $form.append($missionSelect);
        $form.append($input);
        $form.append($table);
        $form.append($button);
        $modalContent.append($header);
        $modalContent.append($form);

        $('#mission-xp-amount').focus();

        return $modalContent;
    },
    renderTableRow: function (enemy) {
        var $row = $('<tr>');
        var label = enemy.ship.name;
        if (enemy.ship.xws) {
            // we've got some ship data
            label = '<i class="xwing-miniatures-ship xwing-miniatures-ship-' + enemy.xws + '"></i>';
        }
        $row.append('<td class="label">' + label + '</td>');
        $row.append('<td><input type="text" id="number-' + enemy.xws + '"></td>');
        return $row;
    }
};
