'use strict';

module.exports = {
    isIos: function () {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            return true;
        }
        return false;
    }
};
