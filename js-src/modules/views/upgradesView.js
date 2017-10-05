'use strict';

var $ = require('jquery');
var _ = require('lodash');

var pilotsWithAbilities = require('../models/pilots').pilotsWithAbilities;
var pilots = _.uniqBy(pilotsWithAbilities, function (pilot) {
    return pilot.text;
});
var modalController = require('../controllers/modals');
var events = require('../controllers/events');
var abilityCardView = require('./abilityCard');

module.exports = {
    renderShipSlotsList: function (build) {
        var upgradeSlots = build.upgradeSlots;

        // Process and create list for ship chassis slots
        var $freeShipSlots = $('#ship-slots-free');
        $freeShipSlots.empty();

        var $ul = $('<ul>');
        _.each(upgradeSlots.free, function (upgradeSlot) {
            var $li = module.exports.renderFreeShipSlot(upgradeSlot, build);
            $ul.append($li);
        });
        $freeShipSlots.append($ul);

        // Ship chassis slots
        var $shipSlots = $('#ship-slots-default');
        $shipSlots.empty();

        // Output allowed slots
        $ul = $('<ul>');
        _.each(upgradeSlots.enabled, function (upgradeSlot) {
            var $li = module.exports.renderShipSlot(upgradeSlot, build);
            $ul.append($li);
        });

        // Output disabled slots
        _.each(upgradeSlots.disabled, function (upgradeSlot) {
            if (build.pilotSkill < upgradeSlot.pilotSkill) {
                var $li = module.exports.renderShipSlot(upgradeSlot, build);
                $ul.append($li);
            }
        });

        $shipSlots.append($ul);

        var $shipSlotsFromUpgrades = $('#ship-slots-upgrades');
        $shipSlotsFromUpgrades.empty();

        if (upgradeSlots.slotsFromUpgrades.length > 0) {
            $ul = $('<ul>');

            _.each(upgradeSlots.slotsFromUpgrades, function (upgradeSlot) {
                var $li = module.exports.renderShipSlot(upgradeSlot, build);
                $ul.append($li);
            });

            $shipSlotsFromUpgrades.append($ul);
            $('#ship-slots-upgrades-wrapper').show();
        } else {
            $('#ship-slots-upgrades-wrapper').hide();
        }
    },
    renderShipSlot: function (upgradeSlot, build) {
        var upgradesAvailableToBuy = build.upgrades.getAvailableToBuy(upgradeSlot.type);

        // Don't show this slot if we can't either buy or equip anything existing into it
        //  (for example, no titles for this ship)
        var hasUpgradesToBuy = (upgradesAvailableToBuy.length > 0);
        var hasUpgradesToEquip = _.find(build.upgrades.unequipped, {
            slot: upgradeSlot.type
        });

        if (!upgradeSlot.equipped) {
            if (!hasUpgradesToBuy && !hasUpgradesToEquip) {
                return;
            }
        }

        var slotHtml = '<span class="title">' + upgradeSlot.type + '</span>';
        if (upgradeSlot.pilotSkill) {
            slotHtml += '<span class="required-ps"> (PS ' + upgradeSlot.pilotSkill + ')</span>';
        }

        var $li = $('<li></li>');
        var $slot = $('<div class="slot"></div>');
        $slot.append(module.exports.getIconString(upgradeSlot.type));
        $li.append($slot);

        if (build.pilotSkill < upgradeSlot.pilotSkill) {
            // Disabled
            $slot.addClass('disabled');
            $slot.append(slotHtml);
        } else {
            if (upgradeSlot.equipped) {
                slotHtml = '<span class="title">' + upgradeSlot.equipped.name + '</span>';
            }

            $slot.append(slotHtml);

            if (upgradeSlot.equipped) {
                var $icon = $('<i class="material-icons remove">remove_circle_outline</i>');
                $slot.append('<i class="material-icons icon-preview">zoom_in</i>');
                $slot.addClass('equipped');
                $li.append($icon);

                if (upgradeSlot.equipped.skill) {
                    // this is a pilot ability upgrade
                    $slot.attr('data-featherlight-type', 'text');
                    $slot.attr('data-featherlight-variant', 'preview-pilot-ability');
                    var escapedText = upgradeSlot.equipped.text.replace(/"/g, '&quot;');
                    $slot.attr('data-featherlight', escapedText);
                    $icon.on('click', function () {
                        module.exports.removeEquipSlotAbility(upgradeSlot.equipped.id, build);
                    });
                } else {
                    // this is an upgrade card
                    var imageUrl = '/components/xwing-data/images/' + upgradeSlot.equipped.image;
                    $slot.attr('data-featherlight', imageUrl);
                    $icon.on('click', function () {
                        module.exports.removeEquipSlotUpgrade(upgradeSlot.equipped.id, build);
                    });
                }
            } else {
                $slot.addClass('unequipped');
                $slot.on('click', function () {
                    var unusedUpgradesForType = _.filter(build.upgrades.unequipped, function (upgrade) {
                        return upgrade.slot === upgradeSlot.type;
                    });
                    module.exports.clickEquipSlot(upgradeSlot.type, unusedUpgradesForType, build.upgrades.unequippedAbilities, upgradesAvailableToBuy, build);
                });
            }
        }

        return $li;
    },
    renderFreeShipSlot: function (upgradeSlot) {
        var $li = $('<li></li>');
        var $slot = $('<div class="slot"></div>');
        $slot.append(module.exports.getIconString(upgradeSlot.type));
        $slot.append('<span class="title">' + upgradeSlot.upgrade.name + '</span>');
        $slot.append('<i class="material-icons icon-preview">zoom_in</i>');
        var imageUrl = '/components/xwing-data/images/' + upgradeSlot.upgrade.image;
        $slot.attr('data-featherlight', imageUrl);
        $li.append($slot);

        var $icon;

        if (upgradeSlot.equipped) {
            $icon = $('<i class="material-icons remove">remove_circle_outline</i>');
            $li.append($icon);
            $slot.addClass('equipped');
            $icon.on('click', function () {
                events.trigger('view.upgrades.unequipUpgrade', upgradeSlot.upgrade.id);
            });
        } else {
            $icon = $('<i class="material-icons remove">add_circle_outline</i>');
            $li.append($icon);
            $slot.addClass('unequipped');
            $icon.on('click', function () {
                events.trigger('view.upgrades.equipUpgrade', upgradeSlot.upgrade.id);
            });
        }

        return $li;
    },
    renderUpgradesList: function (build) {
        var $listsWrapper = $('.upgrade-slots-wrapper');
        var $unusedList = $('#unused-upgrade-list');
        $unusedList.empty();

        var hasUnequippedUpgrades = (build.upgrades.unequipped.length > 0 || build.upgrades.unequippedAbilities.length > 0);
        var hasDisabledUpgrades = (build.upgrades.disabled.length > 0);
        var hasDisabledOrUnequippedUpgrades = (hasDisabledUpgrades || hasUnequippedUpgrades);

        if (!hasDisabledOrUnequippedUpgrades) {
            $('.allowed-list').hide();
            $listsWrapper.removeClass('two-list').addClass('one-list');
        } else {
            $('.allowed-list').show();
            $listsWrapper.removeClass('one-list').addClass('two-list');
        }

        if (hasUnequippedUpgrades) {
            $('.unused-upgrades-wrapper').show();
            // Add purchased upgrades to the list
            _.forEach(build.upgrades.unequipped, function (upgrade) {
                var $upgradeItem = module.exports.renderUpgradeItem(upgrade);
                $unusedList.append($upgradeItem);
            });
            // Add pilot abilities to the list
            _.forEach(build.upgrades.unequippedAbilities, function (pilotAbility) {
                var $upgradeItem = module.exports.renderPilotUpgradeItem(pilotAbility);
                $unusedList.append($upgradeItem);
            });
        } else {
            $('.unused-upgrades-wrapper').hide();
        }

        var $disallowedList = $('#disabled-upgrade-list');
        $disallowedList.empty();
        if (hasDisabledUpgrades) {
            // there's some disabled upgrades here
            $('.disabled-upgrades').show();
            _.forEach(build.upgrades.disabled, function (upgrade) {
                var $upgradeItem = module.exports.renderUpgradeItem(upgrade);
                $disallowedList.append($upgradeItem);
            });
        } else {
            $('.disabled-upgrades').hide();
        }
    },
    renderUpgradeItem: function (upgrade) {
        var imageUrl = '/components/xwing-data/images/' + upgrade.image;
        var $item = $('<li class="upgrade" data-featherlight="' + imageUrl + '">' + module.exports.getIconString(upgrade.slot) + '<span class="upgrade-name">' + upgrade.name + '</span><i class="material-icons eye">zoom_in</i></li>');
        return $item;
    },
    renderPilotUpgradeItem: function (pilot) {
        var escapedText = pilot.text.replace(/"/g, '&quot;');
        var $item = $('<li class="upgrade" data-featherlight="' + escapedText + '" data-featherlight-type="text" data-featherlight-variant="preview-pilot-ability">' + module.exports.getIconString('Elite') + '<span class="upgrade-name">Ability: ' + pilot.name + '</span><i class="material-icons eye">zoom_in</i></li>');

        return $item;
    },
    getIconString: function (upgradeSlotType) {
        var iconId = upgradeSlotType.replace(' ', '').replace('-', '');
        iconId = iconId.toLowerCase();
        var iconString = '<i class="xwing-miniatures-font xwing-miniatures-font-' + iconId + '"></i>';
        return iconString;
    },
    clickEquipSlot: function (upgradeType, unusedUpgrades, unusedAbilities, upgradesAvailableToBuy, build) {
        // open modal to choose upgrade to equip
        var tabs = module.exports.renderUpgradeModalContent(upgradeType, unusedUpgrades, unusedAbilities, upgradesAvailableToBuy, build);
        modalController.openOptionSelectModal(undefined, tabs[0].buttonLabel, 'Equip ' + upgradeType + ' slot', tabs);
    },
    removeEquipSlotUpgrade: function (upgradeId) {
        events.trigger('view.upgrades.unequipUpgrade', upgradeId);
    },
    removeEquipSlotAbility: function (upgradeId) {
        events.trigger('view.upgrades.unequipAbility', upgradeId);
    },
    renderUpgradeModalContent: function (upgradeType, unusedUpgrades, unusedAbilities, upgradesAvailableToBuy, build) {
        var tabs = [];

        if (unusedUpgrades.length > 0 || (unusedAbilities.length > 0 && upgradeType === 'Elite')) {
            var $unusedUpgradesTab = module.exports.renderCardListModalContent(upgradeType, build, unusedUpgrades, unusedAbilities, 'equip');

            tabs.push({
                name: 'Existing',
                $content: $unusedUpgradesTab,
                buttonLabel: 'Equip'
            });
        }

        var $cardTab = module.exports.renderCardListModalContent(upgradeType, build, upgradesAvailableToBuy, pilots, 'buy');
        tabs.push({
            name: 'Buy new',
            $content: $cardTab,
            buttonLabel: 'Buy'
        });

        return tabs;
    },
    renderCardListModalContent: function (upgradeType, build, upgradesToShow, abilitiesToShow, mode) {
        var $modalContent = $('<div class="card-image-list" id="modal-upgrade-list-' + mode + '">');
        var $upgradeList = $('<ul>');

        _.forEach(upgradesToShow, function (item) {
            var $upgrade = module.exports.renderModalCardListItem(build, mode, item);
            $upgradeList.append($upgrade);
        });
        if (upgradeType === 'Elite') {
            _.forEach(abilitiesToShow, function (pilotCard) {
                var $upgrade = module.exports.renderModalCardListItem(build, mode, undefined, pilotCard);
                $upgradeList.append($upgrade);
            });
        }

        $modalContent.append($upgradeList);

        return $modalContent;
    },
    renderModalCardListItem: function (build, mode, card, abilityPilot) {
        var $upgrade;
        if (card) {
            $upgrade = $('<li><img src="/components/xwing-data/images/' + card.image + '" alt="' + card.name + '"></li>');

            if (mode === 'buy') {
                if (build.currentXp >= card.points) {
                    // We have enough XP to buy this item
                    $upgrade.on('click', function () {
                        var selectOptions = {
                            selectedUpgradeEvent: 'view.upgrades.buy',
                            selectedUpgradeId: card.id,
                            text: card.name + ': ' + card.hotacPoints + 'XP'
                        };
                        if (card.slot === 'Elite') {
                            selectOptions.text = '<span>' + card.name + ': ' + card.hotacPoints + 'XP</span><span class="help">Elite card upgrades cost double XP</span>';
                        }
                        $(this).trigger('select', selectOptions);
                    });
                } else {
                    // not enough XP
                    $upgrade.addClass('cannot-afford');
                }

            } else if (mode === 'equip') {
                // mode is equip existing item
                $upgrade.on('click', function () {
                    $(this).trigger('select', {
                        selectedUpgradeEvent: 'view.upgrades.equipUpgrade',
                        selectedUpgradeId: card.id,
                        text: '<span>' + card.name + '</span><span class="help">No cost to equip a previously purchased upgrade</span>'
                    });
                });
            }
        }
        if (abilityPilot) {
            var upgradeCost = abilityPilot.skill;
            $upgrade = $('<li></li>');
            var $card = abilityCardView.render(abilityPilot);
            $upgrade.append($card);

            if (mode === 'buy') {
                var enabled = true;
                if (build.currentXp < upgradeCost) {
                    // not enough XP
                    $upgrade.addClass('cannot-afford');
                    enabled = false;
                }
                if (build.pilotSkill < abilityPilot.skill) {
                    // not high enough PS level yet
                    $upgrade.addClass('lower-ps');
                    enabled = false;
                }

                if (enabled) {
                    $upgrade.on('click', function () {
                        $(this).trigger('select', {
                            selectedUpgradeEvent: 'view.pilotAbilities.buy',
                            selectedUpgradeId: abilityPilot.id,
                            text: abilityPilot.name + ': ' + abilityPilot.skill + 'XP'
                        });
                    });
                }
            } else {
                // Mode is to equip existing ability
                $upgrade.on('click', function () {
                    $(this).trigger('select', {
                        selectedUpgradeEvent: 'view.upgrades.equipAbility',
                        selectedUpgradeId: abilityPilot.id,
                        text: abilityPilot.name
                    });
                });
            }
        }

        return $upgrade;
    }
};
