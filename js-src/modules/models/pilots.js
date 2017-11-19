'use strict';

var _clone = require('lodash/clone');
var _find = require('lodash/find');
var _filter = require('lodash/filter');
var _uniqBy = require('lodash/uniqBy');

var pilots = require('../../generated/pilots');
var shipsData = require('../../generated/ships');

// Sorts a list of pilots by skill then name
var pilotSort = function (pilotList) {
    var newList = _clone(pilotList);
    var sortedList = newList.sort(function (a, b) {
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

    return sortedList;
};

var sortedPilots = pilotSort(pilots);

var getShipDataByName = function (shipName) {
    return _find(shipsData, function (shipData) {
        return shipData.name === shipName;
    });
};

// TODO: filter out pilots from large ships

// Filter to only include rebel pilots
var rebelPilots = _filter(sortedPilots, function (pilot) {
    return pilot.faction === 'Rebel Alliance' || pilot.faction === 'Resistance';
});
// filter to only include pilots with abilities (e.g. get rid of generics)
var pilotsWithAbilities = _filter(rebelPilots, function (pilot) {
    return pilot.text;
});
// filter to rmeove pilots for huge ships
var nonHugePilots = _filter(pilotsWithAbilities, function (pilot) {
    var shipName = pilot.ship;
    var matchingShip = getShipDataByName(shipName);
    if (matchingShip.size === 'huge') {
        return false;
    }
    return true;
});

var getPilotById = function (pilotId) {
    return _find(pilots, function (pilotCard) {
        return pilotCard.id === pilotId;
    });
};

var uniquePilots = _uniqBy(nonHugePilots, function (pilot) {
    return pilot.text;
});

// key upgrades by type
module.exports = {
    allRebels: rebelPilots,
    withAbilities: nonHugePilots,
    unique: uniquePilots,
    getById: getPilotById,
    sortList: pilotSort
};
