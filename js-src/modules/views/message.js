'use strict';

var $ = require('jquery');
var events = require('../controllers/events');

module.exports = {
    renderMessage: function (xpItem, xpItemIndex) {
        var $message = $('#message');
        var messageElement = $message.get(0);
        var messageText = xpItem.label() + ' (' + xpItem.cost() + 'XP)';

        var onClick = function () {
            messageElement.MaterialSnackbar.cleanup_();
            events.trigger('view.xpHistory.revert', xpItemIndex - 1);
        };

        var data = {
            message: messageText,
            actionHandler: onClick,
            actionText: 'Undo'
        };
        messageElement.MaterialSnackbar.showSnackbar(data);
    },
    clear: function () {
        var $message = $('#message');
        var messageElement = $message.get(0);
        messageElement.MaterialSnackbar.cleanup_();
    }
};
