'use strict';

var $ = require('jquery');
var missionView = require('./missionResultsView');

module.exports = {
    init: function () {
        module.exports.bindXpButton();
    },
    renderXp: function (xpAmount) {
        $('[bind-xp-current]').text(xpAmount);
    },
    bindXpButton: function () {
        $('#add-mission-xp').on('click', function () {
            var $modalContent = missionView.renderView();
            var featherlightConfig = {
                variant: 'add-xp'
            };

            $.featherlight($modalContent, featherlightConfig);
            missionView.focus();
        });
    }
};
