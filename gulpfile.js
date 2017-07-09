'use strict';

var gulp = require('gulp');

var fs = require('fs');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var del = require('del');
var rollup     = require('gulp-rollup');
var rollupIncludePaths = require('rollup-plugin-includepaths');
var rename = require('gulp-rename');
var util = require( 'gulp-util');

var options = {
	src: 'src',
	dist: 'dist',
	tmp: '.tmp'
};

const includePathOptions = {
	paths: ['app/js']
};

gulp.task('default', ['clean'], function () {
	gulp.start('build');
});

gulp.task('build', function () {
	return gulp.src(['src/**/*.js'])
		// .pipe(sourcemaps.init())
		// .pipe(babel())
		// .pipe(concat('syllabary.js'))
		// .pipe(sourcemaps.write('.'))

		.pipe(rollup({
			// any option supported by Rollup can be set here.
			"format": "iife",
			"plugins": [
				require("rollup-plugin-babel")({
					"presets": [["es2015", { "modules": false }]]
				})
			],
			entry: './src/Syllabary.js'
		}))

		.pipe(gulp.dest('dist'));
});

gulp.task('buildRollup', function() {
	return gulp.src('Syllabary.js')
		.pipe(rollup({
			sourceMap: true,
			plugins: [
				rollupIncludePaths(includePathOptions)
			],
			entry: './src/Syllabary.js'
		}))
		.pipe(babel())
		.on('error', util.log)
		.pipe(rename('bundle.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('clean', function (done) {
	del([options.dist + '/', options.tmp + '/'], done);
});