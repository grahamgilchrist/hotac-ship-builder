'use strict';

var _ = require('lodash');
var pilots = require('../../generated/pilots');

// key upgrades by type
var rebelPilots = _.filter(pilots, function (pilot) {
    return pilot.faction === 'Rebel Alliance';
});
var pilotsWithAbilities = _.filter(rebelPilots, function (pilot) {
    return pilot.text;
});

module.exports = {
    allRebels: rebelPilots,
    pilotsWithAbilities: pilotsWithAbilities
};
