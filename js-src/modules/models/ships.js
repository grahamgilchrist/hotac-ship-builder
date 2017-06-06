'use strict';

module.exports = [
    {
        id: 'xwing',
        label: 'X-wing',
        starting: true,
        startingXp: 5,
        pilotCardId: 'rookiepilot',
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
