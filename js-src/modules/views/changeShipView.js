'use strict';

var $ = require('jquery');
var _ = require('lodash');

var modalController = require('../controllers/modals');
var ships = require('../models/ships');

module.exports = {
    renderShipView: function (pilotSkill, currentShip, currentXp) {
        module.exports.toggleButtonDisplay(pilotSkill);
        module.exports.bindChangeShipButton(currentShip, currentXp);
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
    bindChangeShipButton: function (currentShip, currentXp) {
        $('#change-ship').off('click').on('click', function () {
            var $modalContent = module.exports.renderChangeShipModalContent(currentShip, currentXp);
            modalController.openOptionSelectModal($modalContent, 'Choose ship');
        });
    },
    renderChangeShipModalContent: function (currentShip, currentXp) {
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

            var changeShipCost = 5;
            if (currentXp >= changeShipCost) {
                // We have enough XP to buy this item
                $item.on('click', function () {
                    $(this).trigger('select', {
                        selectedUpgradeEvent: 'view.changeShip.changeShip',
                        selectedUpgradeId: item.id,
                        text: item.shipData.name + ': 5XP'
                    });
                });
            } else {
                // not enough XP
                $item.addClass('cannot-afford');
            }

            $shipList.append($item);
        });

        $modalContent.append($shipList);

        return $modalContent;
    }
};
