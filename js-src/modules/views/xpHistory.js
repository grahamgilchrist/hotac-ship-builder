'use strict';

var $ = require('jquery');
var _ = require('lodash');
var events = require('../controllers/events');
var modalController = require('../controllers/modals');
var templateUtils = require('../utils/templates');
var itemTypes = require('../models/shipBuild/itemTypes');

module.exports = {
    renderTable: function (build) {
        var $wrapperElement = $('[view-bind=history-table]');

        // xpCount is ongoing rolling total of additions and spends
        var xpCount = 0;
        // xpTotal is ongoig total of all XP earned but not spent
        var xpTotal = 0;

        var itemList = [];
        var lastItem;
        _.each(build.xpHistory, function (xpItem, xpItemIndex) {
            xpCount += xpItem.cost();
            if (xpItem.upgradeType === itemTypes.MISSION) {
                xpTotal += xpItem.cost();
            }
            var item = {
                resultingXP: xpCount,
                total: xpTotal,
                cost: xpItem.cost(),
                label: xpItem.label(),
                xpItemIndex: xpItemIndex,
                lastItem: lastItem
            };
            // Add to item list in reverse order so most recent is item index zero
            itemList.unshift(item);
            lastItem = item;
        });

        var context = {
            xpHistory: itemList
        };

        var viewHtml = templateUtils.renderHTML('history', context);
        var $newElement = $(viewHtml);

        $newElement.on('click', 'button[revert]', module.exports.revertButton);
        $wrapperElement.empty().append($newElement);
    },
    revertButton: function () {
        var xpItemIndex = parseInt($(this).attr('revert'), 10);

        var successCallback = function () {
            events.trigger('view.xpHistory.revert', xpItemIndex);
        };

        var message = 'Reverting to this point will lose your current ship status. Are you sure you want to continue?';
        modalController.openConfirmModal(message, successCallback);
    }
};
