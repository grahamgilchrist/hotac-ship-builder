'use strict';

var $ = require('jquery');
var missionView = require('./missionResultsView');
var modalController = require('../controllers/modals');

module.exports = {
    init: function () {
        module.exports.bindXpButton();
    },
    renderXp: function (xpAmount) {
        $('[bind-xp-current]').text(xpAmount);
    },
    bindXpButton: function () {
        $('[add-mission-xp]').on('click', function () {
            var $modalContent = missionView.renderView();
            modalController.openTitledModal($modalContent, 'Add Mission results', 'add-xp-modal');
            missionView.focus();
        });
    }
};
