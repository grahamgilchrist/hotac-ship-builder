'use strict';

var $ = require('jquery');

module.exports = {
    renderHtml: function (ability) {
        var escapedText = ability.text.replace(/"/g, '&quot;');
        var html = '<div class="ability-card"><div class="ability-inner"><span class="title">' + ability.name + '</span><span class="name">Ability  (PS ' + ability.skill + ')</span><span class="text">' + escapedText + '</span><span class="cost">' + ability.skill + '</span></div></div>';

        return html;
    },
    renderElement: function (ability) {
        var html = module.exports.renderHtml(ability);
        var $card = $(html);

        return $card;
    }
};
