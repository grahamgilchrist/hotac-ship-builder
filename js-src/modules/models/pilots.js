'use strict';

var _ = require('lodash');
var pilots = require('../../generated/pilots');
var shipsData = require('../../generated/ships');

var getShipDataByName = function (shipName) {
    return _.find(shipsData, function (shipData) {
        return shipData.name === shipName;
    });
};

var sortedPilots = pilots.sort(function (a, b) {
    if (a.skill < b.skill) {
        return -1;
    }
    if (a.skill > b.skill) {
        return 1;
    }

    // skills must be equal
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    // skills and names must be equal
    return 0;
});

// TODO: filter out pilots from large ships

// Filter to only include rebel pilots
var rebelPilots = _.filter(sortedPilots, function (pilot) {
    return pilot.faction === 'Rebel Alliance' || pilot.faction === 'Resistance';
});
// filter to only include pilots with abilities (e.g. get rid of generics)
var pilotsWithAbilities = _.filter(rebelPilots, function (pilot) {
    return pilot.text;
});
// filter to rmeove pilots for huge ships
var nonHugePilots = _.filter(pilotsWithAbilities, function (pilot) {
    var shipName = pilot.ship;
    var matchingShip = getShipDataByName(shipName);
    if (matchingShip.size === 'huge') {
        return false;
    }
    return true;
});

// key upgrades by type
module.exports = {
    allRebels: rebelPilots,
    pilotsWithAbilities: nonHugePilots
};
