'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');
var templateUtils = require('../utils/templates');
var modalController = require('../controllers/modals');

var savedScrollTop = 0;

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

            // Hack to fix scroll bug on iOS 11
            // https://hackernoon.com/how-to-fix-the-ios-11-input-element-in-fixed-modals-bug-aaf66c7ba3f8
            savedScrollTop = $(document).scrollTop();
            $('.container').hide();

            modalController.openTitledModal($modalContent, 'Lose an upgrade', 'lose-upgrade-modal');
        };
        $('[trigger-lose-upgrade]').off('click.loseButton').on('click.loseButton', clickHandler);
    },
    renderView: function (build) {
        var $modalContent = $('<div>');
        var $form = $('<form>');
        var $select = $('<select id="lose-upgrade-choice">');

        _.each(build.upgrades.purchased, function (upgrade) {
            var $option = $('<option value="up-' + upgrade.id + '">' + (upgrade.dualCardName || upgrade.name) + '</option>');
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
    submitResults: function (e) {
        e.preventDefault();

        // Hack to fix scroll bug on iOS 11
        // https://hackernoon.com/how-to-fix-the-ios-11-input-element-in-fixed-modals-bug-aaf66c7ba3f8
        $('.container').show();
        $(document).scrollTop(savedScrollTop);

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
