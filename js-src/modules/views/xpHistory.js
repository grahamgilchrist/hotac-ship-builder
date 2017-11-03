'use strict';

var $ = require('jquery');
var _ = require('lodash');
var events = require('../controllers/events');
var modalController = require('../controllers/modals');
var templateUtils = require('../utils/templates');

module.exports = {
    renderTable: function (build) {
        var $wrapperElement = $('[view-bind=history-table]');

        var xpCount = 0;
        var itemList = [];
        _.each(build.xpHistory, function (xpItem, xpItemIndex) {
            xpCount += xpItem.cost();
            var item = {
                resultingXP: xpCount,
                cost: xpItem.cost(),
                label: xpItem.label(),
                xpItemIndex: xpItemIndex
            };
            itemList.unshift(item);
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
