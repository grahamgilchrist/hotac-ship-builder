'use strict';

var $ = require('jquery');

module.exports = {
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
        var $tabLink = $('.build-content .mdl-tabs__tab-bar a[href="#' + tabName + '-tab"] span');
        $tabLink.click();
    }
};
