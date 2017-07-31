'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');
var mainTabs = require('./mainTabs');

module.exports = {
    init: function () {
        mainTabs.init();
        module.exports.bindXpButton();
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
            var $form = $('<form>');
            var $input = $('<input type="text" id="mission-xp-amount">');
            var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Add</button>');

            $button.on('click', function () {
                var stringXpAmount = $('#mission-xp-amount').val();
                var xpAmount = parseInt(stringXpAmount, 10);

                if (!_.isNaN(xpAmount) && xpAmount > 0) {
                    events.trigger('view.main.addMissionXp', xpAmount);
                }

                $.featherlight.close();
            });

            $form.append($input);
            $form.append($button);
            $modalContent.append($header);
            $modalContent.append($form);

            var featherlightConfig = {
                variant: 'add-xp'
            };

            $.featherlight($modalContent, featherlightConfig);
            $('#mission-xp-amount').focus();
        });
    },
    resetTabs: function () {
        mainTabs.showShipTab();
    }
};
