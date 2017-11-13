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
        module.exports.bindHelpButton();
        module.exports.bindHelpLinks();
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
                var input = this;
                // .select() doesn't work on iOS, so... try this
                setTimeout(function () {
                    input.setSelectionRange(0, 9999);
                }, 0);
            });
            $modalContent.append($input);
            $.featherlight($modalContent);
        });
    },
    bindHelpButton: function () {
        $('.header-buttons #help, .drawer #help').on('click', function () {
            modalController.openDocsModal('docs/about.html');
        });
    },
    bindHelpLinks: function () {
        $(document).on('click', '.featherlight.content-typography a[href]', function (e) {
            var href = $(this).attr('href');
            if (href.substring(0, 1) === '#') {
                // this is an in-page anchor link
                e.preventDefault();
                var $linkedElement = $(href);
                $linkedElement.get(0).scrollIntoView();
            }
        });
    },
    setMainState: function () {
        $('.header, .drawer-wrapper').removeClass('state-new');
        $('.header, .drawer-wrapper').addClass('state-main');
    },
    setNewState: function () {
        $('.header, .drawer-wrapper').removeClass('state-main');
        $('.header, .drawer-wrapper').addClass('state-new');
    }
};
