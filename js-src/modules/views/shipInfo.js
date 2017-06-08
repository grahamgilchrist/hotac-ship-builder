'use strict';

var $ = require('jquery');
var _ = require('lodash');

module.exports = {
    renderShipInfo: function (currentShip, purchasedUpgrades) {
        module.exports.renderShipStats(currentShip);
        module.exports.renderShipActions(currentShip, purchasedUpgrades);
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
    renderShipActions: function (currentShip, purchasedUpgrades) {
        var $shipActions = $('#ship-info-actions');
        $shipActions.empty();

        // Start with base ship actions
        var actions = _.clone(currentShip.shipData.actions, true);
        // Add any actions from upgrades
        _.each(purchasedUpgrades, function (upgradesOfType) {
            _.each(upgradesOfType, function (upgrade) {
                if (upgrade.grants) {
                    _.each(upgrade.grants, function (grant) {
                        if (grant.type === 'action') {
                            actions.push(grant.name);
                        }
                    });
                }
            });
        });

        _.each(actions, function (action) {
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
