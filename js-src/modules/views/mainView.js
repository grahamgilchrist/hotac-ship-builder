'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');

module.exports = {
    init: function () {
        // bind new button
        $('#new-build').on('click', module.exports.clickResetButton);

        module.exports.bindXpButton();
    },
    clickResetButton: function () {
        var result = window.confirm('Are you sure you want to start a new ship? The existing build will be lost');
        if (!result) {
            return;
        }

        events.trigger('view.main.reset');
    },
    hide: function () {
        $('.main').removeClass('active');
    },
    show: function () {
        $('.main').addClass('active');
    },
    renderTitle: function (build) {
        $('#title-icon').html('<i class="xwing-miniatures-ship xwing-miniatures-ship-' + build.currentShip.id + '"></i>');
        $('#title-callsign').text(build.callsign);
        $('#title-ship').text(build.currentShip.shipData.name);
        $('#title-player-name').text(build.playerName);
    },
    renderXp: function (xpAmount) {
        $('#xp-current').text(xpAmount);
    },
    bindXpButton: function () {
        $('#add-mission-xp').on('click', function () {

            var $modalContent = $('<div>');
            var $header = $('<h2>Add XP earned from a mission</h2>');
            var $input = $('<div><input type="text" id="mission-xp-amount"></div>');
            var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Add</button>');

            $button.on('click', function () {
                var stringXpAmount = $('#mission-xp-amount').val();
                var xpAmount = parseInt(stringXpAmount, 10);

                if (!_.isNaN(xpAmount)) {
                    events.trigger('view.main.addMissionXp', xpAmount);
                }

                $.featherlight.close();
            });

            $modalContent.append($header);
            $modalContent.append($input);
            $modalContent.append($button);

            $.featherlight($modalContent);
            $('#mission-xp-amount').focus();
        });
    },
    showShipTab: function () {
        var $tabLink = $('.mdl-tabs__tab[href="#current-ship-tab"]');
        $tabLink.get(0).click();
    }
};
