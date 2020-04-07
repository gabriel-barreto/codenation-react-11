const autoprefixer = require('autoprefixer-stylus');
const browserSync = require('browser-sync').create();
const copy = require('gulp-copy');
const path = require('path');
const rimraf = require('rimraf');
const sourcemaps = require('gulp-sourcemaps');
const stylus = require('gulp-stylus');

const { dest, series, src, watch } = require('gulp');

const sourcePath = path.resolve(__dirname, 'src');
const publicPath = path.resolve(__dirname, 'public');

function clean(cb) {
  rimraf(publicPath, cb);
}

function buildStylus(cb) {
  src(`${sourcePath}/stylesheets/main.styl`)
    .pipe(
      stylus({
        'include css': true,
        use: [
          autoprefixer(
            'defaults',
            'not IE 11',
            'not IE_Mob 11',
            'maintained node versions',
          ),
        ],
      }),
    )
    .pipe(dest(`${publicPath}/css`))
    .pipe(browserSync.stream());
  cb();
}

function buildStylusMin(cb) {
  src(`${sourcePath}/stylesheets/main.styl`)
    .pipe(sourcemaps.init())
    .pipe(
      stylus({
        compress: true,
        use: [
          autoprefixer(
            'defaults',
            'not IE 11',
            'not IE_Mob 11',
            'maintained node versions',
          ),
        ],
      }),
    )
    .pipe(sourcemaps.write(`${publicPath}/css`))
    .pipe(dest(`${publicPath}/css`));
  cb();
}

function copyImages(cb) {
  src(`${sourcePath}/img/*.*`)
    .pipe(copy(publicPath, { prefix: 1 }))
    .pipe(browserSync.stream());
  cb();
}

function copyHtml(cb) {
  src(`${sourcePath}/index.html`)
    .pipe(copy(publicPath, { prefix: 1 }))
    .pipe(browserSync.stream());
  cb();
}

function serve() {
  browserSync.init({
    port: 8080,
    injectChanges: true,
    files: [`${publicPath}/**/*.{html,css}`],
    server: { baseDir: publicPath },
    watchOptions: { ignored: 'node_modules' },
  });

  watch(`${sourcePath}/stylesheets/**/*.styl`, buildStylus);
  watch(`${sourcePath}/index.html`, copyHtml);
  watch(`${sourcePath}/img/*.*`, copyImages);
}

exports.default = series(clean, copyImages, copyHtml, buildStylus, serve);
exports.build = series(clean, buildStylusMin, copyImages, copyHtml);
