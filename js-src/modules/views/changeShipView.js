'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');
var ships = require('../models/ships');

module.exports = {
    renderShipView: function (pilotSkill, currentShip) {
        module.exports.toggleButtonDisplay(pilotSkill);
        module.exports.bindChangeShipButton(currentShip);
    },
    toggleButtonDisplay: function (pilotSkill) {
        if (pilotSkill < 4) {
            $('#change-ship').attr('disabled', 'disabled');
            $('#change-ship-tooltip').show();
        } else {
            $('#change-ship').removeAttr('disabled');
            $('#change-ship-tooltip').hide();
        }
    },
    bindChangeShipButton: function (currentShip) {
        $('#change-ship').off('click').on('click', function () {
            var $modalContent = module.exports.renderChangeShipModalContent(currentShip);
            $.featherlight($modalContent);
        });
    },
    renderChangeShipModalContent: function (currentShip) {
        var $modalContent = $('<div class="card-image-list">');
        var $footer = $('<div class="modal-footer">');
        var $summary = $('<div class="summary">');
        var $shipList = $('<ul>');
        var chosenShipId;

        // filter out current ship from list
        var filteredShips = _.filter(ships, function (ship) {
            return ship.id !== currentShip.id;
        });

        // Add all ships to list
        _.forEach(filteredShips, function (item) {
            var $ship = $('<li><img src="/components/xwing-data/images/' + item.pilotCard.image + '" alt="' + item.name + '"></li>');
            $ship.on('click', function () {
                var $text = $('<span>' + item.shipData.name + ': 5XP</span>');
                var $summaryElement = $('.featherlight .summary');
                $summaryElement.html($text);
                chosenShipId = item.id;
                $(this).closest('.featherlight').find('.modal-footer button').removeAttr('disabled');
            });
            $shipList.append($ship);
        });

        var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" disabled>Choose ship</button>');
        $button.on('click', function () {
            events.trigger('view.changeShip.changeShip', chosenShipId);
            $.featherlight.close();
        });

        $footer.append($summary);
        $footer.append($button);
        $modalContent.append($shipList);
        $modalContent.append($footer);

        return $modalContent;
    }
};
