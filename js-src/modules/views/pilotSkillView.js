'use strict';

var $ = require('jquery');

var events = require('../controllers/events');

module.exports = {
    init: function () {
        module.exports.bindPsButton();
    },
    bindPsButton: function () {
        $('#increase-ps').on('click', function () {
            events.trigger('view.main.increasePs');
        });
    },
    renderWithPs: function (pilotSkill) {
        $('#pilot-skill').text(pilotSkill);
        $('#pilot-skill-plus-one').text(pilotSkill + 1);
        $('#pilot-skill-next-xp-cost').text((pilotSkill + 1) * 2);
    }
};
