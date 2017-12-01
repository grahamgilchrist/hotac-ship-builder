'use strict';

var $ = window.jQuery = require('jquery');
var pageController = require('./modules/controllers/page');
var modalController = require('./modules/controllers/modals');
var serviceWorker = require('./modules/controllers/service-worker');

var ready = function () {
    serviceWorker.init();
    pageController.init();
    modalController.init();
};

$(document).ready(ready);
