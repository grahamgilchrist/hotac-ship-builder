'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');
var missions = require('../models/missions');

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

        var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Add</button>');
        $button.on('click', module.exports.submitResults);

        $form.append($missionSelect);
        $form.append($input);
        $form.append($button);
        $modalContent.append($header);
        $modalContent.append($form);

        $('#mission-xp-amount').focus();

        return $modalContent;
    },
    submitResults: function () {
        var stringXpAmount = $('#mission-xp-amount').val();
        var xpAmount = parseInt(stringXpAmount, 10);

        var missionId = $('#mission-select').val();

        if (!_.isNaN(xpAmount) && xpAmount > 0) {
            events.trigger('view.main.addMissionResults', {
                xp: xpAmount,
                missionId: missionId
            });
        }

        $.featherlight.close();
    }
};
