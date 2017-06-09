'use strict';

var $ = window.jQuery = require('jquery');
var pageController = require('./modules/controllers/page');
var modalController = require('./modules/controllers/modals');

var ready = function () {
    pageController.init();
    modalController.init();
};

$(document).ready(ready);
