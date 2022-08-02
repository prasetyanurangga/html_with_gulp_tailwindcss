'use strict';

/* paths to source files (src), to ready files (build), as well as to those whose changes need to be monitored (watch) */
var path = {
    build: {
        html: 'assets/build/',
        js: 'assets/build/js/',
        css: 'assets/build/css/',
        img: 'assets/build/img/',
    },
    src: {
        html: 'assets/src/*.html',
        js: 'assets/src/js/*.js',
        css: 'assets/src/style/css/*.css',
        scss: 'assets/src/style/scss/*.scss',
        img: 'assets/src/img/**/*.*'
    },
    watch: {
        html: 'assets/src/**/*.html',
        js: 'assets/src/js/**/*.js',
        scss: 'assets/src/style/scss/**/*.scss',
        css: 'assets/src/style/css/**/*.css',
        img: 'assets/src/img/**/*.*'
    },
    clean: 'assets/build/*'
};

var config = {
    server: {
        baseDir: './assets/build'
    },
    notify: false
};

/* include gulp and plugins */
var gulp = require('gulp'),  // include Gulp
    webserver = require('browser-sync'), // server for work and automatic page updates
    plumber = require('gulp-plumber'), // bug tracking module
    rigger = require('gulp-rigger'), // a module to import the contents of one file into another
    sass = require('gulp-sass')(require('sass')), // module for compiling SASS (SCSS) to CSS
    cleanCSS = require('gulp-clean-css'), // CSS minification plugin
    uglify = require('gulp-uglify'), // JavaScript minification module
    clean = require('gulp-clean'), // plugin for deleting files and directories
    rename = require('gulp-rename'),
    autoprefixer = require('autoprefixer'),
    gulpAutoprefixer = require('gulp-autoprefixer'),
    tailwind = require('tailwindcss'),
    postcss = require('gulp-postcss'),
    logger = require('pino')()

logger.info('Gulp and pino are working...');

/* tasks */

// start the server
gulp.task('webserver', function () {
    logger.info('Start WebServer ...');
    webserver(config);
});

// compile html
gulp.task('html:build', function () {
    return gulp.src(path.src.html) // selection of all html files in the specified path
        .pipe(plumber()) // error tracking
        .pipe(rigger()) // attachment import
        .pipe(gulp.dest(path.build.html)) // uploading ready files
        .pipe(webserver.reload({ stream: true })); // server reboot
});

// compile styles
gulp.task('css:build', function () {
    return gulp.src(path.src.css) // get main.scss
        .pipe(plumber()) // for bug tracking
        .pipe(gulpAutoprefixer()) // add prefix
        .pipe(gulp.dest(path.build.css))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cleanCSS()) // minimize CSS
        .pipe(gulp.dest(path.build.css)) // output to build
        .pipe(webserver.reload({ stream: true })); // server restart
});

// compile styles
gulp.task('scss:build', function () {
    return gulp.src(path.src.scss) // get main.scss
        .pipe(plumber()) // for bug tracking
        .pipe(sass()) // scss -> css
        .pipe(postcss([
          tailwind,
          autoprefixer
        ]))
        .pipe(gulp.dest(path.build.css))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cleanCSS()) // minimize CSS
        .pipe(gulp.dest(path.build.css)) // output to build
        .pipe(webserver.reload({ stream: true })); // server restart
});

// compile js
gulp.task('js:build', function () {
    return gulp.src(path.src.js) // get file main.js
        .pipe(plumber()) // for bug tracking
        .pipe(rigger()) // import all files to main.js
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify()) // minimize js
        .pipe(gulp.dest(path.build.js)) // put ready file
        .pipe(webserver.reload({ stream: true })); // server restart
});



// image processing
gulp.task('image:build', function () {
    return gulp.src(path.src.img) // path to image source=
        .pipe(gulp.dest(path.build.img)); // output ready files
});

// remove catalog build
gulp.task('clean:build', function () {
    return gulp.src(path.clean, {read: false})
        .pipe(clean());
});

// clear cache
gulp.task('cache:clear', function () {
    cache.clearAll();
});


// assembly
gulp.task('build',
    gulp.series('clean:build',
        gulp.parallel(
            'html:build',
            'css:build',
            'scss:build',
            'js:build',
            'image:build'
        )
    )
);



// launching tasks when files change
gulp.task('watch', function () {
    gulp.watch(path.watch.html, gulp.series('html:build', 'scss:build', 'css:build' ));
    gulp.watch(path.watch.css, gulp.series('css:build'));
    gulp.watch(path.watch.scss, gulp.series('scss:build'));
    gulp.watch(path.watch.js, gulp.series('js:build'));
    gulp.watch(path.watch.img, gulp.series('image:build'));
});

// default tasks
gulp.task('default', gulp.series(
    'build',
    gulp.parallel('webserver','watch')
));