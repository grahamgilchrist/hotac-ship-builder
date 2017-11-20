'use strict';

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const pump = require('pump');
const fsCache = require( 'gulp-fs-cache' );
const sourcemaps = require('gulp-sourcemaps');

module.exports = function () {

    const jsDestPath = 'app/js';
    const nonMinifiedJSFiles = [
        jsDestPath + '/**/*.js',
        '!' + jsDestPath + '/**/*.min.js',
        '!' + jsDestPath + '/vendor/**/*.js',
        '!' + jsDestPath + '/maps/**/*.js'
    ];

    gulp.task('uglify', function (cb) {
        const jsCache = fsCache( '.gulp-cache/js' );

        pump([
            gulp.src(nonMinifiedJSFiles),
            sourcemaps.init(),
            jsCache,
            uglify(),
            jsCache.restore,
            sourcemaps.write('./maps'),
            rename({
                suffix: '.min'
            }),
            gulp.dest(jsDestPath)
        ],
        cb
      );
    });

    gulp.task('uglify:watch', function () {
        gulp.watch(nonMinifiedJSFiles, ['uglify']);
    });
};
