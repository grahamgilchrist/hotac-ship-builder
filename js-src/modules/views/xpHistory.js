'use strict';

var $ = require('jquery');

module.exports = {
    renderTableRow: function (data) {
        var $historyItem = $('<tr>');
        $historyItem.append('<td>' + data.xpItem.label() + '</td>');
        var cost = data.xpItem.cost();
        var costString = cost;
        var costClass = '';
        if (cost > 0) {
            costString = '+' + cost;
            costClass = 'positive';
        } else if (cost < 0) {
            costClass = 'negative';
        }
        $historyItem.append('<td class="' + costClass + '">' + costString + '</td>');
        $historyItem.append('<td>' + data.build.currentXp + '</td>');
        $('#xp-history').prepend($historyItem);
    }
};
