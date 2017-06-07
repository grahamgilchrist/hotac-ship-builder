'use strict';

var $ = require('jquery');
var pageController = require('./modules/controllers/page');

var ready = function () {
    pageController.init();
};

$(document).ready(ready);
