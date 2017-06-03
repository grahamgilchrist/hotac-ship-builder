'use strict';

const gulp = require('gulp');
const webserver = require('gulp-webserver');

module.exports = function (options) {
    const defaultOptions = {
        livereload: true
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);

    gulp.task('server', function () {
        gulp.src('app')
            .pipe(webserver(mergedOptions));
    });
};