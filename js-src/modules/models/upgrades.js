'use strict';

var _ = require('lodash');
var upgrades = require('xwing-data/data/upgrades');

// key upgrades by type
var keyedUpgrades = {};
_.each(upgrades, function (upgrade) {

	if (upgrade.faction === 'Galactic Empire' || upgrade.faction === 'Scum and Villainy') {
		return;
	}

    if (!keyedUpgrades[upgrade.slot]) {
        keyedUpgrades[upgrade.slot] = [];
    }
    keyedUpgrades[upgrade.slot].push(upgrade);
});

module.exports = {
    all: upgrades,
    keyed: keyedUpgrades
};
