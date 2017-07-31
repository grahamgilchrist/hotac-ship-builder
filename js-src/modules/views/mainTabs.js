'use strict';

var $ = require('jquery');
var _ = require('lodash');

var $tabsWrapper;
var $narrowMenu;
var $wideMenu;

module.exports = {
    init: function () {
        module.exports.cacheElements();
        module.exports.bindTabsButton();
    },
    cacheElements: function () {
        $tabsWrapper = $('.build-content .mdl-tabs');
        $narrowMenu = $tabsWrapper.find('.mdl-tabs__tab-bar.narrow');
        $wideMenu = $tabsWrapper.find('.mdl-tabs__tab-bar.wide');
    },
    bindTabsButton: function () {
        $('.build-content .mdl-tabs__tab').on('click', function () {
            var narrowTabSelector = $(this).attr('href');
            module.exports.activateTabPanels($(this), narrowTabSelector);
            module.exports.selectTabButtons($(this), narrowTabSelector);
        });
    },
    activateTabPanels: function ($clickElement, narrowTabSelector) {
        var narrowActiveClass = 'narrow-is-active';
        var wideActiveClass = 'wide-is-active';
        // Hide all panels to start
        $('.tabs-panel').removeClass(narrowActiveClass + ' ' + wideActiveClass);

        // activate tab panels for narrow mode
        var $narrowTabPanel = $(narrowTabSelector);
        $narrowTabPanel.addClass(narrowActiveClass);

        // activate tab panels for wide mode
        var wideTabSelectors = module.exports.getWideSelectorsList($clickElement);
        wideTabSelectors.forEach(function (wideTabSelector) {
            var $wideTabPanel = $(wideTabSelector);
            $wideTabPanel.addClass(wideActiveClass);
        });
    },
    getWideSelectorsList: function ($element) {
        var wideTabString = $element.attr('wide-tabs');
        var wideTabSelectors = [];
        if (wideTabString) {
            wideTabSelectors = wideTabString.split(',');
        }
        return wideTabSelectors;
    },
    selectTabButtons: function ($clickElement, narrowTabSelector) {
        var activeClass = 'is-active';

        var $tabMenu = $clickElement.closest('.mdl-tabs__tab-bar');
        if ($tabMenu.hasClass('narrow')) {
            // Get all the wide menu items
            var $wideMenuButtons = $wideMenu.find('.mdl-tabs__tab');
            $wideMenuButtons.each(function (index, element) {
                var $element = $(element);
                // get the list of tabs this item displays in wide mode
                var wideTabSelectors = module.exports.getWideSelectorsList($element);
                if (_.includes(wideTabSelectors, narrowTabSelector)) {
                    // this menu item contains the clicked item, so activate it
                    $element.addClass(activeClass);
                }
            });
        } else {
            // clicked an item in the wide menu
            // Select the items in the narrow menu which correspond to the href
            var $narrowTabButtons = $narrowMenu.find('[href="' + narrowTabSelector + '"]');
            $narrowTabButtons.addClass(activeClass);
        }
    },
    showShipTab: function () {
        var $narrowTabBar = $('.mdl-tabs__tab-bar.narrow');
        var $wideTabBar = $('.mdl-tabs__tab-bar.wide');
        if ($narrowTabBar.css('display') !== 'none') {
            $narrowTabBar.find('.mdl-tabs__tab').get(0).click();
        } else {
            $wideTabBar.find('.mdl-tabs__tab').get(0).click();
        }
    }
};
