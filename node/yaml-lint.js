'use strict';

const gulp = require('gulp');
const yaml = require('gulp-yaml-validate');

module.exports = function (options) {
    const defaultOptions = {
        yamlFiles: [
            '**/*.yaml',
            '**/*.yml',
            '!node_modules/**/*'
        ]
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);

    gulp.task('yaml-lint', () => {
        return gulp.src(mergedOptions.yamlFiles)
            .pipe(yaml());
    });
};
