'use strict';

var shipCards = require('../../generated/ships');

var sortedShips = shipCards.sort(function (a, b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }

    // names must be equal
    return 0;
});

module.exports = sortedShips;
