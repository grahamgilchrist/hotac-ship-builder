'use strict';

var _ = require('lodash');
var upgrades = require('../../generated/upgrades');

var sortedUpgrades = upgrades.sort(function (a, b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }

    // names must be equal
    return 0;
});

// key upgrades by type
var keyedUpgrades = {};
_.each(sortedUpgrades, function (upgrade) {

    // Remove imperial and scum cards
    if (upgrade.faction === 'Galactic Empire' || upgrade.faction === 'Scum and Villainy') {
        return;
    }

    // Remove huge ship only cards
    if (upgrade.size && upgrade.size.indexOf('huge') >= 0) {
        return;
    }

    // Remove squad leader as not allowed in HOTAC
    if (upgrade.xws === 'squadleader') {
        return;
    }

    // Define points value for Hotac. epts cost double
    upgrade.hotacPoints = upgrade.points;
    if (upgrade.slot === 'Elite') {
        upgrade.hotacPoints = upgrade.points * 2;
    }

    // Extra munitions is a mod in hotac
    if (upgrade.xws === 'extramunitions') {
        upgrade.slot = 'Modification';
    }

    if (!keyedUpgrades[upgrade.slot]) {
        keyedUpgrades[upgrade.slot] = [];
    }
    keyedUpgrades[upgrade.slot].push(upgrade);
});

var getIconString = function (upgradeSlotType) {
    var iconId = upgradeSlotType.replace(' ', '').replace('-', '');
    iconId = iconId.toLowerCase();
    var iconString = '<i class="xwing-miniatures-font xwing-miniatures-font-' + iconId + '"></i>';
    return iconString;
};

module.exports = {
    all: sortedUpgrades,
    keyed: keyedUpgrades,
    getIconString: getIconString
};
