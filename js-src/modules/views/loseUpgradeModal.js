'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');

module.exports = {
    renderView: function (build) {
        var $modalContent = $('<div>');
        var $form = $('<form>');
        var $select = $('<select id="lose-upgrade-choice">');

        _.each(build.upgrades.purchased, function (upgrade) {
            var $option = $('<option value="up-' + upgrade.id + '">' + upgrade.name + '</option>');
            $select.append($option);
        });
        _.each(build.upgrades.purchasedAbilities, function (pilotCard) {
            var $option = $('<option value="ab-' + pilotCard.id + '">Ability: ' + pilotCard.name + '</option>');
            $select.append($option);
        });

        var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Lose this upgrade</button>');
        $button.on('click', module.exports.submitResults);

        $form.append($select);
        $form.append($button);
        $modalContent.append($form);

        return $modalContent;
    },
    submitResults: function () {
        var chosenValue = $('#lose-upgrade-choice').val();
        var prefix = chosenValue.substr(0, 3);
        var idToLose = parseInt(chosenValue.substr(3), 10);

        if (prefix === 'up-') {
            events.trigger('view.upgrades.lose', idToLose);
        } else {
            events.trigger('view.pilotAbilities.lose', idToLose);
        }
        $.featherlight.close();
    }
};
