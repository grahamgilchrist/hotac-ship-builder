'use strict';

var $ = require('jquery');

var events = require('../controllers/events');

module.exports = {
    renderWithPs: function (pilotSkill, currentXp) {
        module.exports.bindPilotSkillElements(pilotSkill);
        module.exports.bindIncreasePilotSkillButton(pilotSkill, currentXp);
    },
    bindPilotSkillElements: function (pilotSkill) {
        $('[bind-pilot-skill]').text(pilotSkill);
        $('[bind-pilot-skill-plus-one]').text(pilotSkill + 1);
        var costOfNextUpgrade = module.exports.getNextUpgradeCost(pilotSkill);
        $('[bind-pilot-skill-next-xp-cost]').text(costOfNextUpgrade);
    },
    bindIncreasePilotSkillButton: function (pilotSkill, currentXp) {
        var $button = $('#increase-ps');
        var costOfNextUpgrade = module.exports.getNextUpgradeCost(pilotSkill);

        var isDisabled = true;
        if (module.exports.canUpgrade(currentXp, costOfNextUpgrade)) {
            isDisabled = false;
        }

        if (isDisabled) {
            $('#increase-ps').attr('disabled', 'disabled');
            $('#increase-ps-tooltip').show();
        } else {
            $('#increase-ps').removeAttr('disabled');
            $('#increase-ps-tooltip').hide();
        }

        $button.off('click').on('click', function () {
            events.trigger('view.main.increasePs');
        });
    },
    canUpgrade: function (currentXp, costOfNextUpgrade) {
        if (currentXp >= costOfNextUpgrade) {
            return true;
        }
        return false;
    },
    getNextUpgradeCost: function (currentPilotSkill) {
        return (currentPilotSkill + 1) * 2;
    }
};
