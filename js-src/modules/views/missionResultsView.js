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
            var $option = $('<option value="' + mission.id + '">' + mission.label + '</option>');
            $missionSelect.append($option);
        });

        var $table = $('<table id="mission-enemies">');
        _.each(enemies, function (enemy) {
            var $row = module.exports.renderTableRow(enemy);
            $table.append($row);
        });

        var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Add</button>');
        $button.on('click', module.exports.submitResults);

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
        $row.append('<td><input type="text" xws="' + enemy.xws + '"></td>');
        return $row;
    },
    submitResults: function () {
        var stringXpAmount = $('#mission-xp-amount').val();
        var xpAmount = parseInt(stringXpAmount, 10);

        var missionId = $('#mission-select').val();

        var enemies = {};
        $('#mission-enemies tr input').each(function () {
            var stringNumberDefeated = $(this).val();
            var numberDefeated = parseInt(stringNumberDefeated, 10);
            if (numberDefeated) {
                var xws = $(this).attr('xws');
                enemies[xws] = numberDefeated;
            }
        });

        if (!_.isNaN(xpAmount) && xpAmount > 0) {
            events.trigger('view.main.addMissionResults', {
                xp: xpAmount,
                missionId: missionId,
                enemies: enemies
            });
        }

        $.featherlight.close();
    }
};
