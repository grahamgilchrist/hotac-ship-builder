'use strict';

var $ = require('jquery');
var _ = require('lodash');
var events = require('../controllers/events');

module.exports = {
    renderTable: function (build) {
        $('#xp-history').empty();

        var xpCount = 0;
        _.each(build.xpHistory, function (xpItem, xpItemIndex) {
            xpCount += xpItem.cost();
            module.exports.renderTableRow(xpItem, xpCount, xpItemIndex);
        });
    },
    renderTableRow: function (xpItem, resultingXP, xpItemIndex) {
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
        var $revertLink = $('<td>Revert</td>');
        $revertLink.on('click', function () {
            var result = window.confirm('Reverting to this point will lose your current ship status. Are you sure you want to continue?');
            if (!result) {
                return;
            }

            events.trigger('view.xpHistory.revert', xpItemIndex);
        });
        $historyItem.append($revertLink);
        $('#xp-history').prepend($historyItem);
    }
};
