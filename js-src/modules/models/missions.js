'use strict';

var _ = require('lodash');

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
        name: 'Tread Softly',
        groupName: 'Minefields',
        groupPart: 1,
        starting: true
    },
    {
        id: 7,
        name: 'Imperial Entanglement',
        groupName: 'Minefields',
        groupPart: 2
    },
    {
        id: 8,
        name: 'Care Package',
        groupName: 'Minefields',
        groupPart: 3
    },
    {
        id: 9,
        name: 'Needle in a Haystack',
        groupName: 'Chasing Phantoms',
        groupPart: 1,
        starting: true
    },
    {
        id: 10,
        name: 'Bait',
        groupName: 'Chasing Phantoms',
        groupPart: 2
    },
    {
        id: 11,
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
        id: 11,
        name: 'Capture Officer',
        groupName: 'Capture Officer',
        groupPart: 1,
        starting: true
    },
    {
        id: 11,
        name: 'Nobody Home',
        groupName: 'Capture Officer',
        groupPart: 2
    },
    {
        id: 11,
        name: "Miners' Strike",
        groupName: 'Capture Officer',
        groupPart: 3
    },
    {
        id: 11,
        name: 'Secure Holonet Receiver',
        groupName: 'Defection',
        groupPart: 1,
        starting: true
    },
    {
        id: 11,
        name: 'Defector',
        groupName: 'Defection',
        groupPart: 2
    },
    {
        id: 11,
        name: 'Pride of the Empire',
        groupName: 'Defection',
        groupPart: 3
    }
];

var getById = function (missionId) {
    return _.find(missions, function (mission) {
        return mission.id === missionId;
    });
};


module.exports = {
    data: missions,
    getById: getById
};
