'use strict';

module.exports = [
    {
        id: 'xwing',
        label: 'X-wing',
        starting: true,
        startingXp: 5,
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
        id: 'hwk',
        label: 'HWK-290',
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
