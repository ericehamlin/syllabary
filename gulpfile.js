'use strict';

var gulp = require('gulp');

var fs = require('fs');
// var wiredep = require('wiredep').stream;
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var del = require('del');
// var wrench = require('wrench');

var options = {
	src: 'src',
	dist: 'dist',
	tmp: '.tmp'
};

gulp.task('default', ['clean'], function () {
	gulp.start('build');
});

gulp.task('build', function () {
	return gulp.src(['src/**/*.js'])
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(concat('syllabary.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'));
});

gulp.task('clean', function (done) {
	del([options.dist + '/', options.tmp + '/'], done);
});