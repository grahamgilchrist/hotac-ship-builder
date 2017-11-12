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
        $('#start-build').on('click', function (event) {
            event.preventDefault();

            var callsign = $('#callsign').val().trim();
            var playerName = $('#player-name').val().trim();
            var chosenShipId = $('#starting-ships select').val();
            var formErrors = [];

            if (!callsign || callsign.length === 0) {
                formErrors.push({
                    fieldId: 'callsign',
                    message: 'Please enter a callsign'
                });
            }

            if (!playerName || playerName.length === 0) {
                formErrors.push({
                    fieldId: 'player-name',
                    message: 'Please enter a player name'
                });
            }

            module.exports.clearFormErrors();
            if (formErrors.length > 0) {
                module.exports.setFormErrors(formErrors);
            } else {
                events.trigger('view.new.start', {
                    shipId: chosenShipId,
                    callsign: callsign,
                    playerName: playerName
                });
            }

        });
    },
    renderStartingShipsList: function () {
        var $select = $('<select>');

        // get list of starting ships
        var startingShips = ships.starting;

        // bind starting ships to DOM
        _.forEach(startingShips, function (item) {
            var $newOption = $('<option value="' + item.id + '">' + item.shipData.name + ' (' + item.startingXp + ' XP to spend)</option>');
            $select.append($newOption);
        });

        $('#starting-ships').append($select);

        module.exports.resetStartingShipsList();
    },
    reset: function () {
        module.exports.resetStartingShipsList();
        $('#callsign').val('');
        $('#player-name').val('');
    },
    resetStartingShipsList: function () {
        $('#starting-ships option').first().prop('selected', 'selected');
    },
    clearFormErrors: function () {
        $('.new .form-group').removeClass('error');
        $('.new .form-group .error').remove();
    },
    setFormErrors: function (formErrors) {

        _.forEach(formErrors, function (error) {

            var $errorField = $('#' + error.fieldId);
            if ($errorField.length > 0) {
                var $formField = $errorField.closest('.form-group');
                $formField.addClass('error');
                $formField.append('<div class="error"><div class="error-pad"></div><div class="message">' + error.message + '</div></div>');
            }
        });
    },
    hide: function () {
        $('.new').removeClass('active');
    },
    show: function () {
        $('.new').addClass('active');
    }
};
