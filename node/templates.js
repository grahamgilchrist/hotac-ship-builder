'use strict';

const gulp = require('gulp');
const templateStore = require('gulp-template-store');

module.exports = function (options) {

    const defaultOptions = {
        source: 'app/templates/**/*.html',
        base: 'app/templates/',
        destFileDir: './js-src/generated/',
        destFileName: 'templates.js'
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);

    gulp.task('templates:compile', function () {
        return gulp.src(mergedOptions.source)
            .pipe(templateStore({
                name: mergedOptions.destFileName,
                variable: 'module.exports',
                base: mergedOptions.base,
                bare: false
            }))
            .pipe(gulp.dest(mergedOptions.destFileDir));
    });

    gulp.task('templates:watch', function () {
        gulp.watch(mergedOptions.source, [
            'templates:compile'
        ]);
    });
};
