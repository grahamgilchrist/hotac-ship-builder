'use strict';

const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');

module.exports = function (options) {

    const defaultOptions = {
        jsSourceFiles: 'js-src/**/*.js',
        jsSourceFile: 'js-src/main.js',
        destFileName: 'main.js',
        destFileDir: 'app/js/'
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);

    gulp.task('browserify', function () {
        const bundleStream = browserify(mergedOptions.jsSourceFile).bundle();
        const vinylStream = bundleStream.pipe(source(mergedOptions.destFileName));
        return vinylStream.pipe(gulp.dest(mergedOptions.destFileDir));
    });

    gulp.task('browserify:watch', function () {
        gulp.watch(mergedOptions.jsSourceFiles, [
            'browserify'
        ]);
    });
};
