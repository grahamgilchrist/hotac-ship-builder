'use strict';

var $ = require('jquery');
var _filter = require('lodash/filter');
var _forEach = require('lodash/forEach');

var modalController = require('../controllers/modals');
var ships = require('../models/ships');

module.exports = {
    renderShipView: function (pilotSkill, currentShip, currentXp) {
        module.exports.toggleButtonDisplay(pilotSkill, currentXp);
        module.exports.bindChangeShipButton(currentShip, currentXp);
    },
    toggleButtonDisplay: function (pilotSkill, currentXp) {
        var isDisabled = false;
        if (pilotSkill < 4) {
            isDisabled = true;
        }
        if (currentXp < 5) {
            isDisabled = true;
        }

        if (isDisabled) {
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
            modalController.openOptionSelectModal($modalContent, 'Choose ship', 'Change ship');
        });
    },
    renderChangeShipModalContent: function (currentShip, currentXp) {
        var $modalContent = $('<div class="ship-options-list">');
        var $shipList = $('<ul>');

        // filter out current ship from list
        var filteredShips = _filter(ships.data, function (ship) {
            return ship.id !== currentShip.id;
        });

        // Add all ships to list
        _forEach(filteredShips, function (item) {
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
