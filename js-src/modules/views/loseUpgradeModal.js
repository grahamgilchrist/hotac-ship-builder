'use strict';

var $ = require('jquery');
var _each = require('lodash/each');

var events = require('../controllers/events');
var templateUtils = require('../utils/templates');
var modalController = require('../controllers/modals');

module.exports = {
    renderLoseButton: function (build) {
        var $wrapperElement = $('[view-bind=lose-upgrade-button]');

        var hasPurchased = (build.upgrades.purchased.length > 0 || build.upgrades.purchasedAbilities.length > 0);
        var context = {
            hasPurchased: hasPurchased
        };
        templateUtils.renderToDom('upgrades/lose-upgrade-button', $wrapperElement, context);

        var clickHandler = function () {
            var $modalContent = module.exports.renderView(build);
            modalController.openTitledModal($modalContent, 'Lose an upgrade', 'lose-upgrade-modal');
        };
        $('[trigger-lose-upgrade]').off('click.loseButton').on('click.loseButton', clickHandler);
    },
    renderView: function (build) {
        var $modalContent = $('<div>');
        var $form = $('<form>');
        var $select = $('<select id="lose-upgrade-choice">');

        _each(build.upgrades.purchased, function (upgrade) {
            var $option = $('<option value="up-' + upgrade.id + '">' + (upgrade.dualCardName || upgrade.name) + '</option>');
            $select.append($option);
        });
        _each(build.upgrades.purchasedAbilities, function (pilotCard) {
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
    submitResults: function (e) {
        e.preventDefault();

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
