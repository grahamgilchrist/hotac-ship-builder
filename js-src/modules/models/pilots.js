'use strict';

var _ = require('lodash');
var pilots = require('xwing-data/data/pilots');

// key upgrades by type
var rebelPilots = _.filter(pilots, function (pilot) {
    return pilot.faction === 'Rebel Alliance' && pilot.text;
});

module.exports = rebelPilots;
