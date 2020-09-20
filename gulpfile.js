'use strict';

const { src, dest, parallel, series, watch } = require('gulp'),
      sync         = require('browser-sync').create(),
      concat       = require('gulp-concat'),
      uglify       = require('gulp-uglify'),
      scss         = require('gulp-sass'),
      cleancss     = require('clean-css'),
      autoprefixer = require('gulp-autoprefixer');

function browserSync() {
  sync.init({
    server: { baseDir: 'app/' }, // указываем путь папки где будет запускаться сервер.

    notify: false, // отключаем уведомление на странице о перезапуске страницы
    // online: false, в случае отсуцвия интернета розкоментировать строку и удалить коментарий (по умолчанию browserSync работает через интернет и роздаёт ip adress если интернета нету browserSync не работает)
  });
}
function compScss() {
  return src('src/scss/style.scss')
    .pipe(scss())
    .pipe(concat('style.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true,
      browsers: [
        "Android >= 4",
        "Chrome >= 20",
        "Firefox >= 24",
        "Explorer >= 11",
        "iOS >= 6",
        "Opera >= 12",
        "Safari >= 6"
      ],
    }))
    // .pipe(cleancss({ level: { 1: { specialComments: 0 } } }))
    .pipe(dest('app/css/'))
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/swiper/swiper-bundle.min.js',
  ])
    .pipe(concat('libsModules.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js/'));
}
function mainjs() {
  return src([
    'src/js/main.js',
  ])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(dest('app/js/'));
}

function startWatch() {
  watch([
    'app/**/**.js',
    'app/css/style.scss',
  ], mainjs
  );
}
// єкспортируем венкцию browserSync в таск browserSync
// что бы запустить функцию browserSync в терминале пишем gulp browserSync 
// ниже аналогично 
exports.browserSync = browserSync;
exports.scripts = scripts;
exports.mainjs = mainjs;
exports.startWatch = startWatch;
exports.compScss = compScss;


exports.default = parallel(scripts, mainjs, compScss, startWatch);