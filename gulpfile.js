'use strict';

const gulp = require('gulp');
const sequence = require('run-sequence');

require('./node/server')();
require('./node/browserify')();
require('./node/sass')();
require('./node/eslint')();
require('./node/json-lint')();
require('./node/yaml-lint')();
require('./node/copyXwingData')();
require('./node/copyXwingAssets')();
require('./node/markdown')();
require('./node/templates')();
require('./node/uglify')();

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
    'browserify:watch',
    'uglify:watch'
]);

gulp.task('dev', [
    'build',
    'server',
    'watch'
]);

gulp.task('JsCompileAndCompress', function (done) {
    sequence('browserify', 'uglify', done);
});

gulp.task('build', [
    'copyXwingAssets',
    'copyXwingData',
    'templates:compile',
    'JsCompileAndCompress',
    'sass',
    'markdown'
]);

gulp.task('default', ['build']);
