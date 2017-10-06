'use strict';

var $ = require('jquery');
var _ = require('lodash');
var abilityCardView = require('./abilityCard');
var modalController = require('../controllers/modals');

module.exports = {
    renderEquippedUpgrades: function (build) {
        var $equippedWrapper = $('[bind-equipped-upgrades]');
        $equippedWrapper.empty();

        if (build.upgrades.equippedUpgrades.length === 0 && build.upgrades.equippedAbilities.length === 0) {
            $('.summary-equipped h4.not-empty').hide();
            $('.summary-equipped h4.empty').show();
        } else {
            $('.summary-equipped h4.not-empty').show();
            $('.summary-equipped h4.empty').hide();
        }

        var $ul = $('<ul>');
        _.each(build.upgrades.equippedUpgrades, function (upgrade) {
            var $li = module.exports.renderEquippedUpgrade(upgrade);
            $ul.append($li);
        });
        _.each(build.upgrades.equippedAbilities, function (ability) {
            var $li = module.exports.renderEquippedAbility(ability);
            $ul.append($li);
        });

        $equippedWrapper.append($ul);
    },
    renderEquippedUpgrade: function (upgrade) {
        var $li = $('<li>');
        var imageUrl = '/components/xwing-data/images/' + upgrade.image;
        var iconString = module.exports.getIconString(upgrade.slot);
        $li.append('<div class="preview" data-featherlight="' + imageUrl + '" data-featherlight-variant="card-preview-modal" data-featherlight-close-on-click="anywhere">' + iconString + '<span class="name">' + upgrade.name + '</span><i class="material-icons icon-preview">zoom_in</i></div>');
        $li.append('<div class="full" data-featherlight="' + imageUrl + '" data-featherlight-variant="card-preview-modal" data-featherlight-close-on-click="anywhere"><img src="' + imageUrl + '" alt="Card image for ' + upgrade.name + '"></div>');

        return $li;
    },
    renderEquippedAbility: function (abilityPilot) {
        var $li = $('<li>');
        var iconString = module.exports.getIconString('Elite');
        $li.append('<div class="preview">' + iconString + '<span class="name">' + abilityPilot.name + '</span><i class="material-icons icon-preview">zoom_in</i></div>');
        $li.on('click', function () {
            modalController.openAbilityCardModal(abilityPilot);
        });

        var $card = abilityCardView.render(abilityPilot).addClass('full');
        $li.append($card);

        return $li;
    },
    getIconString: function (upgradeSlotType) {
        var iconId = upgradeSlotType.replace(' ', '').replace('-', '');
        iconId = iconId.toLowerCase();
        var iconString = '<i class="xwing-miniatures-font xwing-miniatures-font-' + iconId + '"></i>';
        return iconString;
    }
};
