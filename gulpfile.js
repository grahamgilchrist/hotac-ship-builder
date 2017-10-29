'use strict';

const gulp = require('gulp');
require('./node/server')();
require('./node/browserify')();
require('./node/sass')();
require('./node/eslint')();
require('./node/json-lint')();
require('./node/yaml-lint')();
require('./node/copyXwingData')();
require('./node/markdown')();
require('./node/templates')();

// Add some general task aliases
gulp.task('lint', [
    'eslint',
    'sass-lint',
    'yaml-lint',
    'jsonlint'
]);

gulp.task('watch', [
    'sass:watch',
    'markdown:watch',
    'templates:watch',
    'browserify:watch'
]);

gulp.task('dev', [
    'build',
    'server',
    'watch'
]);

gulp.task('build', [
    'copyXwingData',
    'templates:compile',
    'browserify',
    'sass',
    'markdown'
]);

gulp.task('default', ['build']);
