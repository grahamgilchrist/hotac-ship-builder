'use strict';

// Data file provided by the xwing-data package have .js as extension, which node can't require.
// This task copies them into the project with a .json extension

const gulp = require('gulp');
const rename = require('gulp-rename');
const path = require('path');
const xWingDataPaths = [
    require.resolve('xwing-data/data/pilots'),
    require.resolve('xwing-data/data/ships'),
    require.resolve('xwing-data/data/upgrades'),
    require.resolve('xwing-data/data/conditions')
];

const gulpPath = process.cwd();

module.exports = function () {
    gulp.task('copyXwingData', function () {
        xWingDataPaths.forEach(function (absPath) {
            const relPath = path.relative(gulpPath, absPath);
            gulp.src(relPath)
                .pipe(rename(function (path) {
                    path.extname = '.json';
                }))
                .pipe(gulp.dest('./js-src/generated/'));
        });
    });
};
