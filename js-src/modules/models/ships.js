'use strict';

var _ = require('lodash');

var pilots = require('./pilots').allRebels;
var shipData = require('./shipCards');
var upgrades = require('./upgrades').all;

var getPilotByXws = function (pilotId) {
    return _.find(pilots, function (pilotCard) {
        return pilotCard.xws === pilotId;
    });
};

var getShipDataById = function (xws) {
    return _.find(shipData, function (shipData) {
        return shipData.xws === xws;
    });
};

var getUpgradeByXws = function (upgradeId) {
    return _.find(upgrades, function (upgrade) {
        return upgrade.xws === upgradeId;
    });
};

var hotacShips = [
    {
        id: 'xwing',
        starting: true,
        startingXp: 5,
        shipData: getShipDataById('xwing'),
        pilotCard: getPilotByXws('redsquadronpilot'),
        upgradeSlots: [
            'Astromech',
            'Torpedo'
        ],
        startingUpgrades: [
            getUpgradeByXws('integratedastromech')
        ]
    },
    {
        id: 'ywing',
        starting: true,
        startingXp: 8,
        shipData: getShipDataById('ywing'),
        pilotCard: getPilotByXws('goldsquadronpilot'),
        upgradeSlots: [
            'Astromech',
            'Torpedo',
            'Torpedo',
            'Turret'
        ],
        startingUpgrades: [
            getUpgradeByXws('btla4ywing')
        ]
    },
    {
        id: 'awing',
        shipData: getShipDataById('awing'),
        pilotCard: getPilotByXws('arvelcrynyd'),
        upgradeSlots: [
            'Missile'
        ],
        startingUpgrades: [
            getUpgradeByXws('awingtestpilot')
        ]
    },
    {
        id: 'bwing',
        shipData: getShipDataById('bwing'),
        pilotCard: getPilotByXws('bluesquadronpilot'),
        upgradeSlots: [
            'Torpedo',
            'Torpedo',
            'Cannon',
            'System'
        ],
        startingUpgrades: [
            getUpgradeByXws('bwinge2')
        ]
    },
    {
        id: 'hwk290',
        shipData: getShipDataById('hwk290'),
        pilotCard: getPilotByXws('kylekatarn'),
        upgradeSlots: [
            'Turret',
            'Crew',
            'Illicit'
        ],
        startingUpgrades: []
    }
];

// var experimentalShips = [
//     {
//         id: 't70xwing',
//         shipData: getShipDataById('t70xwing'),
//         pilotCard: getPilotByXws('redace'),
//         upgradeSlots: [
//             'Astromech',
//             'Torpedo',
//             'Tech'
//         ],
//         startingUpgrades: []
//     },
//     {
//         id: 'z95headhunter',
//         shipData: getShipDataById('z95headhunter'),
//         pilotCard: getPilotByXws('lieutenantblount'),
//         upgradeSlots: [
//             'Missile'
//         ],
//         startingUpgrades: []
//     },
//     {
//         id: 'ewing',
//         shipData: getShipDataById('ewing'),
//         pilotCard: getPilotByXws('blackmoonsquadronpilot'),
//         upgradeSlots: [
//             'Astromech',
//             'Torpedo',
//             'System'
//         ],
//         startingUpgrades: []
//     },
//     {
//         id: 'kwing',
//         shipData: getShipDataById('kwing'),
//         pilotCard: getPilotByXws('wardensquadronpilot'),
//         upgradeSlots: [
//             'Turret',
//             'Torpedo',
//             'Torpedo',
//             'Missile',
//             'Crew',
//             'Bomb',
//             'Bomb'
//         ],
//         startingUpgrades: []
//     },
//     {
//         id: 'attackshuttle',
//         shipData: getShipDataById('attackshuttle'),
//         pilotCard: getPilotByXws('herasyndulla'),
//         upgradeSlots: [
//             'Turret',
//             'Crew'
//         ],
//         startingUpgrades: []
//     },
//     {
//         id: 'arc170',
//         shipData: getShipDataById('arc170'),
//         pilotCard: getPilotByXws('sharabey'),
//         upgradeSlots: [
//             'Torpedo',
//             'Crew',
//             'Astromech'
//         ],
//         startingUpgrades: [
//             getUpgradeByXws('allianceoverhaul')
//         ]
//     }
// ];

module.exports = hotacShips;
