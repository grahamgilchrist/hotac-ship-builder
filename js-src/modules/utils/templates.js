'use strict';

var $ = require('jquery');
var _ = require('lodash');

module.exports = {
    // Loads lodash template from URL, render content to $element, and returns promise
    render: function (url, $element, contextObject, contextName) {
        var newContextName = contextName || 'data';
        var templatePromise = $.get(url);

        var renderTemplate = function (templateContent) {
            var compiled = _.template(templateContent);
            var templateOptions = {};
            templateOptions[newContextName] = contextObject;
            var printViewHtml = compiled(templateOptions);
            $element.html(printViewHtml);
        };

        return templatePromise.then(renderTemplate);
    }
};
