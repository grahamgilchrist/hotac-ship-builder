'use strict';

var _ = require('lodash');
var pilots = require('../../generated/pilots');

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

// key upgrades by type
var rebelPilots = _.filter(sortedPilots, function (pilot) {
    return pilot.faction === 'Rebel Alliance' || pilot.faction === 'Resistance';
});
var pilotsWithAbilities = _.filter(rebelPilots, function (pilot) {
    return pilot.text;
});

module.exports = {
    allRebels: rebelPilots,
    pilotsWithAbilities: pilotsWithAbilities
};
