'use strict';

var $ = require('jquery');
var events = require('./events');

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
    },
    openMessageModal: function (message) {
        var $modalContent = $('<div>');
        var $message = $('<div class="message">' + message + '</div>');
        var $buttonsWrapper = $('<div class="buttons">');
        var $okButton = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent ok">Ok</button>');
        $buttonsWrapper.append($okButton);
        $modalContent.append($message);
        $modalContent.append($buttonsWrapper);

        $okButton.on('click', function () {
            $.featherlight.close();
        });

        var featherlightConfig = {
            variant: 'message'
        };
        $.featherlight($modalContent, featherlightConfig);
    },
    openOptionSelectModal: function ($modalContent, buttonText) {
        var featherLightConfig = {
            variant: 'option-select',
            afterOpen: function () {
                $.featherlight.defaults.afterOpen();
                var lastSelectedItem;

                var $footer = $('<div class="modal-footer">');
                var $footerInner = $('<div class="modal-footer-inner">');
                var $summary = $('<div class="summary"><span></span></div>');
                var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" disabled>' + buttonText + '</button>');
                $button.on('click', function () {
                    if (lastSelectedItem.selectedUpgradeId) {
                        events.trigger(lastSelectedItem.selectedUpgradeEvent, lastSelectedItem.selectedUpgradeId);
                    }
                    $.featherlight.close();
                });
                $footer.append($footerInner);
                $footerInner.append($summary);
                $footerInner.append($button);

                // Do some trickery to set the max height and allow us to have a fixed footer in the modal
                var $featherlightContent = this.$instance.find('.featherlight-content');
                var $featherlightInner = this.$instance.find('.featherlight-inner');
                var height = $featherlightContent.height();
                $featherlightInner.css('max-height', height + 'px');
                this.$instance.find('.featherlight-content').append($footer);

                $featherlightInner.on('select', 'li', function (event, eventData) {
                    lastSelectedItem = eventData;
                    $button.removeAttr('disabled');
                    // deselect other list options
                    $(this).closest('ul').find('li').removeClass('selected');
                    $(this).addClass('selected');
                    var $text = '<span>' + eventData.text + '</span>';
                    $summary.html($text);
                });
            }
        };
        $.featherlight($modalContent, featherLightConfig);
    }
};
