var gulp = require('gulp');
var newer = require('gulp-newer');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var debug = require('gulp-debug');

var tsProject = ts.createProject('ts/tsconfig.json');

gulp.task('build', function(){
    var tsResult = tsProject.src()
        .pipe(newer('index.js'))
        .pipe(sourcemaps.init())
        .pipe(debug({ title: 'ts: ' }))
        .pipe(ts(tsProject));
    return tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'))
        .pipe(debug({ title: 'out: ' }));
});

gulp.task('clean', function(){
    del(['index.js', 'index.js.map']);
});

gulp.task('default', ['build']);