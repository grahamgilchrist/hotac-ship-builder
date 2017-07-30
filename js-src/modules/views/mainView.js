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
        var activeClass = 'is-active';
        $('.build-content .mdl-tabs__tab').on('click', function () {
            var targetTabIdSelector = $(this).attr('href');
            var $targetTabPanel = $(targetTabIdSelector);
            var extraTabSelector = $(this).attr('extra-tab');
            $('.tabs-panel').removeClass(activeClass);
            $targetTabPanel.addClass(activeClass);

            if (extraTabSelector) {
                var $extraTabPanel = $(extraTabSelector);
                $extraTabPanel.addClass(activeClass);
            }

            // Also highlight the approipriate items in the other hidden menu.
            // Narrow or wide menu which isn't being show
            var $tabsWrapper = $(this).closest('.mdl-tabs');
            var $tabButtons = $tabsWrapper.find('.mdl-tabs__tab[href="' + targetTabIdSelector + '"], .mdl-tabs__tab[extra-tab="' + targetTabIdSelector + '"]');
            $tabButtons.addClass(activeClass);
        });
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
    },
    showShipTab: function () {
        var $tabLink = $('.mdl-tabs__tab[href="#stats-upgrade-tab-button"]');
        if ($tabLink.css('display') === 'block') {
            // parent wrapper tab is active so show that
            $tabLink.get(0).click();
        } else {
            $tabLink = $('.mdl-tabs__tab[href="#ship-stats-tab"]');
            $tabLink.get(0).click();
        }
    }
};
