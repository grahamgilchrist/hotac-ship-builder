'use strict';

var $ = require('jquery');
var _ = require('lodash');

module.exports = {
    // Loads lodash template from URL, render content to html, and returns promise
    renderHTML: function (url, contextObject, contextName) {
        var newContextName = contextName || 'data';
        var templatePromise = $.get('/templates/' + url);

        var renderTemplate = function (templateContent) {
            var templateContext = {};
            templateContext[newContextName] = contextObject;
            var compiled = _.template(templateContent);
            var viewHtml = compiled(templateContext);
            return viewHtml;
        };

        return templatePromise.then(renderTemplate);
    },
    // Loads lodash template from URL, render content to $element, and returns promise
    renderToDom: function (url, $element, contextObject, contextName) {
        var templatePromise = module.exports.renderHTML(url, contextObject, contextName);

        return templatePromise.then(function (viewHtml) {
            $element.html(viewHtml);
        });
    }
};
