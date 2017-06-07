'use strict';

var _ = require('lodash');

var pilots = require('./pilots').allRebels;
var shipData = require('./shipCards');

var getPilotByXws = function (pilotId) {
    return _.find(pilots, function (pilotCard) {
        return pilotCard.xws === pilotId;
    });
};

var getShipDataById = function (shipId) {
    return _.find(shipData, function (shipData) {
        return shipData.xws === shipId;
    });
};

var hotacShips = [
    {
        id: 'xwing',
        label: 'X-wing',
        starting: true,
        startingXp: 5,
        pilotCardId: 'rookiepilot',
        shipData: getShipDataById('xwing'),
        pilotCard: getPilotByXws('rookiepilot'),
        upgrades: [
            {
                type: 'Astromech'
            },
            {
                type: 'Torpedo'
            }
        ]
    },
    {
        id: 'ywing',
        label: 'Y-wing',
        starting: true,
        startingXp: 8,
        pilotCardId: 'goldsquadronpilot',
        shipData: getShipDataById('ywing'),
        pilotCard: getPilotByXws('goldsquadronpilot'),
        upgrades: [
            {
                type: 'Astromech'
            },
            {
                type: [
                    'Torpedo',
                    'Bomb'
                ]
            },
            {
                type: [
                    'Torpedo',
                    'Bomb'
                ]
            },
            {
                type: 'Turret'
            }
        ]
    },
    {
        id: 'awing',
        label: 'A-wing',
        pilotCardId: 'greensquadronpilot',
        shipData: getShipDataById('awing'),
        pilotCard: getPilotByXws('greensquadronpilot'),
        upgrades: [
            {
                type: 'Elite'
            },
            {
                type: 'Missile'
            }
        ]
    },
    {
        id: 'bwing',
        label: 'B-wing',
        pilotCardId: 'daggersquadronpilot',
        shipData: getShipDataById('bwing'),
        pilotCard: getPilotByXws('daggersquadronpilot'),
        upgrades: [
            {
                type: 'Torpedo'
            },
            {
                type: 'Torpedo'
            },
            {
                type: 'Cannon'
            },
            {
                type: 'System'
            }
        ]
    },
    {
        id: 'hwk290',
        label: 'HWK-290',
        pilotCardId: 'rebeloperative',
        shipData: getShipDataById('hwk290'),
        pilotCard: getPilotByXws('rebeloperative'),
        upgrades: [
            {
                type: 'Turret'
            },
            {
                type: 'Crew'
            }
        ]
    }
];

module.exports = hotacShips;
