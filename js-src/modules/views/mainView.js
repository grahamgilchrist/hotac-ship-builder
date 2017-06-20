'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');

module.exports = {
    init: function () {
        // bind new button
        $('#new-build').on('click', module.exports.clickResetButton);

        module.exports.bindTabsButton();
        module.exports.bindXpButton();
        module.exports.bindExportButton();
        module.exports.bindPrintButton();
    },
    clickResetButton: function () {
        var result = window.confirm('Are you sure you want to start a new ship? The existing build will be lost');
        if (!result) {
            return;
        }

        events.trigger('view.main.reset');
    },
    hide: function () {
        $('.main').removeClass('active');
    },
    show: function () {
        $('.main').addClass('active');
    },
    renderTitle: function (build) {
        $('#title-icon').html('<i class="xwing-miniatures-ship xwing-miniatures-ship-' + build.currentShip.id + '"></i>');
        $('#title-callsign').text(build.callsign);
        $('#title-ship').text(build.currentShip.shipData.name);
        $('#title-player-name').text(build.playerName);
    },
    renderXp: function (xpAmount) {
        $('#xp-current').text(xpAmount);
    },
    bindTabsButton: function () {
        var activeClass = 'is-active';
        $('.build-content .mdl-tabs__tab').on('click', function (e) {
            var targetIdSelector = $(this).attr('href');
            if (targetIdSelector === '#stats-upgrades-combined-tab') {
                $(this).closest('.mdl-tabs').find('.stats-tab-button').addClass('is-active');
                $('#ship-stats-tab').addClass('is-active');
            }

            if (targetIdSelector === '#ship-stats-tab' || targetIdSelector === '#upgrades-tab') {
                $(this).closest('.mdl-tabs').find('.stats-upgrade-tab-button').addClass('is-active');
                $('#stats-upgrades-combined-tab').addClass('is-active');
            }
        });

        $('.build-content .mdl-tabs__tab-bar .history-tab-button').on('click', function (e) {
            $(this).closest('.mdl-tabs').find('.mdl-tabs__panel').removeClass(activeClass);
            $('#xp-history-tab').addClass(activeClass);
            e.preventDefault();
            return false;
        });

    },
    bindXpButton: function () {
        $('#add-mission-xp').on('click', function () {

            var $modalContent = $('<div>');
            var $header = $('<h2>Add XP earned from a mission</h2>');
            var $input = $('<div><input type="text" id="mission-xp-amount"></div>');
            var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Add</button>');

            $button.on('click', function () {
                var stringXpAmount = $('#mission-xp-amount').val();
                var xpAmount = parseInt(stringXpAmount, 10);

                if (!_.isNaN(xpAmount)) {
                    events.trigger('view.main.addMissionXp', xpAmount);
                }

                $.featherlight.close();
            });

            $modalContent.append($header);
            $modalContent.append($input);
            $modalContent.append($button);

            $.featherlight($modalContent);
            $('#mission-xp-amount').focus();
        });
    },
    bindPrintButton: function () {
        $('#print').on('click', function () {
            window.print();
        });
    },
    bindExportButton: function () {
        $('#export').on('click', function () {
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
    showShipTab: function () {
        var $tabLink = $('.mdl-tabs__tab[href="#current-ship-tab"]');
        $tabLink.get(0).click();
    }
};
