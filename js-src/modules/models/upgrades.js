'use strict';

var _ = require('lodash');
var upgrades = require('../../generated/upgrades');

var getById = function (id) {
    return _.find(upgrades, function (upgrade) {
        return upgrade.id === id;
    });
};

var dualCards = [
    {
        // Adaptibility
        id1: 232,
        id2: 233
    },
    // Intensity
    {
        id1: 317,
        id2: 318
    },
    // arc caster
    {
        id1: 310,
        id2: 311
    },
    // pivot wing
    {
        id1: 271,
        id2: 272
    }
];

// Link the dual cards using a "dualCard" property
dualCards.forEach(function (dualCard) {
    var upgrade1 = getById(dualCard.id1);
    upgrade1.dualCard = dualCard.id2;
    var upgrade2 = getById(dualCard.id2);
    upgrade2.dualCard = dualCard.id1;
});

var getDualCards = function (upgradeId) {
    var cards = [];
    var upgrade = upgradesImport.getById(upgradeId);
    cards.push(upgrade);
    // Also add second part if a dual card
    if (upgrade.dualCard) {
        var upgrade2 = upgradesImport.getById(upgrade.dualCard);
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
    getDualCards: getDualCards
};
