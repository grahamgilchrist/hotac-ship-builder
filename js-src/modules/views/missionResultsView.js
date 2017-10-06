'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');

module.exports = {
    renderView: function () {
        var $modalContent = $('<div>');
        var $form = $('<form>');
        var $input = $('<label for="mission-xp-amount">XP:</label><input type="number" id="mission-xp-amount">');

        var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Add</button>');
        $button.on('click', module.exports.submitResults);

        $form.append($input);
        $form.append($button);
        $modalContent.append($form);

        return $modalContent;
    },
    focus: function () {
        $('#mission-xp-amount').focus();
    },
    submitResults: function () {
        var stringXpAmount = $('#mission-xp-amount').val();
        var xpAmount = parseInt(stringXpAmount, 10);

        if (!_.isNaN(xpAmount) && xpAmount > 0) {
            events.trigger('view.main.addMissionXp', xpAmount);
        }

        $.featherlight.close();
    }
};
