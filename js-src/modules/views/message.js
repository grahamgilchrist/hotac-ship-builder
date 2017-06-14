'use strict';

var $ = require('jquery');
var events = require('../controllers/events');

module.exports = {
    renderMessage: function (xpItem, xpItemIndex) {
        var $messageWrapper = $('<div class="message">');
        var $message = $('<span>' + xpItem.label() + ' (' + xpItem.cost() + 'XP)</span>');
        var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Undo</button>');

        $button.on('click', function () {
            events.trigger('view.xpHistory.revert', xpItemIndex);
        });

        $messageWrapper.append($message);
        $messageWrapper.append($button);
        $('#message').append($messageWrapper);
    },
    clear: function () {
        $('#message').empty();
    }
};
