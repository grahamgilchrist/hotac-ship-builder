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
    renderShipUpgrades: function (currentShip, pilotSkill) {
        var $shipUpgrades = $('#ship-info-upgrades');
        $shipUpgrades.empty();

        var $ul = $('<ul>');

        var upgradeSlots = module.exports.getShipUpgrades(currentShip);

        _.each(upgradeSlots, function (upgradeSlot) {
            var upgradeNames = [];
            if (_.isArray(upgradeSlot.type)) {
                upgradeNames = upgradeSlot.type;
            } else if (_.isString(upgradeSlot.type)) {
                upgradeNames.push(upgradeSlot.type);
            }
            var titleStrings = _.map(upgradeNames, function (upgradeName) {
                return module.exports.getIconString(upgradeName) + ' <span>' + upgradeName + '</span>';
            });
            var titleString = titleStrings.join(' / ');
            var $li = $('<li>' + titleString + '</li>');
            if (pilotSkill < upgradeSlot.pilotSkill) {
                $li.addClass('disabled');
                $li.append('<span> (PS ' + upgradeSlot.pilotSkill + ')</span>');
            }
            $ul.append($li);
        });

        $shipUpgrades.append($ul);
    },
    getIconString: function (upgradeSlotType) {
        var iconId = upgradeSlotType.replace(' ', '').replace('-', '');
        iconId = iconId.toLowerCase();
        var iconString = '<i class="xwing-miniatures-font xwing-miniatures-font-' + iconId + '"></i>';
        return iconString;
    },
    getShipUpgrades: function (currentShip) {
        // elite slots are dependent on pilot level

        var usableUpgrades = _.map(currentShip.upgradeSlots, function (upgradeSlot) {
            return {
                type: upgradeSlot.type
            };
        });

        usableUpgrades = usableUpgrades.concat([
            {
                type: 'Title'
            },
            {
                type: 'Modification'
            },
            {
                type: 'Modification',
                pilotSkill: 4
            },
            {
                type: 'Modification',
                pilotSkill: 6
            },
            {
                type: 'Modification',
                pilotSkill: 8
            },
            {
                type: 'Elite',
                pilotSkill: 3
            },
            {
                type: 'Elite',
                pilotSkill: 5
            },
            {
                type: 'Elite',
                pilotSkill: 7
            },
            {
                type: 'Elite',
                pilotSkill: 9
            }
        ]);

        return usableUpgrades;
    }
};
