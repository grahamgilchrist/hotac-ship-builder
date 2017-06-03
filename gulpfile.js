'use strict';

const gulp = require('gulp');
const server = require('./node/server')();
const brwoserify = require('./node/browserify')();

// Add some general task aliases
gulp.task('lint', [
    'eslint'
]);

gulp.task('watch', [
    // 'sass:watch',
    'browserify:watch'
]);

gulp.task('dev', [
	'build',
    'server',
    'watch'
]);

gulp.task('build', [
    'browserify'
    // 'sass'
]);

gulp.task('default', ['build']);