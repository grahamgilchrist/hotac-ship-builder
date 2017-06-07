'use strict';

module.exports = {
    set: function (exportString) {
        document.location.hash = exportString;
    },
    get: function () {
        return document.location.hash;
    },
    clear: function () {
        document.location.hash = '';
    }
};
