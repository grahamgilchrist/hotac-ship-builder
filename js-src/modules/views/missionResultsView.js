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
            missions: missions.data
        };
        var viewHtml = templateUtils.renderHTML('modals/mission-results', context);
        var $modalContent = $(viewHtml);

        $modalContent.on('click', 'button', module.exports.submitResults);

        return $modalContent;
    },
    focus: function () {
        $('form#mission-results input').focus();
    },
    submitResults: function (e) {
        e.preventDefault();

        var $form = $(this).closest('form');

        var $select = $form.find('select[name="mission-id"]');
        var stringMissionId = $select.val();
        if (stringMissionId !== 'xp-only') {
            var missionId = parseInt(stringMissionId, 10);
            events.trigger('view.main.completeMission', missionId);
        }

        var $input = $form.find('input[name="xp-amount"]');
        var stringXpAmount = $input.val();
        var xpAmount = parseInt(stringXpAmount, 10);

        if (!_.isNaN(xpAmount) && xpAmount > 0) {
            events.trigger('view.main.addMissionXp', xpAmount);
        }

        $.featherlight.close();
    }
};
