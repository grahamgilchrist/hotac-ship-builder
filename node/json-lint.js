'use strict';

const gulp = require('gulp');
const jsonlint = require('gulp-json-lint');

module.exports = function (options) {
    const defaultOptions = {
        jsonFiles: [
            '**/*.json',
            '!node_modules/**/*'
        ]
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);

    gulp.task('jsonlint', function () {
        gulp.src(mergedOptions.jsonFiles)
            .pipe(jsonlint())
            .pipe(jsonlint.report('verbose'));
    });
};
