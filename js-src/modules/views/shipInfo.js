'use strict';

var $ = require('jquery');
var _ = require('lodash');
var templateUtils = require('../utils/templates');

module.exports = {
    renderShipStats: function (build) {
        var statValues = build.getStats();
        var modifiedPilotSkill = build.getModifiedPs();

        var $shipStats = $('[view-bind=ship-info-stats]');
        var context = {
            modifiedPilotSkill: modifiedPilotSkill,
            pilotSkill: build.pilotSkill,
            statValues: statValues
        };
        templateUtils.renderToDom('shipinfo/shipstats', $shipStats, context);
    },
    renderShipActions: function (build) {
        var $shipActions = $('[view-bind=ship-info-actions]');
        var actions = build.getActions();
        var context = {
            actions: actions
        };
        templateUtils.renderToDom('shipinfo/shipactions', $shipActions, context);
    },
    renderShipImage: function (currentShip) {
        var $shipImage = $('[view-bind=ship-info-image]');
        var imgUrl = '/components/xwing-data/images/' + currentShip.pilotCard.image;
        $shipImage.attr('src', imgUrl);
    },
    renderShipDial: function (currentShip) {
        var $shipUpgrades = $('[view-bind=ship-info-dial]');
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
