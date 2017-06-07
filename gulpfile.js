'use strict';

const gulp = require('gulp');
require('./node/server')();
require('./node/browserify')();
require('./node/sass')();
require('./node/eslint')();
require('./node/json-lint')();
require('./node/yaml-lint')();

// Add some general task aliases
gulp.task('lint', [
    'eslint',
    'sass-lint',
    'yaml-lint',
    'jsonlint'
]);

gulp.task('watch', [
    'sass:watch',
    'browserify:watch'
]);

gulp.task('dev', [
    'build',
    'server',
    'watch'
]);

gulp.task('build', [
    'browserify',
    'sass'
]);

gulp.task('default', ['build']);
