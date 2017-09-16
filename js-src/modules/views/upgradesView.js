'use strict';

var $ = require('jquery');
var _ = require('lodash');

var pilotsWithAbilities = require('../models/pilots').pilotsWithAbilities;
var pilots = _.uniqBy(pilotsWithAbilities, function (pilot) {
    return pilot.text;
});
var modalController = require('../controllers/modals');
var events = require('../controllers/events');

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

        // Process and create list for ship chassis slots
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

        // Don't show this slot if there are no available upgrades for it (e.g. a title slot for a ship with no titles)
        if (!upgradesAvailableToBuy || upgradesAvailableToBuy.length < 1) {
            return;
        }

        var slotHtml = '<span class="title">' + upgradeSlot.type + '</span>';
        if (upgradeSlot.pilotSkill) {
            slotHtml += '<span> (PS ' + upgradeSlot.pilotSkill + ')</span>';
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
                $slot.append('<i class="material-icons eye">zoom_in</i>');
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
        $slot.append('<i class="material-icons eye">zoom_in</i>');
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
        var $unusedList = $('#unused-upgrade-list');
        $unusedList.empty();

        var hasUnequippedUpgrades = (build.upgrades.unequipped.length > 0 || build.upgrades.unequippedAbilities.length > 0);
        var hasDisabledUpgrades = (build.upgrades.disabled.length > 0);
        var hasDisabledOrUnequippedUpgrades = (hasDisabledUpgrades || hasUnequippedUpgrades);

        if (!hasDisabledOrUnequippedUpgrades) {
            $('.allowed-list').hide();
        } else {
            $('.allowed-list').show();
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
        var $item = $('<li class="upgrade" data-featherlight="' + imageUrl + '">' + module.exports.getIconString(upgrade.slot) + '<span>' + upgrade.name + '</span><i class="material-icons eye">zoom_in</i><img class="preview" src="' + imageUrl + '"></li>');
        return $item;
    },
    renderPilotUpgradeItem: function (pilot) {
        var escapedText = pilot.text.replace(/"/g, '&quot;');
        var $item = $('<li class="upgrade" data-featherlight="' + escapedText + '" data-featherlight-type="text" data-featherlight-variant="preview-pilot-ability">' + module.exports.getIconString('Elite') + '<span>Ability: ' + pilot.name + '</span><i class="material-icons eye">zoom_in</i></li>');

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
        var $modalContent = module.exports.renderUpgradeModalContent(upgradeType, unusedUpgrades, unusedAbilities, upgradesAvailableToBuy, build);
        modalController.openOptionSelectModal($modalContent, 'Buy upgrade');
    },
    removeEquipSlotUpgrade: function (upgradeId) {
        events.trigger('view.upgrades.unequipUpgrade', upgradeId);
    },
    removeEquipSlotAbility: function (upgradeId) {
        events.trigger('view.upgrades.unequipAbility', upgradeId);
    },
    renderUpgradeModalContent: function (upgradeType, unusedUpgrades, unusedAbilities, upgradesAvailableToBuy, build) {
        var tabs = [];

        if (unusedUpgrades.length > 0) {
            var $unusedUpgradesTab = module.exports.renderCardListModalContent(build, unusedUpgrades, 'equip');
            tabs.push({
                name: 'Existing ' + upgradeType,
                $content: $unusedUpgradesTab
            });
        }

        if (unusedAbilities.length > 0) {
            var $unusedAbilitiesTab = module.exports.renderPilotAbilityModalContent(build, unusedAbilities, 'equip');
            tabs.push({
                name: 'Existing abilities',
                $content: $unusedAbilitiesTab
            });
        }

        var $tab = module.exports.renderCardListModalContent(build, upgradesAvailableToBuy, 'buy');
        var tabName = 'Buy new ' + upgradeType;
        if (upgradeType === 'Elite') {
            tabName = 'Elite cards';
        }
        tabs.push({
            name: tabName,
            $content: $tab
        });

        if (upgradeType === 'Elite') {
            var $abilityTab = module.exports.renderPilotAbilityModalContent(build, pilots, 'buy');
            tabs.push({
                name: 'Pilot abilities',
                $content: $abilityTab
            });
        }

        return module.exports.renderTabs(tabs);
    },
    renderTabs: function (tabsObject) {
        var $modalContent = $('<div>');

        if (tabsObject.length > 1) {
            // tab link elements
            var $tabsBar = $('<div class="mdl-tabs__tab-bar">');
            _.each(tabsObject, function (tab) {
                var tabId = tab.$content.attr('id');
                var $tabLink = $('<a href="#' + tabId + '" class="mdl-tabs__tab">' + tab.name + '</a>');
                $tabsBar.append($tabLink);
            });
            $tabsBar.find('a').first().addClass('is-active');

            // create DOM structure
            $modalContent.addClass('mdl-tabs mdl-js-tabs mdl-js-ripple-effect');
            $modalContent.prepend($tabsBar);
            tabsObject[0].$content.addClass('is-active');
            _.each(tabsObject, function (tab) {
                tab.$content.addClass('mdl-tabs__panel');
            });
        }

        _.each(tabsObject, function (tab) {
            $modalContent.append(tab.$content);
        });

        return $modalContent;
    },
    renderCardListModalContent: function (build, upgradesToShow, mode) {
        var $modalContent = $('<div class="card-image-list" id="modal-card-image-list-' + mode + '">');
        var $upgradeList = $('<ul>');

        _.forEach(upgradesToShow, function (item) {
            var $upgrade = $('<li><img src="/components/xwing-data/images/' + item.image + '" alt="' + item.name + '"></li>');

            if (mode === 'buy') {
                if (build.currentXp >= item.points) {
                    // We have enough XP to buy this item
                    $upgrade.on('click', function () {
                        $(this).trigger('select', {
                            selectedUpgradeEvent: 'view.upgrades.buy',
                            selectedUpgradeId: item.id,
                            text: item.name + ': ' + item.hotacPoints + 'XP'
                        });
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
                        selectedUpgradeId: item.id,
                        text: item.name
                    });
                });
            }

            $upgradeList.append($upgrade);
        });

        $modalContent.append($upgradeList);

        return $modalContent;
    },
    renderPilotAbilityModalContent: function (build, abilitiesToShow, mode) {
        var $modalContent = $('<div class="pilot-ability-list" id="modal-pilot-ability-list">');
        var $upgradeList = $('<ul>');

        _.forEach(abilitiesToShow, function (pilotCard) {
            var upgradeCost = pilotCard.skill;
            var $upgrade = $('<li><h3>' + pilotCard.name + ' <span class="cost">(' + upgradeCost + 'XP)</span></h3><p>' + pilotCard.text + '</p></li>');

            if (mode === 'buy') {
                if (build.currentXp >= upgradeCost) {
                    if (build.pilotSkill >= pilotCard.skill) {
                        // We have enough XP to buy this item
                        $upgrade.on('click', function () {
                            $(this).trigger('select', {
                                selectedUpgradeEvent: 'view.pilotAbilities.buy',
                                selectedUpgradeId: pilotCard.id,
                                text: pilotCard.name + ': ' + pilotCard.skill + 'XP'
                            });
                        });
                    } else {
                        // not high enough PS level yet
                        $upgrade.addClass('disabled');
                    }
                } else {
                    // not enough XP
                    $upgrade.addClass('cannot-afford');
                }
            } else {
                // Mode is to equip existing ability
                $upgrade.on('click', function () {
                    $(this).trigger('select', {
                        selectedUpgradeEvent: 'view.upgrades.equipAbility',
                        selectedUpgradeId: pilotCard.id,
                        text: pilotCard.name
                    });
                });
            }

            $upgradeList.append($upgrade);
        });

        $modalContent.append($upgradeList);

        return $modalContent;
    }
};
