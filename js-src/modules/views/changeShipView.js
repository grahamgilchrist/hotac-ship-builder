'use strict';

var $ = require('jquery');
var _ = require('lodash');

var modalController = require('../controllers/modals');
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
            modalController.openOptionSelectModal($modalContent, 'Choose ship');
        });
    },
    renderChangeShipModalContent: function (currentShip) {
        var $modalContent = $('<div class="ship-options-list">');
        var $shipList = $('<ul>');

        // filter out current ship from list
        var filteredShips = _.filter(ships, function (ship) {
            return ship.id !== currentShip.id;
        });

        // Add all ships to list
        _.forEach(filteredShips, function (item) {
            var $item = $('<li>');
            var $img = $('<div class="img-wrapper"><img src="/components/xwing-data/images/' + item.pilotCard.image + '" alt="' + item.shipData.name + '"><div>');
            $item.append($img);
            $item.append('<h3>' + item.shipData.name + '</h3>');
            $item.on('click', function () {
                // deselect other list options
                $(this).closest('ul').find('li').removeClass('selected');
                $(this).addClass('selected');
                var $text = $('<span>' + item.shipData.name + ': 5XP</span>');
                var $summaryElement = $('.featherlight .summary');
                $summaryElement.html($text);
                $(this).trigger('select', {
                    selectedUpgradeEvent: 'view.changeShip.changeShip',
                    selectedUpgradeId: item.id
                });
                $(this).closest('.featherlight').find('.modal-footer button').removeAttr('disabled');
            });

            $shipList.append($item);
        });

        $modalContent.append($shipList);

        return $modalContent;
    }
};
