'use strict';

var $ = require('jquery');
var abilityCardView = require('./abilityCard');
var modalController = require('../controllers/modals');
var templateUtils = require('../utils/templates');
var upgrades = require('../models/upgrades');

module.exports = {
    renderEquippedUpgrades: function (build) {
        var $equippedUpgrades = $('[view-bind=equipped-upgrades]');

        var context = {
            equippedUpgrades: build.upgrades.equippedUpgrades,
            equippedAbilities: build.upgrades.equippedAbilities,
            getIconString: upgrades.getIconString,
            renderCard: abilityCardView.renderHtml
        };
        var templatePromise = templateUtils.renderHTML('summary/equipped-upgrades.html', context);

        templatePromise.then(function (viewHtml) {
            var $newElement = $(viewHtml);

            $newElement.on('click', 'li .ability.preview', function () {
                var pilotId = parseInt($(this).attr('pilot-id'), 10);
                modalController.openAbilityCardModal(pilotId);
            });
            $equippedUpgrades.empty().append($newElement);
        });
    }
};
