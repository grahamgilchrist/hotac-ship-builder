'use strict';

var _ = require('lodash');
var conditions = require('../../generated/conditions');

var getConditionByXws = function (xws) {
    return _.find(conditions, function (condition) {
        return condition.xws === xws;
    });
};

// Get keys by name so we can look these up from related upgrades
var keyedByName = {};
conditions.forEach(function (condition) {
    keyedByName[condition.name] = condition;
});

module.exports = {
    all: conditions,
    keyedByName: keyedByName,
    getByXws: getConditionByXws
};
