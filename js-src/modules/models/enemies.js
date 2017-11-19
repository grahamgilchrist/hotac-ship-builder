'use strict';

var _find = require('lodash/find');
var shipData = require('./shipCards');

var getShipDataById = function (xws) {
    return _find(shipData, function (shipData) {
        return shipData.xws === xws;
    });
};

var enemies = [
    {
        id: 0,
        xws: 'tiefighter',
        ship: getShipDataById('tiefighter')
    },
    {
        id: 1,
        xws: 'tieinterceptor',
        ship: getShipDataById('tieinterceptor')
    },
    {
        id: 2,
        xws: 'tieadvanced',
        ship: getShipDataById('tieadvanced')
    },
    {
        id: 3,
        xws: 'tiebomber',
        ship: getShipDataById('tiebomber')
    },
    {
        id: 4,
        xws: 'tiedefender',
        ship: getShipDataById('tiedefender')
    },
    {
        id: 5,
        xws: 'tiephantom',
        ship: getShipDataById('tiephantom')
    },
    {
        id: 6,
        xws: 'lambdaclassshuttle',
        ship: getShipDataById('lambdaclassshuttle')
    },
    {
        id: 7,
        xws: 'vt49decimator',
        ship: getShipDataById('vt49decimator')
    },
    {
        id: 8,
        xws: 'tower',
        ship: {
            name: 'Tower'
        }
    }
];

module.exports = enemies;
