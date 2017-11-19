'use strict';

var $ = require('jquery');
var _template = require('lodash/template');
var templates = require('../../generated/templates');

module.exports = {
    // Loads lodash template from URL, render content to html, and returns promise
    renderRemoteHTML: function (templatePath, contextObject) {
        var templatePromise = $.get('/templates/' + templatePath);

        var renderTemplate = function (templateContent) {
            var compiled = _template(templateContent);
            var viewHtml = compiled(contextObject);
            return viewHtml;
        };

        return templatePromise.then(renderTemplate);
    },
    // Loads lodash template from URL, render content to html, and returns promise
    renderHTML: function (templatePath, contextObject) {
        var lodashTemplateFunction = templates[templatePath];

        var viewHtml = lodashTemplateFunction(contextObject);
        return viewHtml;
    },
    // Loads lodash template from URL, render content to $element, and returns promise
    renderToDom: function (templatePath, $element, contextObject) {
        var viewHtml = module.exports.renderHTML(templatePath, contextObject);
        $element.html(viewHtml);
    }
};
