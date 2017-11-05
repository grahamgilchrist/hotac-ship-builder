'use strict';

var $ = require('jquery');
var abilityCardView = require('./abilityCard');
var modalController = require('../controllers/modals');
var templateUtils = require('../utils/templates');
var upgrades = require('../models/upgrades');
var conditions = require('../models/conditions');
var conditionsByName = conditions.keyedByName;

module.exports = {
    renderEquippedUpgrades: function (build) {
        var $equippedUpgrades = $('[view-bind=equipped-upgrades]');

        var context = {
            equippedUpgrades: build.upgrades.equippedUpgrades,
            equippedAbilities: build.upgrades.equippedAbilities,
            getIconString: upgrades.getIconString,
            renderCard: abilityCardView.renderHtml,
            conditions: conditionsByName
        };
        var viewHtml = templateUtils.renderHTML('summary/equipped-upgrades', context);
        var $newElement = $(viewHtml);

        $newElement.on('click', 'li .ability.preview', function () {
            var pilotId = parseInt($(this).attr('pilot-id'), 10);
            modalController.openAbilityCardModal(pilotId);
        });
        $equippedUpgrades.empty().append($newElement);
    }
};
