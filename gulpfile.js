var gulp = require('gulp');
var newer = require('gulp-newer');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var replace = require('gulp-replace');
var header = require('gulp-header');
var GitVersionJson = require('git-version-json');
var debug = require('gulp-debug');
var Promise = require('promise');

var tsProject = ts.createProject('ts/tsconfig.json');

gulp.task('build', [GitVersionJson.task], ()=>{
    var tsResult = tsProject.src()
        .pipe(newer('index.js'))
        .pipe(sourcemaps.init())
        .pipe(debug({ title: 'ts: ' }))
        .pipe(ts(tsProject));
    return tsResult.js
        .pipe(header("var gitVersion=${version};\n",
            { version: GitVersionJson.getGitVerStr() }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'))
        .pipe(debug({ title: 'out: ' }));
});

gulp.task('clean', ()=>{
    return del(['index.js', 'index.js.map']);
});

gulp.task('default', ['build']);
