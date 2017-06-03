'use strict';

module.exports = [
    {
        id: 'xwing',
        label: 'X-wing',
        starting: true,
        startingXp: 5,
        upgrades: [
            {
                type: 'astro'
            },
            {
                type: 'torp'
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
                type: 'astro'
            },
            {
                type: [
                    'torp',
                    'bomb'
                ]
            },
            {
                type: [
                    'torp',
                    'bomb'
                ]
            },
            {
                type: 'turret'
            }
        ]
    },
    {
        id: 'awing',
        label: 'A-wing',
        upgrades: [
            {
                type: 'ept'
            },
            {
                type: 'missile'
            }
        ]
    },
    {
        id: 'bwing',
        label: 'B-wing',
        upgrades: [
            {
                type: 'torp'
            },
            {
                type: 'torp'
            },
            {
                type: 'cannon'
            },
            {
                type: 'system'
            }
        ]
    },
    {
        id: 'hwk',
        label: 'HWK-290',
        upgrades: [
            {
                type: 'turret'
            },
            {
                type: 'crew'
            }
        ]
    }
];
