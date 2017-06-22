'use strict';

var $ = require('jquery');

var events = require('../controllers/events');
var modalController = require('../controllers/modals');

module.exports = {
    renderWithPs: function (build) {
        $('#pilot-skill').text(build.pilotSkill);
        $('#pilot-skill-plus-one').text(build.pilotSkill + 1);
        var costOfNextUpgrade = module.exports.getNextUpgradeCost(build.pilotSkill);
        $('#pilot-skill-next-xp-cost').text(costOfNextUpgrade);

        $('#increase-ps').off('click').on('click', function () {
            var costOfNextUpgrade = module.exports.getNextUpgradeCost(build.pilotSkill);
            if (build.currentXp >= costOfNextUpgrade) {
                events.trigger('view.main.increasePs');
            } else {
                var message = 'You do not have enough XP to upgrade. Upgrading to PS ' + (build.pilotSkill + 1) + ' will cost ' + costOfNextUpgrade + ' XP.';
                modalController.openMessageModal(message);
            }
        });
    },
    getNextUpgradeCost: function (currentPilotSkill) {
        return (currentPilotSkill + 1) * 2;
    }
};
