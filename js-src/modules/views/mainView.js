'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');

module.exports = {
    init: function () {
        module.exports.bindTabsButton();
        module.exports.bindXpButton();
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
        var narrowActiveClass = 'narrow-is-active';
        var wideActiveClass = 'wide-is-active';
        $('.build-content .mdl-tabs__tab').on('click', function () {
            // Hide all panels to start
            $('.tabs-panel').removeClass(narrowActiveClass + ' ' + wideActiveClass);

            // activate tab panels for narrow mode
            var narrowTabSelector = $(this).attr('href');
            var $narrowTabPanel = $(narrowTabSelector);
            $narrowTabPanel.addClass(narrowActiveClass);

            // activate tab panels for wide mode
            var wideTabString = $(this).attr('wide-tabs');
            if (wideTabString) {
                var wideTabSelectors = wideTabString.split(',');
                wideTabSelectors.forEach(function (wideTabSelector) {
                    var $wideTabPanel = $(wideTabSelector);
                    $wideTabPanel.addClass(wideActiveClass);
                });
            }

            // Also highlight the appropriate items in the menu
            var $tabsWrapper = $(this).closest('.mdl-tabs');
            $tabsWrapper.find('.mdl-tabs__tab').removeClass(narrowActiveClass + ' is-active ' + wideActiveClass);

            // if ($(this).hasClass('wide-only')) {

            // }
            // Highlight any items which match the a single tab
            var $narrowTabButtons = $tabsWrapper.find('.mdl-tabs__tab[href="' + narrowTabSelector + '"]');
            $narrowTabButtons.addClass(narrowActiveClass);
            // activate any other wide-only tabs which match the same wide tabs selection as this item
            var $wideTabButtons = $tabsWrapper.find('.mdl-tabs__tab[wide-tabs="' + wideTabString + '"]');
            $wideTabButtons.addClass(wideActiveClass);
        });
    },
    showShipTab: function () {
        var $narrowTabBar = $('.mdl-tabs__tab-bar.narrow');
        var $wideTabBar = $('.mdl-tabs__tab-bar.wide');
        if ($narrowTabBar.css('display') !== 'none') {
            $narrowTabBar.find('.mdl-tabs__tab').get(0).click();
        } else {
            $wideTabBar.find('.mdl-tabs__tab').get(0).click();
        }
    },
    bindXpButton: function () {
        $('#add-mission-xp').on('click', function () {

            var $modalContent = $('<div>');
            var $header = $('<h2>Add XP earned from a mission</h2>');
            var $form = $('<form>');
            var $input = $('<input type="text" id="mission-xp-amount">');
            var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Add</button>');

            $button.on('click', function () {
                var stringXpAmount = $('#mission-xp-amount').val();
                var xpAmount = parseInt(stringXpAmount, 10);

                if (!_.isNaN(xpAmount) && xpAmount > 0) {
                    events.trigger('view.main.addMissionXp', xpAmount);
                }

                $.featherlight.close();
            });

            $form.append($input);
            $form.append($button);
            $modalContent.append($header);
            $modalContent.append($form);

            var featherlightConfig = {
                variant: 'add-xp'
            };

            $.featherlight($modalContent, featherlightConfig);
            $('#mission-xp-amount').focus();
        });
    }
};
