'use strict';

var $ = require('jquery');
var _ = require('lodash');
// var events = require('../controllers/events');
// var modalController = require('../controllers/modals');

module.exports = {
    renderTable: function (build) {
        $('#kill-history').empty();

        _.each(build.kills, function (kill) {
            module.exports.renderTableRow(kill);
        });
    },
    renderTableRow: function (kill) {
        var $historyItem = $('<tr>');
        $historyItem.append('<td class="label">' + kill.ship.name + '</td>');
        $historyItem.append('<td>' + kill.number + '</td>');
        $('#kill-history').append($historyItem);
    }
};
