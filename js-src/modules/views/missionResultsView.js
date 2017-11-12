'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');
var modalController = require('../controllers/modals');
var missions = require('../models/missions');
var templateUtils = require('../utils/templates');

module.exports = {
    init: function () {
        module.exports.bindXpButton();
    },
    bindXpButton: function () {
        $('[add-mission-xp]').on('click', function () {
            var $modalContent = module.exports.renderView();
            modalController.openTitledModal($modalContent, 'Add Mission results', 'add-xp-modal');
            module.exports.focus();
        });
    },
    renderView: function () {
        var context = {
            missions: missions
        };
        var viewHtml = templateUtils.renderHTML('modals/mission-results', context);
        var $modalContent = $(viewHtml);

        $modalContent.on('click', 'button', module.exports.submitResults);

        return $modalContent;
    },
    focus: function () {
        $('#mission-xp-amount').focus();
    },
    submitResults: function (e) {
        e.preventDefault();
        var stringXpAmount = $('#mission-xp-amount').val();
        var xpAmount = parseInt(stringXpAmount, 10);

        if (!_.isNaN(xpAmount) && xpAmount > 0) {
            events.trigger('view.main.addMissionXp', xpAmount);
        }

        $.featherlight.close();
    }
};
