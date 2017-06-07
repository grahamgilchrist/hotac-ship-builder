'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');
var ships = require('../models/ships');

module.exports = {
    init: function () {
        // bind new button
        $('#new-build').on('click', module.exports.clickResetButton);

        module.exports.renderChangeShipList();
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
    renderChangeShipList: function () {
        // bind ships to DOM
        var $changeShipList = $('#change-ship-list');
        var $noneOption = $('<option value="0">Select a ship...</option>');
        $changeShipList.append($noneOption);

        // Add all ships to list
        _.forEach(ships, function (item) {
            var $newOption = $('<option value="' + item.id + '">' + item.label + '</option>');
            $changeShipList.append($newOption);
        });
    },
    bindChangeShipButton: function () {
        var $changeShipList = $('#change-ship-list');
        $('#change-ship').on('click', function () {
            var chosenItemValue = $changeShipList.val();
            events.trigger('view.main.changeShip', chosenItemValue);
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
