'use strict';

var $ = require('jquery');
var _ = require('lodash');
var events = require('./events');
var abilityCardView = require('../views/abilityCard');
var pilots = require('../models/pilots');
var upgrades = require('../models/upgrades');
var environment = require('../utils/environment');

var ios11FormFixData = {};

module.exports = {
    init: function () {
        $.featherlight.defaults.beforeOpen = function () {
            module.exports.ios11FixOnOpen();
        };
        $.featherlight.defaults.afterOpen = function () {
            window.componentHandler.upgradeDom();
        };
        $.featherlight.defaults.afterClose = function () {
            module.exports.ios11FixOnClose();
        };
    },
    openTitledModal: function ($modalContent, modalTitle, cssClass) {
        var featherlightConfig = {
            variant: 'has-header ' + cssClass,
            afterOpen: function () {
                $.featherlight.defaults.afterOpen();
                var $header = $('<div class="modal-header"><div class="title">' + modalTitle + '</div></div>');
                this.$instance.find('.featherlight-content').append($header);
            }
        };
        $.featherlight($modalContent, featherlightConfig);
    },
    openConfirmModal: function (message, successCallback) {
        var $modalContent = $('<div>');
        var $message = $('<div class="message">' + message + '</div>');
        var $buttonsWrapper = $('<div class="buttons">');
        var $cancelButton = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent cancel">Cancel</button>');
        var $okButton = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent ok">Ok</button>');
        $buttonsWrapper.append($cancelButton);
        $buttonsWrapper.append($okButton);
        $modalContent.append($message);
        $modalContent.append($buttonsWrapper);

        $cancelButton.on('click', function () {
            $.featherlight.close();
        });

        $okButton.on('click', function () {
            successCallback();
            $.featherlight.close();
        });

        var featherlightConfig = {
            variant: 'confirm-buttons'
        };
        $.featherlight($modalContent, featherlightConfig);
    },
    openMessageModal: function (message) {
        var $modalContent = $('<div>');
        var $message = $('<div class="message">' + message + '</div>');
        var $buttonsWrapper = $('<div class="buttons">');
        var $okButton = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent ok">Ok</button>');
        $buttonsWrapper.append($okButton);
        $modalContent.append($message);
        $modalContent.append($buttonsWrapper);

        $okButton.on('click', function () {
            $.featherlight.close();
        });

        var featherlightConfig = {
            variant: 'message'
        };
        $.featherlight($modalContent, featherlightConfig);
    },
    openOptionSelectModal: function ($modalContent, buttonText, modalTitle, tabs) {
        var numberOfTabs = 0;
        if (tabs && tabs.length > 0) {
            numberOfTabs = tabs.length;
        }
        var $newModalContent = $modalContent;
        if (tabs) {
            $newModalContent = module.exports.renderTabs(tabs);
        }

        var featherlightConfig = {
            variant: 'option-select has-header has-footer',
            afterOpen: function () {
                $.featherlight.defaults.afterOpen();
                var lastSelectedItem;

                var $header = $('<div class="modal-header"><div class="title">' + modalTitle + '</div></div>');

                var $footer = $('<div class="modal-footer">');
                var $footerInner = $('<div class="modal-footer-inner">');
                var $summary = $('<div class="summary"><span></span></div>');
                var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" disabled>' + buttonText + '</button>');
                $button.on('click', function () {
                    if (!_.isUndefined(lastSelectedItem.selectedUpgradeId)) {
                        events.trigger(lastSelectedItem.selectedUpgradeEvent, lastSelectedItem.selectedUpgradeId);
                    }
                    $.featherlight.close();
                });
                $footer.append($footerInner);
                $footerInner.append($summary);
                $footerInner.append($button);

                // Do some trickery to set the max height and allow us to have a fixed footer in the modal
                var $featherlightContent = this.$instance.find('.featherlight-content');
                var $featherlightInner = this.$instance.find('.featherlight-inner');

                var setFixedHeaderFooter = function () {
                    // unset asny max-height, so that content flows to natural size
                    $featherlightInner.css('max-height', 'none');
                    var delay = 500;
                    // Wait some time for layout then set max-height. User won't scroll immediately so
                    //  this shoudl be unnoticable
                    setTimeout(function () {
                        var innerHeight = $featherlightContent.height();
                        $featherlightInner.css('max-height', innerHeight + 'px');
                    }, delay);
                };

                this.$instance.find('.featherlight-content').append($footer);
                this.$instance.find('.featherlight-content').append($header);
                setFixedHeaderFooter();

                $featherlightInner.on('select', 'li', function (event, eventData) {
                    lastSelectedItem = eventData;
                    $button.removeAttr('disabled');
                    // deselect other list options
                    $(this).closest('ul').find('li').removeClass('selected');
                    $(this).addClass('selected');
                    var $text = '<span>' + eventData.text + '</span>';
                    $summary.html($text);
                });

                $featherlightInner.on('click', '.mdl-tabs__tab', function () {
                    $button.attr('disabled', 'disabled');
                    lastSelectedItem = undefined;
                    $summary.html('');
                    var newTabButtonText = $(this).attr('button-text');
                    $button.text(newTabButtonText);
                    setFixedHeaderFooter();
                });
            }
        };
        if (numberOfTabs) {
            if (numberOfTabs > 0) {
                featherlightConfig.variant += ' has-tabs';
            }
            if (numberOfTabs > 2) {
                featherlightConfig.variant += ' many-tabs';
            }
        }
        $.featherlight($newModalContent, featherlightConfig);
    },
    renderTabs: function (tabsObject) {
        var $modalContent = $('<div>');

        if (tabsObject.length > 1) {
            // tab link elements
            var $tabsBar = $('<div class="mdl-tabs__tab-bar">');
            _.each(tabsObject, function (tab) {
                var tabId = tab.$content.attr('id');
                var $tabLink = $('<a href="#' + tabId + '" class="mdl-tabs__tab" button-text="' + tab.buttonLabel + '">' + tab.name + '</a>');
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
    openDocsModal: function ($modalContent) {
        var featherlightConfig = {
            variant: 'content-typography'
        };
        $.featherlight($modalContent, featherlightConfig);
    },
    // Accepts either object of pilot model or integer ID
    openAbilityCardModal: function (abilityPilot, buttonType) {
        var pilotModel = abilityPilot;
        if (_.isInteger(abilityPilot)) {
            // We were passed pilot id as a number
            pilotModel = pilots.getById(abilityPilot);
        }
        var $wrapper = $('<div></div>');
        var $card = abilityCardView.renderElement(pilotModel);
        $wrapper.append($card);

        if (buttonType) {
            var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"></button>');
            if (buttonType === 'equip') {
                $button.text('Equip');
                $button.attr('equip-ability', pilotModel.id);
            }
            if (buttonType === 'equip-disabled') {
                $button.text('Equip');
                $button.attr('disabled', '');
            }
            if (buttonType === 'unequip') {
                $button.text('Unequip');
                $button.attr('unequip-ability', pilotModel.id);
            }
            var $buttonWrapper = $('<div class="button-wrapper"></div>');
            $buttonWrapper.append($button);
            $wrapper.append($buttonWrapper);
        }

        var featherlightConfig = {
            variant: 'card-preview-modal',
            closeOnClick: 'anywhere'
        };
        $.featherlight($wrapper, featherlightConfig);
    },
    openUpgradeCardModal: function (upgrade, buttonType) {
        var upgradeToShow = upgrade;
        if (_.isInteger(upgrade)) {
            // We were passed pilot id as a number
            upgradeToShow = upgrades.getById(upgrade);
        }
        var $wrapper = $('<div></div>');
        var $cardsWrapper = $('<div class="cards-wrapper"></div>');
        $wrapper.append($cardsWrapper);

        $cardsWrapper.append('<img src="/components/xwing-data/images/' + upgradeToShow.image + '" alt="Card image for ' + upgradeToShow.name + '">');
        if (upgradeToShow.otherSide) {
            $cardsWrapper.addClass('dual-card');
            $cardsWrapper.append('<img src="/components/xwing-data/images/' + upgradeToShow.otherSide.image + '" alt="Card image for ' + upgradeToShow.otherSide.name + '">');
        }

        if (buttonType) {
            var $button = $('<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"></button>');
            if (buttonType === 'equip') {
                $button.text('Equip');
                $button.attr('equip-card', upgradeToShow.id);
            }
            if (buttonType === 'equip-disabled') {
                $button.text('Equip');
                $button.attr('disabled', '');
            }
            if (buttonType === 'unequip') {
                $button.text('Unequip');
                $button.attr('unequip-card', upgradeToShow.id);
            }
            var $buttonWrapper = $('<div class="button-wrapper"></div>');
            $buttonWrapper.append($button);
            $wrapper.append($buttonWrapper);
        }

        var featherlightConfig = {
            variant: 'card-preview-modal',
            closeOnClick: 'anywhere'
        };
        $.featherlight($wrapper, featherlightConfig);
    },
    ios11FixOnOpen: function () {
        // Hack to fix scroll bug on iOS 11
        // https://hackernoon.com/how-to-fix-the-ios-11-input-element-in-fixed-modals-bug-aaf66c7ba3f8
        if (environment.isIos()) {
            ios11FormFixData = {
                scrollTop: $(document).scrollTop(),
                overflow: document.body.style.overflow,
                height: document.body.style.height,
                width: document.body.style.width,
                position: document.body.style.position
            };

            document.body.style.overflow = 'hidden';
            document.body.style.height = '100%';
            document.body.style.width = '100%';
            document.body.style.position = 'fixed';
        }
    },
    ios11FixOnClose: function () {
        // Hack to fix scroll bug on iOS 11
        // https://hackernoon.com/how-to-fix-the-ios-11-input-element-in-fixed-modals-bug-aaf66c7ba3f8
        // $('.container').show();
        if (environment.isIos()) {
            $(document).scrollTop(ios11FormFixData.scrollTop);
            document.body.style.overflow = ios11FormFixData.overflow;
            document.body.style.height = ios11FormFixData.height;
            document.body.style.width = ios11FormFixData.width;
            document.body.style.position = ios11FormFixData.position;
        }
    }
};
