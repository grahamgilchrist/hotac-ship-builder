'use strict';

var $ = require('jquery');
var events = require('../controllers/events');
var modalController = require('../controllers/modals');

module.exports = {
    init: function () {
        // bind new button
        $('.header-buttons #new-build, .drawer #new-build').on('click', module.exports.clickResetButton);

        // bind drawer button
        $('#drawer-button').on('click', module.exports.openDrawer);
        $('#drawer-wrapper .drawer-background').on('click', module.exports.closeDrawer);

        module.exports.bindExportButton();
        module.exports.bindPrintButton();
    },
    openDrawer: function () {
        $('#drawer-wrapper').addClass('active');
    },
    closeDrawer: function () {
        $('#drawer-wrapper').removeClass('active');
    },
    clickResetButton: function () {
        module.exports.closeDrawer();
        var successCallback = function () {
            events.trigger('view.main.reset');
        };
        var message = 'Are you sure you want to start a new ship? The existing build will be lost';
        modalController.openConfirmModal(message, successCallback);
    },
    bindPrintButton: function () {
        $('.header-buttons #print, .drawer #print').on('click', function () {
            window.print();
        });
    },
    bindExportButton: function () {
        $('.header-buttons #export, .drawer #export').on('click', function () {
            var $modalContent = $('<div class="share-modal">');
            $modalContent.append('<h3>Share ship build</h3>');
            $modalContent.append('<p>Copy and share the link below via email, social media etc. to allow others to view this build</p>');
            var $input = $('<input type="text" value="' + window.location.href + '">');
            $input.on('focus', function () {
                this.select();
            });
            $modalContent.append($input);
            $.featherlight($modalContent);
        });
    },
    showButtons: function () {
        $('.header-buttons').addClass('active');
        $('#drawer-button').addClass('active');
    },
    hideButtons: function () {
        $('.header-buttons').removeClass('active');
        $('#drawer-button').removeClass('active');
    }
};
