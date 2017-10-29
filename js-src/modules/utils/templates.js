'use strict';

var $ = require('jquery');
var _ = require('lodash');

module.exports = {
    // Loads lodash template from URL, render content to html, and returns promise
    renderHTML: function (url, contextObject) {
        var templatePromise = $.get('/templates/' + url);

        var renderTemplate = function (templateContent) {
            var compiled = _.template(templateContent);
            var viewHtml = compiled(contextObject);
            return viewHtml;
        };

        return templatePromise.then(renderTemplate);
    },
    // Loads lodash template from URL, render content to $element, and returns promise
    renderToDom: function (url, $element, contextObject) {
        var templatePromise = module.exports.renderHTML(url, contextObject);

        return templatePromise.then(function (viewHtml) {
            $element.html(viewHtml);
        });
    }
};
