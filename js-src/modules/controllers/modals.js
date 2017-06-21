'use strict';

var $ = require('jquery');

module.exports = {
    init: function () {
        $.featherlight.defaults.afterOpen = function () {
            window.componentHandler.upgradeDom();
        };
    },
    openConfirmModal: function (message, successCallback) {
        var $modalContent = $('<div>');
        var $message = $('<div class="message">' + message + '</div>');
        var $buttonsWrapper = $('<div class="buttons">');
        var $cancelButton = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent cancel">Cancel</button>');
        var $okButton = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent ok">Ok</button>');
        $buttonsWrapper.append($cancelButton);
        $buttonsWrapper.append($okButton);
        $modalContent.append($message);
        $modalContent.append($buttonsWrapper);

        $cancelButton.on('click', function () {
            $.featherlight.close();
        });

        $okButton.on('click', function () {
            successCallback();
            $.featherlight.close();
        });

        var featherlightConfig = {
            variant: 'confirm-buttons'
        };
        $.featherlight($modalContent, featherlightConfig);
    }
};
