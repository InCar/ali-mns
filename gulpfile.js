var gulp = require('gulp');
var newer = require('gulp-newer');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var replace = require('gulp-replace');
var git = require('gulp-git');
var debug = require('gulp-debug');
var Promise = require('promise');

var gitVer = { };
gulp.task('gitVer', ()=>{
    var gitTasks = new Array(4);
    gitTasks[0] = new Promise((resolve, reject)=>{
        git.exec({args: "symbolic-ref --short HEAD"}, (ex, out)=>{
            gitVer.branch = out.trim();
            resolve(gitVer.rev);
        });
    }); 
    
    gitTasks[1] = new Promise((resolve, reject)=>{
        git.exec({args: "rev-list --count HEAD"}, (ex, out)=>{
            gitVer.rev = out.trim();
            resolve(gitVer.rev);
        });
    }); 
    
    gitTasks[2] = new Promise((resolve, reject)=>{
        git.revParse({args: "--short HEAD"}, (ex, out)=>{
            gitVer.hash = out.trim();
            resolve(gitVer.hash);
        });
    });
    
    gitTasks[3] = new Promise((resolve, reject)=>{
        git.revParse({args: "HEAD"}, (ex, out)=>{
            gitVer.hash160 = out.trim();
            resolve(gitVer.hash160);
        });
    });
    
    return Promise.all(gitTasks);
});


var tsProject = ts.createProject('ts/tsconfig.json');

gulp.task('build', ['gitVer'], ()=>{
    var tsResult = tsProject.src()
        .pipe(newer('index.js'))
        .pipe(sourcemaps.init())
        .pipe(debug({ title: 'ts: ' }))
        .pipe(ts(tsProject));
    return tsResult.js
        .pipe(replace("$branch$", gitVer.branch))
        .pipe(replace("$rev$", gitVer.rev))
        .pipe(replace("$hash$", gitVer.hash))
        .pipe(replace("$hash160$", gitVer.hash160))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'))
        .pipe(debug({ title: 'out: ' }));
});

gulp.task('clean', ()=>{
    return del(['index.js', 'index.js.map']);
});

gulp.task('default', ['build']);