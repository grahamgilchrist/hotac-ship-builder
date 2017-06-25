'use strict';

var $ = require('jquery');
var _ = require('lodash');

module.exports = {
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
        actions = _.uniq(actions);

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
    },
    renderShipDial: function (currentShip) {
        var $shipUpgrades = $('#ship-info-dial');
        $shipUpgrades.empty();
        var $table = $('<table>');

        var fontIconKey = [
            'turnleft',
            'bankleft',
            'straight',
            'bankright',
            'turnright',
            'kturn',
            'sloopleft',
            'sloopright',
            'trollleft',
            'trollright',
            'reversebankleft',
            'reversestraight',
            'reversebankright'
        ];

        var speedZeroFontIconKey = [
            'turnleft',
            'bankleft',
            'stop',
            'bankright',
            'turnright',
            'kturn',
            'sloopleft',
            'sloopright',
            'trollleft',
            'trollright',
            'reversebankleft',
            'reversestraight',
            'reversebankright'
        ];

        var dialManeuvers = _.reverse(_.clone(currentShip.shipData.maneuvers));
        _.each(dialManeuvers, function (speedManeuvers, speedIndex) {
            var maneuverSpeed = dialManeuvers.length - 1 - speedIndex;
            var $tr = $('<tr>');
            // first row show speed
            var $td = $('<td class="speed">' + maneuverSpeed + '</td>');
            $tr.append($td);

            // don't show speed zero if there are no maneuvers
            var showRow = true;
            var noManeuversAtThisSpeed = _.every(speedManeuvers, function (maneuver) {
                return maneuver === 0;
            });
            if (maneuverSpeed === 0 && noManeuversAtThisSpeed) {
                showRow = false;
            }

            if (showRow) {
                _.each(speedManeuvers, function (maneuver, maneuverIndex) {
                    var maneuverString = '';
                    if (maneuver > 0) {
                        var iconKey;
                        if (maneuverSpeed === 0) {
                            iconKey = speedZeroFontIconKey[maneuverIndex];
                        } else {
                            iconKey = fontIconKey[maneuverIndex];
                        }
                        maneuverString = '<i class="xwing-miniatures-font xwing-miniatures-font-' + iconKey + '"></i>';
                    }
                    var maneuverClass = '';
                    if (maneuver === 2) {
                        maneuverClass = 'green';
                    }
                    if (maneuver === 3) {
                        maneuverClass = 'red';
                    }
                    var $td = $('<td>' + maneuverString + '</td>');
                    if (maneuverString) {
                        $td.addClass('maneuver ' + maneuverClass);
                        $td.on('click', function () {
                            var selectedClass = 'selected';
                            $(this).closest('table').find('td').removeClass(selectedClass);
                            $(this).addClass(selectedClass);
                        });
                    }
                    $tr.append($td);
                });
                $table.append($tr);
            }
        });

        $shipUpgrades.append($table);
    }
};
