'use strict';

var _ = require('lodash');
var pilots = require('../../generated/pilots');

var sortedPilots = pilots.sort(function (a, b) {
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
var rebelPilots = _.filter(sortedPilots, function (pilot) {
    return pilot.faction === 'Rebel Alliance';
});
var pilotsWithAbilities = _.filter(rebelPilots, function (pilot) {
    return pilot.text;
});

module.exports = {
    allRebels: rebelPilots,
    pilotsWithAbilities: pilotsWithAbilities
};
