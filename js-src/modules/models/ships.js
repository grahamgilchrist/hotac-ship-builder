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
        upgradeSlots: [
            {
                type: 'Astromech'
            },
            {
                type: 'Torpedo'
            }
        ],
        startingUpgrades: [
            'integratedastromech'
        ]
    },
    {
        id: 'ywing',
        label: 'Y-wing',
        starting: true,
        startingXp: 8,
        shipData: getShipDataById('ywing'),
        pilotCard: getPilotByXws('goldsquadronpilot'),
        upgradeSlots: [
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
        ],
        startingUpgrades: [
            'btla4'
        ]
    },
    {
        id: 'awing',
        label: 'A-wing',
        shipData: getShipDataById('awing'),
        pilotCard: getPilotByXws('arvelcrynyd'),
        upgradeSlots: [
            {
                type: 'Elite'
            },
            {
                type: 'Missile'
            }
        ],
        startingUpgrades: [
            'awingtestpilot'
        ]
    },
    {
        id: 'bwing',
        label: 'B-wing',
        shipData: getShipDataById('bwing'),
        pilotCard: getPilotByXws('bluesquadronpilot'),
        upgradeSlots: [
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
        ],
        startingUpgrades: [
            'bwinge2'
        ]
    },
    {
        id: 'hwk290',
        label: 'HWK-290',
        shipData: getShipDataById('hwk290'),
        pilotCard: getPilotByXws('kylekatarn'),
        upgradeSlots: [
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
