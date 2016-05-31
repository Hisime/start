'use strict';

const gulp = require('gulp');
const less = require('gulp-less');
const plumberNotifier = require('gulp-plumber-notifier');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const cleanss = require('gulp-cleancss');
const sourcemaps = require('gulp-sourcemaps');
const htmlhint = require('gulp-htmlhint');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();
const ghPages = require('gulp-gh-pages');
const imagemin = require('gulp-imagemin');
const spritesmith = require('gulp.spritesmith');
const merge = require('merge-stream');

//проверка html кода
gulp.task('htmlhint', function() {
  return gulp.src('./src/html/*.html')
    .pipe(htmlhint({
      "tag-pair": true,
      }))
    .pipe(htmlhint.reporter());
});

// LESS compile
gulp.task('less', function () {
  return gulp.src('./src/less/style.less')
    .pipe(plumberNotifier())
    .pipe(less())
    .pipe(postcss([
        autoprefixer({browsers: ['last 2 version']}),
        mqpacker
    ]))
    .pipe(rename('style.css'))
    .pipe(gulp.dest('./src/css'))
    .pipe(browserSync.stream());
});

//build project
gulp.task('build', function(){
  gulp.src('./src/css/*.css')
    .pipe(cleanss())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('./build/css'));
  gulp.src('./src/*.html')
    .pipe(gulp.dest('./build/'));
  gulp.src(['./src/img/**/*.*', '!./src/img/sprite/*.*'])
    .pipe(imagemin())
    .pipe(gulp.dest('./build/img'));
  gulp.src('./src/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
  gulp.src('./src/svg/*.svg')
    .pipe(gulp.dest('./build/svg'));
});

// deploy
gulp.task('deploy', function() {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});

// browserSync
gulp.task('sync', ['less'], function(){
  browserSync.init({
    server: "./src"
    });
  //следим за less-файлами, выполняем задачу less
  gulp.watch('src/less/**/*.less', ['less']);
  gulp.watch('src/js/**/*.js').on('change', browserSync.reload);
  gulp.watch('src/*.html').on('change', browserSync.reload);
});


/* PNG Sprite */
gulp.task('sprite', function () {
    // Generate spritesheet
    var spriteData = gulp.src('src/img/sprite/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        imgPath: '../img/sprite.png',
        padding: 10,
        cssName: 'sprite.less',

    }));
    var imgStream = spriteData.img
    .pipe(gulp.dest('src/img/'));

    var cssStream = spriteData.css
        .pipe(gulp.dest('src/less/'));

    return merge(imgStream, cssStream);
});
