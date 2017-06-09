'use strict';

var $ = require('jquery');
var _ = require('lodash');

var events = require('../controllers/events');
var ships = require('../models/ships');

module.exports = {
    init: function () {
        module.exports.renderStartingShipsList();
        module.exports.bindStartButton();
    },
    bindStartButton: function () {
        $('#start-build').on('click', function () {
            var chosenShipId = $('#starting-ships').val();
            events.trigger('view.new.start', {
                shipId: chosenShipId,
                callsign: $('#callsign').val(),
                playerName: $('#player-name').val()
            });
        });
    },
    renderStartingShipsList: function () {
        // get list of starting ships
        var filterFunction = function (item) {
            return item.starting === true;
        };

        var startingShips = _.filter(ships, filterFunction);

        // bind starting ships to DOM
        _.forEach(startingShips, function (item) {
            var $newOption = $('<option value="' + item.id + '">' + item.shipData.name + '</option>');
            $('#starting-ships').append($newOption);
        });
        module.exports.resetStartingShipsList();
    },
    reset: function () {
        module.exports.resetStartingShipsList();
    },
    resetStartingShipsList: function () {
        $('#starting-ships option').first().prop('selected', 'selected');
    },
    hide: function () {
        $('.new').removeClass('active');
    },
    show: function () {
        $('.new').addClass('active');
    }
};
