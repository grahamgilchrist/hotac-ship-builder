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
        // Process and create list for ship chassis slots
        var $freeShipSlots = $('#ship-slots-free');
        $freeShipSlots.empty();

        var $ul = $('<ul>');
        _.each(build.currentShip.startingUpgrades, function (upgrade) {
            var $li = module.exports.renderFreeShipSlot(upgrade, build);
            $ul.append($li);
        });
        $freeShipSlots.append($ul);

        // Process and create list for ship chassis slots
        var $shipSlots = $('#ship-slots-default');
        $shipSlots.empty();

        var upgradeSlots = build.upgradeSlots.assignedSlots;
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

        if (upgradeSlots.fromUpgrades.length > 0) {
            $ul = $('<ul>');

            _.each(upgradeSlots.fromUpgrades, function (upgradeSlot) {
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
        var filteredUpgradesByType = build.upgrades.getAvailableToBuy(upgradeSlot.type);

        // Don't show this slot if there are no available upgrades for it (e.g. a title slot for a ship with no titles)
        if (!filteredUpgradesByType || filteredUpgradesByType.length < 1) {
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
                var imageUrl = '/components/xwing-data/images/' + upgradeSlot.equipped.image;
                $slot.append('<i class="material-icons eye">remove_red_eye</i>');
                $slot.attr('data-featherlight', imageUrl);
                var $icon = $('<i class="material-icons remove">remove_circle_outline</i>');
                $li.append($icon);
                $slot.addClass('equipped');
                $icon.on('click', function () {
                    module.exports.removeEquipSlot(upgradeSlot.equipped.id, build);
                });
            } else {
                $slot.on('click', function () {
                    module.exports.clickEquipSlot(upgradeSlot.type, build.upgrades.allForType(upgradeSlot.type), filteredUpgradesByType, build);
                });
            }
        }

        return $li;
    },
    renderFreeShipSlot: function (upgrade, build, equippedUpgrades) {

        var slotHtml = '<span class="title">' + upgrade.name + '</span>';
        var equipped = false;

        var $li = $('<li></li>');
        var $slot = $('<div class="slot"></div>');
        $slot.append(module.exports.getIconString(upgrade.slot));
        $li.append($slot);

        // Is there an equipped upgrade that matches this free one?
        var matchingUpgrade = _.find(equippedUpgrades, function (item) {
            return item.id === upgrade.id;
        });

        if (matchingUpgrade) {
            equipped = true;
            _.remove(equippedUpgrades, function (item) {
                return item.id === matchingUpgrade.id;
            });
        }

        $slot.append(slotHtml);
        var $icon = $('<i class="material-icons remove">remove_circle_outline</i>');

        if (equipped) {
            var imageUrl = '/components/xwing-data/images/' + matchingUpgrade.image;
            $slot.append('<i class="material-icons eye">remove_red_eye</i>');
            $slot.attr('data-featherlight', imageUrl);
            $li.append($icon);
            $slot.addClass('equipped');
            $icon.on('click', function () {
                events.trigger('view.unequip.upgrade', upgrade.id);
            });
        } else {
            $icon = $('<i class="material-icons remove">add_circle_outline</i>');
            $li.append($icon);
            $icon.on('click', function () {
                events.trigger('view.equip.upgrade', upgrade.id);
            });
        }

        return $li;
    },
    renderUpgradesList: function (build) {
        var $unusedList = $('#unused-upgrade-list');
        $unusedList.empty();
        if (build.upgrades.unequipped.length > 0 || build.pilotAbilities.length > 0) {
            $('.unused-upgrades-wrapper').show();
            // Add purchased upgrades to the list
            _.forEach(build.upgrades.unequipped, function (upgrade) {
                var $upgradeItem = module.exports.renderUpgradeItem(upgrade);
                $unusedList.append($upgradeItem);
            });
            // Add pilot abilities to the list
            _.forEach(build.pilotAbilities, function (pilotAbility) {
                var $upgradeItem = module.exports.renderPilotUpgradeItem(pilotAbility);
                $unusedList.append($upgradeItem);
            });
        } else {
            $('.unused-upgrades-wrapper').hide();
        }

        var $disallowedList = $('#disabled-upgrade-list');
        $disallowedList.empty();
        if (build.upgrades.disabled.length > 0) {
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
        var $item = $('<li class="upgrade" data-featherlight="' + imageUrl + '">' + module.exports.getIconString(upgrade.slot) + '<span>' + upgrade.name + '</span><i class="material-icons eye">remove_red_eye</i><img class="preview" src="' + imageUrl + '"></li>');
        return $item;
    },
    renderPilotUpgradeItem: function (pilot) {
        var escapedText = pilot.text.replace(/"/g, '&quot;');
        var $item = $('<li class="upgrade" data-featherlight="' + escapedText + '" data-featherlight-type="text" data-featherlight-variant="preview-pilot-ability">' + module.exports.getIconString('Elite') + '<span>Ability: ' + pilot.name + '</span><i class="material-icons eye">remove_red_eye</i></li>');

        return $item;
    },
    getIconString: function (upgradeSlotType) {
        var iconId = upgradeSlotType.replace(' ', '').replace('-', '');
        iconId = iconId.toLowerCase();
        var iconString = '<i class="xwing-miniatures-font xwing-miniatures-font-' + iconId + '"></i>';
        return iconString;
    },
    clickEquipSlot: function (upgradeType, equippedUpgradesByType, filteredUpgrades, build) {
        // open modal to choose upgrade to equip
        var $modalContent = module.exports.renderUpgradeModalContent(upgradeType, build, equippedUpgradesByType, filteredUpgrades);
        modalController.openOptionSelectModal($modalContent, 'Buy upgrade');
    },
    removeEquipSlot: function (upgradeId) {
        events.trigger('view.upgrades.unequip', upgradeId);
    },
    renderUpgradeModalContent: function (upgradeType, build, equippedUpgrades, filteredUpgradesByType) {
        var tabs = [];

        if (equippedUpgrades.length > 0) {
            var $equippedUpgradesTab = module.exports.renderEquippedCardListModalContent(build, equippedUpgrades);
            tabs.push({
                name: 'Existing ' + upgradeType,
                $content: $equippedUpgradesTab
            });
        }

        var $tab = module.exports.renderCardListModalContent(build, filteredUpgradesByType);
        var tabName = 'Buy new ' + upgradeType;
        if (upgradeType === 'Elite') {
            tabName = 'Elite cards';
        }
        tabs.push({
            name: tabName,
            $content: $tab
        });

        if (upgradeType === 'Elite') {
            var $abilityTab = module.exports.renderPilotAbilityModalContent(build);
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
    renderCardListModalContent: function (build, filteredUpgrades) {
        var $modalContent = $('<div class="card-image-list" id="modal-card-image-list">');
        var $upgradeList = $('<ul>');

        _.forEach(filteredUpgrades, function (item) {
            var $upgrade = $('<li><img src="/components/xwing-data/images/' + item.image + '" alt="' + item.name + '"></li>');
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

            $upgradeList.append($upgrade);
        });

        $modalContent.append($upgradeList);

        return $modalContent;
    },
    renderEquippedCardListModalContent: function (build, equippedUpgrades) {
        var $modalContent = $('<div class="card-image-list" id="modal-card-image-list-equipped">');
        var $upgradeList = $('<ul>');

        _.forEach(equippedUpgrades, function (item) {
            var $upgrade = $('<li><img src="/components/xwing-data/images/' + item.image + '" alt="' + item.name + '"></li>');

            // We have enough XP to buy this item
            $upgrade.on('click', function () {
                $(this).trigger('select', {
                    selectedUpgradeEvent: 'view.upgrades.equip',
                    selectedUpgradeId: item.id,
                    text: item.name
                });
            });

            $upgradeList.append($upgrade);
        });

        $modalContent.append($upgradeList);

        return $modalContent;
    },
    renderPilotAbilityModalContent: function (build) {
        var $modalContent = $('<div class="pilot-ability-list" id="modal-pilot-ability-list">');
        var $upgradeList = $('<ul>');

        _.forEach(pilots, function (pilotCard) {
            var upgradeCost = pilotCard.skill;
            var $upgrade = $('<li><h3>' + pilotCard.name + ' <span class="cost">(' + upgradeCost + 'XP)</span></h3><p>' + pilotCard.text + '</p></li>');
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

            $upgradeList.append($upgrade);
        });

        $modalContent.append($upgradeList);

        return $modalContent;
    }
};
