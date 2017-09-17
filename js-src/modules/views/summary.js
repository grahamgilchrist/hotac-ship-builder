'use strict';

var $ = require('jquery');
var _ = require('lodash');

module.exports = {
    renderEquippedUpgrades: function (build) {
        var $equippedWrapper = $('[bind-equipped-upgrades]');
        $equippedWrapper.empty();

        if (build.upgrades.equippedUpgrades.length === 0 && build.upgrades.equippedAbilities.length === 0) {
            $('.summary-equipped h4').hide();
            $('.summary-equipped h4.empty').show();
        } else {
            $('.summary-equipped h4').show();
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
        $li.append('<div class="preview" data-featherlight="' + imageUrl + '">' + iconString + '<span class="name">' + upgrade.name + '</span><i class="material-icons icon-preview">zoom_in</i></div>');
        $li.append('<div class="full" data-featherlight="' + imageUrl + '"><img src="' + imageUrl + '" alt="Card image for ' + upgrade.name + '"></div>');

        return $li;
    },
    renderEquippedAbility: function (ability) {
        var $li = $('<li>');
        var iconString = module.exports.getIconString('Elite');
        var escapedText = ability.text.replace(/"/g, '&quot;');
        $li.append('<div class="preview" data-featherlight-type="text" data-featherlight-variant="preview-pilot-ability" data-featherlight="' + escapedText + '">' + iconString + '<span class="name">' + ability.name + '</span><i class="material-icons icon-preview">zoom_in</i></div>');
        $li.append('<div class="full ability"><div class="ability-inner"><span class="title">' + ability.name + '</span><span class="name">Ability</span><span class="text">' + escapedText + '</span></div></div>');

        return $li;
    },
    getIconString: function (upgradeSlotType) {
        var iconId = upgradeSlotType.replace(' ', '').replace('-', '');
        iconId = iconId.toLowerCase();
        var iconString = '<i class="xwing-miniatures-font xwing-miniatures-font-' + iconId + '"></i>';
        return iconString;
    }
};
