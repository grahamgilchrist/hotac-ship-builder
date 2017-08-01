'use strict';

var _ = require('lodash');
var shipData = require('./shipCards');

var getShipDataById = function (xws) {
    return _.find(shipData, function (shipData) {
        return shipData.xws === xws;
    });
};

var enemies = [
    {
        xws: 'tiefighter',
        ship: getShipDataById('tiefighter')
    },
    {
        xws: 'tieinterceptor',
        ship: getShipDataById('tieinterceptor')
    },
    {
        xws: 'tieadvanced',
        ship: getShipDataById('tieadvanced')
    },
    {
        xws: 'tiebomber',
        ship: getShipDataById('tiebomber')
    },
    {
        xws: 'tiedefender',
        ship: getShipDataById('tiedefender')
    },
    {
        xws: 'tiephantom',
        ship: getShipDataById('tiephantom')
    },
    {
        xws: 'lambdaclassshuttle',
        ship: getShipDataById('lambdaclassshuttle')
    },
    {
        xws: 'vt49decimator',
        ship: getShipDataById('vt49decimator')
    },
    {
        xws: 'tower',
        ship: {
            name: 'Tower'
        }
    }
];

module.exports = enemies;
