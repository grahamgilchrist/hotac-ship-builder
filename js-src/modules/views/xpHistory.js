'use strict';

var $ = require('jquery');
var _ = require('lodash');

module.exports = {
    renderTable: function (build) {
        $('#xp-history').empty();

        var xpCount = 0;
        _.each(build.xpHistory, function (xpItem) {
            xpCount += xpItem.cost();
            module.exports.renderTableRow(xpItem, xpCount);
        });
    },
    renderTableRow: function (xpItem, resultingXP) {
        var $historyItem = $('<tr>');
        $historyItem.append('<td>' + xpItem.label() + '</td>');
        var cost = xpItem.cost();
        var costString = cost;
        var costClass = '';
        if (cost > 0) {
            costString = '+' + cost;
            costClass = 'positive';
        } else if (cost < 0) {
            costClass = 'negative';
        }
        $historyItem.append('<td class="' + costClass + '">' + costString + '</td>');
        $historyItem.append('<td>' + resultingXP + '</td>');
        $('#xp-history').prepend($historyItem);
    }
};
