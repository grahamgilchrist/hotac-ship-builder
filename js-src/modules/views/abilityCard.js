'use strict';

var $ = require('jquery');
var templateUtils = require('../utils/templates');

module.exports = {
    renderHtml: function (ability) {
        var escapedText = ability.text.replace(/"/g, '&quot;');
        var context = {
            ability: ability,
            escapedText: escapedText
        };
        var html = templateUtils.renderHTML('upgrades/ability-card', context);

        return html;
    },
    renderElement: function (ability) {
        var html = module.exports.renderHtml(ability);
        var $card = $(html);

        return $card;
    }
};
