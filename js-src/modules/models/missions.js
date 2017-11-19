'use strict';

var _find = require('lodash/find');

var missions = [
    {
        id: 1,
        name: 'Local Trouble',
        groupName: 'Introductory Mission',
        starting: true
    },
    {
        id: 2,
        name: 'Rescue Rebel Operatives',
        groupName: 'The Refueling Station',
        groupPart: 1,
        starting: true
    },
    {
        id: 3,
        name: 'Disable Sensor Net',
        groupName: 'The Refueling Station',
        groupPart: 2
    },
    {
        id: 4,
        name: 'Capture Refueling Station',
        groupName: 'The Refueling Station',
        groupPart: 3
    },
    {
        id: 5,
        name: 'Tread Softly',
        groupName: 'Minefields',
        groupPart: 1,
        starting: true
    },
    {
        id: 6,
        name: 'Imperial Entanglement',
        groupName: 'Minefields',
        groupPart: 2
    },
    {
        id: 7,
        name: 'Care Package',
        groupName: 'Minefields',
        groupPart: 3
    },
    {
        id: 8,
        name: 'Needle in a Haystack',
        groupName: 'Chasing Phantoms',
        groupPart: 1,
        starting: true
    },
    {
        id: 9,
        name: 'Bait',
        groupName: 'Chasing Phantoms',
        groupPart: 2
    },
    {
        id: 10,
        name: 'Cloak and Dagger',
        groupName: 'Chasing Phantoms',
        groupPart: 3
    },
    {
        id: 11,
        name: 'Revenge',
        groupName: 'Chasing Phantoms',
        groupPart: 4
    },
    {
        id: 12,
        name: 'Capture Officer',
        groupName: 'Capture Officer',
        groupPart: 1,
        starting: true
    },
    {
        id: 13,
        name: 'Nobody Home',
        groupName: 'Capture Officer',
        groupPart: 2
    },
    {
        id: 14,
        name: "Miners' Strike",
        groupName: 'Capture Officer',
        groupPart: 3
    },
    {
        id: 15,
        name: 'Secure Holonet Receiver',
        groupName: 'Defection',
        groupPart: 1,
        starting: true
    },
    {
        id: 16,
        name: 'Defector',
        groupName: 'Defection',
        groupPart: 2
    },
    {
        id: 17,
        name: 'Pride of the Empire',
        groupName: 'Defection',
        groupPart: 3
    }
];

var getById = function (missionId) {
    return _find(missions, function (mission) {
        return mission.id === missionId;
    });
};

module.exports = {
    data: missions,
    getById: getById
};
