'use strict';

var $ = require('jquery');
var _ = require('lodash');

var modalController = require('../controllers/modals');
var events = require('../controllers/events');
var abilityCardView = require('./abilityCard');
var upgrades = require('../models/upgrades');
var templateUtils = require('../utils/templates');
var conditions = require('../models/conditions');
var conditionsByName = conditions.keyedByName;

module.exports = {
    init: function () {
        module.exports.bindEquipButtons();
    },
    bindEquipButtons: function () {
        $(document).on('click', '[equip-card]', function () {
            var upgradeId = parseInt($(this).attr('equip-card'), 10);
            events.trigger('view.upgrades.equipUpgrade', upgradeId);
        });
        $(document).on('click', '[unequip-card]', function () {
            var upgradeId = parseInt($(this).attr('unequip-card'), 10);
            events.trigger('view.upgrades.unequipUpgrade', upgradeId);
        });
        $(document).on('click', '[equip-ability]', function () {
            var upgradeId = parseInt($(this).attr('equip-ability'), 10);
            events.trigger('view.upgrades.equipAbility', upgradeId);
        });
        $(document).on('click', '[unequip-ability]', function () {
            var upgradeId = parseInt($(this).attr('unequip-ability'), 10);
            events.trigger('view.upgrades.unequipAbility', upgradeId);
        });

        $(document).on('click', '[open-card-preview]', function () {
            var upgradeId = parseInt($(this).attr('open-card-preview'), 10);
            var buttonType = $(this).attr('preview-button');
            modalController.openUpgradeCardModal(upgradeId, buttonType);
        });

        $(document).on('click', '[open-ability-preview]', function () {
            var upgradeId = parseInt($(this).attr('open-ability-preview'), 10);
            var buttonType = $(this).attr('preview-button');
            modalController.openAbilityCardModal(upgradeId, buttonType);
        });
    },
    renderFreeSlots: function (build) {
        var $wrapperElement = $('[view-bind=free-slots-list]');

        var freeSlots = _.map(build.upgradeSlots.free, function (upgradeSlot) {
            return module.exports.renderFreeShipSlot(upgradeSlot);
        });

        var context = {
            free: freeSlots
        };

        var viewHtml = templateUtils.renderHTML('upgrades/free-slots', context);
        var $newElement = $(viewHtml);
        module.exports.bindCardPreviewOpen($newElement, build);
        module.exports.setListViewEmptyClass($wrapperElement, freeSlots);
        module.exports.setColumnCountClass($wrapperElement);
        $wrapperElement.empty().append($newElement);
    },
    renderMainSlots: function (build) {
        var $wrapperElement = $('[view-bind=main-slots-list]');

        var upgradeSlots = build.upgradeSlots;

        var enabledSlots = _.map(upgradeSlots.enabled, function (upgradeSlot) {
            return module.exports.renderShipSlot(upgradeSlot, build);
        });

        var disabledSlots = _.map(upgradeSlots.disabled, function (upgradeSlot) {
            if (build.pilotSkill < upgradeSlot.pilotSkill) {
                return module.exports.renderShipSlot(upgradeSlot, build);
            }
        });

        var context = {
            enabled: enabledSlots,
            disabled: disabledSlots
        };

        var viewHtml = templateUtils.renderHTML('upgrades/main-slots', context);
        var $newElement = $(viewHtml);
        module.exports.bindCardPreviewOpen($newElement, build);
        $wrapperElement.empty().append($newElement);
    },
    renderSlotsFromUpgrades: function (build) {
        var $wrapperElement = $('[view-bind=slots-from-upgrades-list]');

        var slotsFromUpgrades = _.map(build.upgradeSlots.slotsFromUpgrades, function (upgradeSlot) {
            return module.exports.renderShipSlot(upgradeSlot, build);
        });

        var context = {
            slotsFromUpgrades: slotsFromUpgrades
        };

        var viewHtml = templateUtils.renderHTML('upgrades/slots-from-upgrades', context);
        var $newElement = $(viewHtml);
        module.exports.bindCardPreviewOpen($newElement, build);
        $wrapperElement.empty().append($newElement);
    },
    bindCardPreviewOpen: function ($element, build) {
        var abilitiesAvailableToBuy = build.upgrades.getAbilitiesAvailableToBuy();
        $element.on('click', '[equip-slot]', function () {
            var slotType = $(this).attr('equip-slot');
            var upgradesAvailableToBuy = build.upgrades.getAvailableToBuy(slotType);
            var unusedUpgradesForType = _.filter(build.upgrades.unequipped, function (upgrade) {
                return upgrade.slot === slotType;
            });
            module.exports.clickEquipSlot(slotType, unusedUpgradesForType, build.upgrades.unequippedAbilities, upgradesAvailableToBuy, abilitiesAvailableToBuy, build);
        });

    },
    // listOrBoolean. Boolean whether items in list, or an array we can test length of
    setListViewEmptyClass: function ($viewElement, listOrBoolean) {
        // Set class on this column based on whether it is empty
        var hasItems = false;
        var $column = $viewElement.closest('.column');

        if (_.isBoolean(listOrBoolean)) {
            hasItems = listOrBoolean;
        } else if (_.isArray(listOrBoolean)) {
            hasItems = (listOrBoolean && listOrBoolean.length > 0);
        }

        if (hasItems) {
            $column.removeClass('empty').addClass('has-items');
        } else {
            $column.addClass('empty').removeClass('has-items');
        }
    },
    setColumnCountClass: function ($viewElement) {
        // Set class on wrapper based on column count
        var $columnWrapper = $viewElement.closest('.column-wrapper');
        var numColumns = $columnWrapper.find('.column.has-items').length;
        $columnWrapper.removeClass(function (index, classesString) {
            var classesArray = classesString.split(' ');
            var filteredArray = _.filter(classesArray, function (className) {
                return className.indexOf('column-count-') === 0;
            });

            return filteredArray.join(' ');
        });
        $columnWrapper.addClass('column-count-' + numColumns);
    },
    renderShipSlot: function (upgradeSlot, build) {
        var upgradesAvailableToBuy = build.upgrades.getAvailableToBuy(upgradeSlot.type);
        var abilitiesAvailableToBuy = build.upgrades.getAbilitiesAvailableToBuy();

        // Don't show this slot if we can't either buy or equip anything existing into it
        //  (for example, no titles for this ship)
        var hasUpgradesToBuy = (upgradesAvailableToBuy.length > 0);
        var hasAbilitiesToBuy = (abilitiesAvailableToBuy.length > 0);
        var hasUpgradesToEquip = _.find(build.upgrades.unequipped, {
            slot: upgradeSlot.type
        });

        if (!upgradeSlot.equipped) {
            if (upgradeSlot.type === 'Elite') {
                if (!hasUpgradesToBuy && !hasUpgradesToEquip && !hasAbilitiesToBuy) {
                    return;
                }
            } else {
                if (!hasUpgradesToBuy && !hasUpgradesToEquip) {
                    return;
                }
            }
        }

        var context = {
            build: build,
            upgradeSlot: upgradeSlot,
            iconString: upgrades.getIconString(upgradeSlot.type)
        };

        var viewHtml = templateUtils.renderHTML('upgrades/ship-slot', context);

        return viewHtml;
    },
    renderFreeShipSlot: function (upgradeSlot) {
        var context = {
            upgradeSlot: upgradeSlot,
            iconString: upgrades.getIconString(upgradeSlot.type)
        };

        var viewHtml = templateUtils.renderHTML('upgrades/free-ship-slot', context);

        return viewHtml;
    },
    renderPrintCardList: function (build) {
        var $wrapper = $('[view-bind=equipped-print-card-list]');

        var context = {
            upgrades: build.upgrades.equippedUpgrades,
            abilities: build.upgrades.equippedAbilities,
            renderCard: abilityCardView.renderHtml,
            conditions: conditionsByName
        };
        templateUtils.renderToDom('print-card-list', $wrapper, context);

        $wrapper = $('[view-bind=unequipped-print-card-list]');

        var unequippedAndDisabled = build.upgrades.unequipped.concat(build.upgrades.disabled);

        context = {
            upgrades: unequippedAndDisabled,
            abilities: build.upgrades.unequippedAbilities,
            renderCard: abilityCardView.renderHtml,
            conditions: conditionsByName
        };
        templateUtils.renderToDom('print-card-list', $wrapper, context);
    },
    renderUnequippedUpgradesList: function (build) {

        var hasUnequippedUpgrades = (build.upgrades.unequipped.length > 0 || build.upgrades.unequippedAbilities.length > 0);

        var $wrapperElement = $('[view-bind=allowed-list]');
        var context = {
            unequipped: build.upgrades.unequipped,
            unequippedAbilities: build.upgrades.unequippedAbilities,
            hasUnequippedUpgrades: hasUnequippedUpgrades,
            iconString: upgrades.getIconString
        };
        var viewHtml = templateUtils.renderHTML('upgrades/unequipped-list', context);
        var $newElement = $(viewHtml);
        module.exports.setListViewEmptyClass($wrapperElement, hasUnequippedUpgrades);
        module.exports.setColumnCountClass($wrapperElement);

        $newElement.on('click', 'li.upgrade.card', function () {
            var upgradeId = parseInt($(this).attr('upgrade-id'), 10);
            var canEquipUpgrade = build.upgrades.canEquipUpgrade(upgradeId);
            if (canEquipUpgrade) {
                modalController.openUpgradeCardModal(upgradeId, 'equip');
            } else {
                modalController.openUpgradeCardModal(upgradeId, 'equip-disabled');
            }
        });
        $newElement.on('click', 'li.upgrade.ability', function () {
            var pilotId = parseInt($(this).attr('ability-id'), 10);
            var canEquipAbilities = build.upgrades.canEquipAbilties();
            if (canEquipAbilities) {
                modalController.openAbilityCardModal(pilotId, 'equip');
            } else {
                modalController.openAbilityCardModal(pilotId, 'equip-disabled');
            }
        });

        $wrapperElement.empty().append($newElement);
    },
    renderDisabledUpgradesList: function (build) {
        var $wrapperElement = $('[view-bind=disabled-upgrades-list]');
        var context = {
            disabled: build.upgrades.disabled,
            iconString: upgrades.getIconString
        };
        module.exports.setListViewEmptyClass($wrapperElement, build.upgrades.disabled);
        module.exports.setColumnCountClass($wrapperElement);
        templateUtils.renderToDom('upgrades/disabled-list', $wrapperElement, context);
    },
    clickEquipSlot: function (upgradeType, unusedUpgrades, unusedAbilities, upgradesAvailableToBuy, abilitiesAvailableToBuy, build) {
        // open modal to choose upgrade to equip
        var tabs = module.exports.renderUpgradeModalContent(upgradeType, unusedUpgrades, unusedAbilities, upgradesAvailableToBuy, abilitiesAvailableToBuy, build);
        modalController.openOptionSelectModal(undefined, tabs[0].buttonLabel, 'Equip ' + upgradeType + ' slot', tabs);
    },
    renderUpgradeModalContent: function (upgradeType, unusedUpgrades, unusedAbilities, upgradesAvailableToBuy, abilitiesAvailableToBuy, build) {
        var tabs = [];

        if (unusedUpgrades.length > 0 || (unusedAbilities.length > 0 && upgradeType === 'Elite')) {
            var $unusedUpgradesTab = module.exports.renderCardListModalContent(upgradeType, build, unusedUpgrades, unusedAbilities, 'equip');

            tabs.push({
                name: 'Existing',
                $content: $unusedUpgradesTab,
                buttonLabel: 'Equip'
            });
        }

        var $cardTab = module.exports.renderCardListModalContent(upgradeType, build, upgradesAvailableToBuy, abilitiesAvailableToBuy, 'buy');
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
            $upgrade = $('<li><div class="upgrade-card"><img src="/components/xwing-data/images/' + card.image + '" alt="' + card.name + '"></div></li>');

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
                            selectOptions.text = '<span>' + card.name + ': ' + card.hotacPoints + 'XP</span><span class="help">Elite cards cost double (' + card.points + 'XP x 2)</span>';
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
                        text: '<span>' + card.name + '</span><span class="help">No cost to equip a purchased upgrade</span>'
                    });
                });
            }
        }
        if (abilityPilot) {
            var upgradeCost = abilityPilot.skill;
            $upgrade = $('<li></li>');
            var $card = abilityCardView.renderElement(abilityPilot);
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
