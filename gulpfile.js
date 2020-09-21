'use strict';

const { src, dest, parallel, series, watch } = require('gulp'),
  browserSync = require('browser-sync').create(),// модуль для запуска сервера  
  concat = require('gulp-concat'), // модуль для обьеденения js и css файлов 
  uglify = require('gulp-uglify'), // модуль для сжатия js файлов
  scss = require('gulp-sass'), // модуль пепроцесор 
  cleancss = require('gulp-clean-css'),
  htmlmin = require('gulp-htmlmin'),
  imagemin = require('gulp-imagemin'),
  autoprefixer = require('gulp-autoprefixer'); // модуль для авто растановки префикосов.

function browsersync() {
  browserSync.init({
    server: { baseDir: 'app/' },// указываем путь папки где будет запускаться сервер.
    index: 'index.html', // указываем индекс файл.
    notify: false, // отключаем уведомление на странице о перезапуске страницы.
    // online: false, в случае отсуцвия интернета розкоментировать строку и удалить коментарий (по умолчанию browserSync работает через интернет и роздаёт ip adress если интернета нету browserSync не работает).
    browser: ["firefox"]
  }),

    watch('dev/*.html', series(html)).on('change', browserSync.reload),
  watch('dev/scss/*.scss', series(compScss)).on('change', browserSync.reload),
  watch('dev/js/*.js', series(mainjs)).on('change', browserSync.reload);
  

}
function html() {// работаем с html файлами 
  return src('dev/*.html') // путь к файлу
    .pipe(htmlmin({
      collapseWhitespace: true, // удалить пустое пространство ?
      removeComments: true, // удалить коментарии?
    }))
    .pipe(dest('app/')); // функция dest создаёт результат и помещает все это в нужную папку (dist в даном случае)
}

function compScss() { // работаем с препроцесором 
  return src('dev/scss/style.scss') // путь к файлу
    .pipe(scss()) // уомпилируем в css  
    .pipe(concat('style.css')) // обьеденяем в файл style.css
    .pipe(autoprefixer({ // выставляем вендорные префиксы 
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
    .pipe(cleancss(({ level: { 1: { specialComments: 0 } } }))) // минифицируем код в 1 строчку
    .pipe(dest('app/css/')); // загружаем полученный файл в папку app/css/
}

function scripts() { // работаем со скриптами библиотек
  return src([ // путь к нужным скриптам 
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/swiper/swiper-bundle.min.js',
  ])
    .pipe(concat('libs.min.js'))// обеденяем файлы библиотек в один js  файл  с именем libs.min.js
    .pipe(uglify()) // минифицируем этот файл 
    .pipe(dest('app/js/')); // добавляем файл libs.min.js в папку app/js/
}

function mainjs() { // работаем с файлом в котором непосредственно пишем код
  return src([ // путь к нему 
    'dev/js/main.js',
  ])
    .pipe(concat('main.js'))// изменяем имя (хоть это и не нужно сейчас, но вдруг в папке js будет больше чем 1 файл?)
    .pipe(uglify()) // минифицируем этот файл
    .pipe(dest('app/js/')); // добавляем файл main.js в папку app/js/
}

function images() {
  return src()
}

// єкспортируем функцию browserSync в таск browserSync
// что бы запустить функцию browserSync в терминале пишем gulp browserSync 
// ниже аналогично 
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.mainjs = mainjs;
exports.compScss = compScss;
exports.html = html;


exports.default = parallel(scripts, mainjs, compScss, html, browsersync);