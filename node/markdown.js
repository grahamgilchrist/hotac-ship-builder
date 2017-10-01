'use strict';

const gulp = require('gulp');
const markdown = require('gulp-markdown');

module.exports = function () {
    const markdownFiles = 'docs/**/*.md';

    gulp.task('markdown', function () {
        return gulp.src(markdownFiles)
            .pipe(markdown())
            .pipe(gulp.dest('app/docs'));
    });

    gulp.task('markdown:watch', function () {
        gulp.watch(markdownFiles, ['markdown']);
    });
};
