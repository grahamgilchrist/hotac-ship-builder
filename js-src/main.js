'use strict';

var $ = require('jquery');
var shipController = require('./modules/controllers/ships');

var ready = function () {
    shipController.init();
};

$(document).ready(ready);
