'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');
var modalController = require('../controllers/modals');

var savedScrollTop = 0;

module.exports = {
    init: function () {
        module.exports.bindXpButton();
    },
    bindXpButton: function () {
        $('[add-mission-xp]').on('click', function () {

            // Hack to fix scroll bug on iOS 11
            // https://hackernoon.com/how-to-fix-the-ios-11-input-element-in-fixed-modals-bug-aaf66c7ba3f8
            savedScrollTop = $(document).scrollTop();
            $('.container').hide();

            var $modalContent = module.exports.renderView();
            modalController.openTitledModal($modalContent, 'Add Mission results', 'add-xp-modal');
            module.exports.focus();
        });
    },
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
    submitResults: function (e) {
        e.preventDefault();

        // Hack to fix scroll bug on iOS 11
        // https://hackernoon.com/how-to-fix-the-ios-11-input-element-in-fixed-modals-bug-aaf66c7ba3f8
        $('.container').show();
        $(document).scrollTop(savedScrollTop);

        var stringXpAmount = $('#mission-xp-amount').val();
        var xpAmount = parseInt(stringXpAmount, 10);

        if (!_.isNaN(xpAmount) && xpAmount > 0) {
            events.trigger('view.main.addMissionXp', xpAmount);
        }

        $.featherlight.close();
    }
};
