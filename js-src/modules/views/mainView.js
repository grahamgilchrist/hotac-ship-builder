'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');
var ships = require('../models/ships');

module.exports = {
    init: function () {
        // bind new button
        $('#new-build').on('click', module.exports.clickResetButton);

        module.exports.bindChangeShipButton();
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
    renderTitle: function (currentShip) {
        $('#ship-current').text(currentShip.label).prepend('<i class="xwing-miniatures-ship xwing-miniatures-ship-' + currentShip.id + '"></i>');
    },
    bindChangeShipButton: function () {
        $('#change-ship').on('click', function () {

            var $modalContent = $('<div class="change-ship-list">');
            var $summary = $('<div class="summary">');
            var $shipList = $('<ul>');
            var chosenShipId;
            // Add all ships to list
            _.forEach(ships, function (item) {
                var $ship = $('<li><img src="/components/xwing-data/images/' + item.pilotCard.image + '" alt="' + item.id + '"></li>');
                $ship.on('click', function () {
                    var $text = $('<span>' + item.label + ': 5XP</span>');
                    var $summaryElement = $('.featherlight .change-ship-list .summary');
                    $summaryElement.html($text);
                    chosenShipId = item.id;
                });
                $shipList.append($ship);
            });

            var $button = $('<button>Choose ship</button>');
            $button.on('click', function () {
                events.trigger('view.main.changeShip', chosenShipId);
                $.featherlight.close();
            });

            $modalContent.append($shipList);
            $modalContent.append($summary);
            $modalContent.append($button);

            $.featherlight($modalContent);
        });
    },
    renderXp: function (xpAmount) {
        $('#xp-current').text(xpAmount);
    },
    bindXpButton: function () {
        $('#add-mission-xp').on('click', function () {
            var stringXpAmount = prompt('Add XP earned from a mission');
            var xpAmount = parseInt(stringXpAmount, 10);

            if (!_.isNaN(xpAmount)) {
                events.trigger('view.main.addMissionXp', xpAmount);
            }
        });
    }
};
