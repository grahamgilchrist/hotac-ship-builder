'use strict';

const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');

module.exports = function (options) {

    const defaultOptions = {
        jsSourceFiles: 'js-src/**/*.js',
        compileFiles: {
            main: {
                src: 'js-src/main.js',
                dest: 'js/main.js'
            },
            serviceWorker: {
                src: 'js-src/service-worker.js',
                dest: 'service-worker.js'
            }
        },
        destFileDir: 'app/'
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);

    const browserifyTasks = [];

    for (let key in mergedOptions.compileFiles) {
        const taskName = 'browserify:' + key;
        browserifyTasks.push(taskName);
        const item = mergedOptions.compileFiles[key];
        gulp.task(taskName, function () {
            const bundleStream = browserify(item.src).bundle();
            const vinylStream = bundleStream.pipe(source(item.dest));
            return vinylStream.pipe(gulp.dest(mergedOptions.destFileDir));
        });
    }

    // Make one task with all the separate browserify tasks
    gulp.task('browserify', browserifyTasks);

    gulp.task('browserify:watch', function () {
        gulp.watch(mergedOptions.jsSourceFiles, [
            'browserify'
        ]);
    });
};
