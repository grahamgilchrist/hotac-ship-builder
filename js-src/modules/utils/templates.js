'use strict';

var $ = require('jquery');
var _ = require('lodash');

module.exports = {
    // Loads lodash template from URL, render content to $element, and returns promise
    render: function (url, $element, contextObject, contextName) {
        var newContextName = contextName || 'data';
        var templatePromise = $.get('/templates/' + url);

        var renderTemplate = function (templateContent) {
                var templateContext = {};
            templateContext[newContextName] = contextObject;
            var compiled = _.template(templateContent);
            var viewHtml = compiled(templateContext);
            $element.html(viewHtml);
        };

        return templatePromise.then(renderTemplate);
    }
};
