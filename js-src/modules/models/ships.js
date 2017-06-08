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
        shipData: getShipDataById('xwing'),
        pilotCard: getPilotByXws('redsquadronpilot'),
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
        shipData: getShipDataById('awing'),
        pilotCard: getPilotByXws('arvelcrynyd'),
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
        shipData: getShipDataById('bwing'),
        pilotCard: getPilotByXws('bluesquadronpilot'),
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
        shipData: getShipDataById('hwk290'),
        pilotCard: getPilotByXws('kylekatarn'),
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
