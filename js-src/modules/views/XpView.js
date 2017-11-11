'use strict';

var $ = require('jquery');

module.exports = {
    renderXp: function (build) {
        $('[bind-xp-current]').text(build.currentXp);
    }
};
