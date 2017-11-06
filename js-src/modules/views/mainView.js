'use strict';

var $ = require('jquery');

module.exports = {
    init: function () {
        module.exports.bindTabChange();
    },
    hide: function () {
        $('.main').removeClass('active');
    },
    show: function () {
        $('.main').addClass('active');
    },
    renderTitle: function (build) {
        $('[bind-ship-icon]').html('<i class="xwing-miniatures-ship xwing-miniatures-ship-' + build.currentShip.id + '"></i>');
        $('[bind-callsign]').text(build.callsign);
        $('[bind-player-name]').text(build.playerName);
    },
    showTab: function (tabName) {
        var $tabLink = $('.build-content .mdl-tabs__tab-bar a[href="' + tabName + '"] span');
        $tabLink.click();
    },
    reset: function () {
        window.sessionStorage.removeItem('tabName');
        module.exports.showTab('#summary-tab');
    },
    bindTabChange: function () {
        var $tabLinks = $('.build-content .mdl-tabs__tab-bar a');

        $tabLinks.on('click', module.exports.tabChanged);
    },
    tabChanged: function () {
        var $clickedAnchor = $(this);
        var tabName = $clickedAnchor.attr('href');

        if (window.sessionStorage) {
            window.sessionStorage.setItem('tabName', tabName);
        }
    },
    showSavedTab: function () {
        if (window.sessionStorage) {
            var tabName = window.sessionStorage.getItem('tabName');
            if (tabName) {
                module.exports.showTab(tabName);
            }
        }
    }
};
