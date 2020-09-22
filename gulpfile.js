'use strict'; // используем строгий режим

const { src, dest, parallel, series, watch } = require('gulp'),
  browserSync = require('browser-sync').create(),// модуль для запуска сервера  .
  concat = require('gulp-concat'), // модуль для обьеденения js и css файлов .
  uglify = require('gulp-uglify'), // модуль для сжатия js файлов.
  scss = require('gulp-sass'), // модуль для пепроцесоров .
  cleancss = require('gulp-clean-css'), //модуль для сжатия css.
  babel = require('gulp-babel'), //Babel-это транспайлер, переписывает код современного стандарта Javascript (ES2015) на более поздний. 
  htmlmin = require('gulp-htmlmin'), // сжимаем html.
  imagemin = require('gulp-imagemin'), // сжимаем картинки.
  del = require('del'), //удаляет указанные файлы и директории
  filesize = require('gulp-filesize'), // выводим в консоль розмеры файлов
  cache = require('gulp-cache'), // для чистки кеша (как я понял(но это не точно))
  newer = require('gulp-newer'), // сравнивает файлы и если исходный равен целевой равный то запрещает дейстивия
  ttf2woff = require("gulp-ttf2woff"), //конвертирует шрифты в веб-формат
  ttf2woff2 = require("gulp-ttf2woff2"), //конвертирует шрифты в веб-формат
  ttf2eot = require("gulp-ttf2eot"), //конвертирует шрифты в веб-формат // сравнивает исходный файл с вайлами которые уже внутри (допаустим папки) ели они равны то не делаем что-то
  autoprefixer = require('gulp-autoprefixer'); // модуль для авто растановки префикосов.

function browsersync() {
  browserSync.init({
    server: { baseDir: 'app/' },// указываем путь папки где будет запускаться сервер.
    index: 'index.html', // указываем индекс файл.
    notify: false, // отключаем уведомление на странице о перезапуске страницы.
    // online: false, в случае отсуцвия интернета розкоментировать строку и удалить коментарий (по умолчанию browserSync работает через интернет и роздаёт ip adress если интернета нету browserSync не работает).
    browser: ["firefox"] // google explorer есть возможность выбрать в каком браузере открывать сервер (если не выбрать то будет дефолтный)
  }),

    watch('src/*.html', series(html)).on('change', browserSync.reload), 
    watch('src/scss/*.scss', series(compScss)).on('change', browserSync.reload),
    watch('src/js/*.js', series(mainjs)).on('change', browserSync.reload),
    watch('src/fonts/*', series(fontWoff, fontWoff2, fontEot)).on('change', browserSync.reload);


}
function html() {// работаем с html файлами 
  return src('src/*.html') // путь к файлу
    .pipe(htmlmin({ // минифицируем html
      collapseWhitespace: true, // удалить пустое пространство ?
      removeComments: true, // удалить коментарии?
    }))
    .pipe(dest('app/')); // функция dest создаёт результат и помещает все это в нужную папку (dist в даном случае)
}

function compScss() { // работаем с препроцесором 
  return src([
    'node_modules/swiper/swiper-bundle.min.css',
    'node_modules/normalize.css/normalize.css',
    'src/scss/style.scss'
  ]) // путь к файлу
    .pipe(scss()) // уомпилируем в css  
    .pipe(concat('style.css')) // обьеденяем в файл style.css
    .pipe(autoprefixer({ // выставляем вендорные префиксы 
      overrideBrowserslist: ['last 10 versions'],  // префиксы для 10 последних версий браузеров 
      grid: true, // поддержка гридов для IE 
      browsers: [   // поддержка браузеров начиная от какойто версии 
        "Android >= 4", 
        "Chrome >= 20",
        "Firefox >= 24",
        "Explorer >= 11",
        "iOS >= 6",
        "Opera >= 12",
        "Safari >= 6"
      ],
    }))
    .pipe(filesize())
    .pipe(cleancss(({ level: { 1: { specialComments: 0 } } })))// минифицируем код в 1 строчку
    .pipe(dest('app/css/')) // загружаем полученный файл в папку app/css/
    .pipe(filesize());
}

function scripts() { // работаем со скриптами библиотек
  return src([ // путь к нужным скриптам 
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/swiper/swiper-bundle.min.js',
  ])
    .pipe(babel()) // поддержка стандартов ES5 (пишем мы в 6 том)
    .pipe(concat('libs.min.js'))// обеденяем файлы библиотек в один js  файл  с именем libs.min.js
    .pipe(filesize())
    .pipe(uglify()) // минифицируем этот файл 
    .pipe(dest('app/js/')) // добавляем файл libs.min.js в папку app/js/
    .pipe(filesize());
}

function mainjs() { // работаем с файлом в котором непосредственно пишем код
  return src([ // путь к нему 
    'src/js/*.js',
  ])
    .pipe(babel())// поддержка стандартов ES5 (пишем мы в 6 том)
    .pipe(concat('main.js'))// изменяем имя (хоть это и не нужно сейчас, но вдруг в папке js будет больше чем 1 файл?)
    .pipe(filesize())
    .pipe(uglify()) // минифицируем этот файл
    .pipe(dest('app/js/')) // добавляем файл main.js в папку app/js/
    .pipe(filesize());
}

function images() { // работаем  скартинками 
  return src('src/images/**/*.+(png|jpg|jpeg|gif|svg|ico|webp)') // путь к нужным картинкам 
    .pipe(filesize())
    .pipe(newer('app/images/')) // не даёт возможности работать над файлами которые уже зжаты 
    .pipe(imagemin()) // сжимаем картинки 
    .pipe(dest('app/images/')) // ложим их в нужную папку 
    .pipe(filesize());
}

function fontWoff() {// находим шрифты и пределываем их в веб формат Woff 
  return src("src/fonts/**/*.+(eot|svg|ttf|otf|woff|woff2)")
    .pipe(newer('app/fonts/'))
    .pipe(ttf2woff())
    .pipe(dest("app/fonts/"));
}
function fontWoff2() {// находим шрифты и пределываем их в веб формат woff2
  return src("src/fonts/**/*.+(eot|svg|ttf|otf|woff|woff2)")
    .pipe(newer('app/fonts/'))
    .pipe(ttf2woff2())
    .pipe(dest("app/fonts/"));
}
function fontEot() { // находим шрифты и пределываем их в веб формат  eot
  return src("src/fonts/**/*.+(eot|svg|ttf|otf|woff|woff2)")
    .pipe(newer('app/fonts/'))
    .pipe(ttf2eot())
    .pipe(dest("app/fonts/"));
}

function removeFonts() { // удаляем всё из папки app
  return del('app/fonts/*');
}
function cacheClear() { // чистим кеш
  return cache.clearAll();
}
function removeApp() { // удаляем всё из папки app
  return del('app/**/*');

}
function removeImages() { // удаляем всt картинки из папки app
  return del('app/images/*');

}
function removeImages() { // удаляем всt картинки из папки app
  return del('app/fonts/*');

}

// єкспортируем функцию browserSync в таск browserSync
// что бы запустить функцию browserSync в терминале пишем gulp browserSync 
// ниже аналогично 
// в консили пишем gulp 'имя экспорта' что бы вызвать нужную функцию и выполнить только её 
exports.browsersync = browsersync; // запускаем браузер
exports.scripts = scripts; // минимизируем и конкатинируем все js библиотеки 
exports.mainjs = mainjs; // минимизируем и конкатинируем все js файлы что написали сами 
exports.compScss = compScss; // минимизируем и конкатинируем все Scss файлы что написали сами 
exports.html = html; // минимизируем html
exports.images = images;  // минимизируем картинки
exports.removeApp = removeApp; // удалить всю папку с App
exports.removeImages = removeImages; // удалить картинки 
exports.removeFonts = removeFonts; // удалить шрифты
exports.cacheClear = cacheClear; // удалить кеш (но єто пока не точно) 
exports.fontWoff = fontWoff; // переделать шрифт в Woff
exports.fontWoff2 = fontWoff2; // переделать шрифт в Woff2
exports.fontEot = fontEot; // переделать шрифт в еot 

// export.build = 
exports.default = parallel(cacheClear, fontWoff, fontWoff2, fontEot, images, scripts, mainjs, compScss, html, browsersync);