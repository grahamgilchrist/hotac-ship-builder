'use strict';

var $ = require('jquery');

module.exports = {
    render: function (ability) {
        var escapedText = ability.text.replace(/"/g, '&quot;');
        var $card = $('<div class="ability-card"><div class="ability-inner"><span class="title">' + ability.name + '</span><span class="name">Ability</span><span class="text">' + escapedText + '</span></div></div>');

        return $card;
    }
};
