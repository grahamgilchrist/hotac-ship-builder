'use strict';

var $ = require('jquery');

var events = require('../controllers/events');
var modalController = require('../controllers/modals');

module.exports = {
    renderWithPs: function (pilotSkill, currentXp) {
        $('#pilot-skill').text(pilotSkill);
        $('#pilot-skill-plus-one').text(pilotSkill + 1);
        var costOfNextUpgrade = module.exports.getNextUpgradeCost(pilotSkill);
        $('#pilot-skill-next-xp-cost').text(costOfNextUpgrade);

        $('#increase-ps').off('click').on('click', function () {
            var costOfNextUpgrade = module.exports.getNextUpgradeCost(pilotSkill);
            if (currentXp >= costOfNextUpgrade) {
                events.trigger('view.main.increasePs');
            } else {
                var message = 'You do not have enough XP to upgrade. Upgrading to PS ' + (pilotSkill + 1) + ' will cost ' + costOfNextUpgrade + ' XP.';
                modalController.openMessageModal(message);
            }
        });
    },
    getNextUpgradeCost: function (currentPilotSkill) {
        return (currentPilotSkill + 1) * 2;
    }
};
