'use strict';

var $ = require('jquery');
var enemies = require('../models/enemies');
var events = require('../controllers/events');
var templateUtils = require('../utils/templates');

module.exports = {
    renderTable: function (enemyData) {
        var $wrapperElement = $('[view-bind=enemies-table]');

        var context = {
            enemies: enemies,
            enemyData: enemyData
        };

        var viewHtml = templateUtils.renderHTML('enemies', context);
        var $newElement = $(viewHtml);

        $newElement.on('click', 'button[add-enemy]', function () {
            var xws = $(this).attr('add-enemy');
            module.exports.addEnemy(1, xws);
        });
        $newElement.on('click', 'button[remove-enemy]', function () {
            var xws = $(this).attr('remove-enemy');
            module.exports.addEnemy(-1, xws);
        });
        $wrapperElement.empty().append($newElement);

        // re-bind material lite for new buttons
        window.componentHandler.upgradeDom();
    },
    addEnemy: function (amount, xws) {
        events.trigger('view.enemies.adjustCount', {
            xws: xws,
            amount: amount
        });
    }
};
