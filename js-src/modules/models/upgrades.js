'use strict';

var _ = require('lodash');
var upgrades = require('../../generated/upgrades');

var getById = function (id) {
    return _.find(upgrades, function (upgrade) {
        return upgrade.id === id;
    });
};

var getByXws = function (xws, excludeId) {
    return _.find(upgrades, function (upgrade) {
        return ((upgrade.xws === xws) && (upgrade.id !== excludeId));
    });
};

// Find all dual cards
upgrades.forEach(function (upgrade) {
    if (upgrade.dualCard) {
        // don't bother trying to match if we have already paired
        return;
    }
    // Dual cards share xws name
    // Attempt to find other cards with same xws
    var matchingCard = getByXws(upgrade.xws, upgrade.id);
    if (matchingCard && matchingCard.id) {
        upgrade.dualCard = matchingCard.id;
        matchingCard.dualCard = upgrade.id;
    }
});

// Returns and array or both upgrade card object for a specified card Id
var getDualCardsById = function (upgradeId) {
    var cards = [];
    var upgrade = getById(upgradeId);
    cards.push(upgrade);
    // Also add second part if a dual card
    if (upgrade.dualCard) {
        var upgrade2 = getById(upgrade.dualCard);
        cards.push(upgrade2);
    }
    return cards;
};

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
    getIconString: getIconString,
    getById: getById,
    getDualCardsById: getDualCardsById
};
