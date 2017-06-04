'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const sassLint = require('gulp-sass-lint');

module.exports = function (options) {

    const optionDefaults = {
        sassFiles: [
            'sass/**/*.sass'
        ],
        sassDest: 'app/styles',
        sassOptions: {
            outputStyle: 'compressed',
            sourceMap: true,
            // outFile needed by sourcemaps
            outFile: 'test'
        },
        sassLintOptions: {}
    };

    const mergedOptions = Object.assign({}, optionDefaults, options);

    gulp.task('sass', function () {
        return gulp.src(mergedOptions.sassFiles)
            .pipe(sass(mergedOptions.sassOptions).on('error', sass.logError))
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest(mergedOptions.sassDest));
    });

    gulp.task('sass:watch', function () {
        gulp.watch(mergedOptions.sassFiles, ['sass']);
    });

    gulp.task('sass-lint', function () {
        return gulp.src(mergedOptions.sassFiles)
            .pipe(sassLint(mergedOptions.sassLintOptions))
            .pipe(sassLint.format())
            .pipe(sassLint.failOnError());
    });
};
