'use strict';

var $ = require('jquery');
var _ = require('lodash');

module.exports = {
    renderShipInfo: function (currentShip) {
        module.exports.renderShipStats(currentShip);
        module.exports.renderShipActions(currentShip);
        module.exports.renderShipImage(currentShip);
    },
    renderShipStats: function (currentShip) {
        var $shipStats = $('#ship-info-stats');
        $shipStats.empty();
        $shipStats.append('<span class="attack"><i class="xwing-miniatures-font xwing-miniatures-font-attack"></i> ' + currentShip.shipData.attack + '</span>');
        $shipStats.append('<span class="agility"><i class="xwing-miniatures-font xwing-miniatures-font-agility"></i> ' + currentShip.shipData.agility + '</span>');
        $shipStats.append('<span class="hull"><i class="xwing-miniatures-font xwing-miniatures-font-hull"></i> ' + currentShip.shipData.hull + '</span>');
        $shipStats.append('<span class="shield"><i class="xwing-miniatures-font xwing-miniatures-font-shield"></i> ' + currentShip.shipData.shields + '</span>');
    },
    renderShipActions: function (currentShip) {
        var $shipActions = $('#ship-info-actions');
        $shipActions.empty();
        _.each(currentShip.shipData.actions, function (action) {
            var actionString = action.replace(' ', '').replace('-', '');
            actionString = actionString.toLowerCase();
            $shipActions.append('<i class="xwing-miniatures-font xwing-miniatures-font-' + actionString + '"></i>');
        });
    },
    renderShipImage: function (currentShip) {
        var $shipImage = $('#ship-info-image');
        var imgUrl = '/components/xwing-data/images/' + currentShip.pilotCard.image;
        $shipImage.attr('src', imgUrl);
    }
};
