import { build } from "esbuild"
import gulp from "gulp";
import { create as createBrowserSync} from "browser-sync";
import { path } from "./gulp/config/path.js";
import { plugins } from "./gulp/config/plugins.js";
import nodemon from "nodemon";


export const browserSync = createBrowserSync();

// Передаем значения в глобальную переменную
global.app = {
	isBuild: process.argv.includes('--build'),
	isDev: !process.argv.includes('--build'),
	path: path,
	gulp: gulp,
	plugins: plugins
}

// React build task using esbuild
export const react = (cb) => {
  build({
    entryPoints: ['./src/react/main.jsx'],
    bundle: true,
    outfile: './dist/js/react-bundle.js',
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
    sourcemap: true,
    define: {
      'process.env.NODE_ENV': '"development"',
    },
  }).then(() => cb()).catch(() => cb('React build failed'));
};

// Nodemon task
export const startNodemon = (cb) => {
  let started = false;
  return nodemon({
    script: 'server.js',
    watch: ['server.js'],
  }).on('start', () => {
    if (!started) {
      cb();
      started = true;
    }
  });
};

function startBrowserSync(done) {
  browserSync.init({
    proxy: 'http://localhost:3000',
    port: 4000,
    open: true,
    notify: false,
  });
  done();
}

// Импорт задач
import { copy } from "./gulp/tasks/copy.js";
import { reset } from "./gulp/tasks/reset.js";
import { html } from "./gulp/tasks/html.js";
import { server } from "./gulp/tasks/server.js";
import { scss } from "./gulp/tasks/scss.js";
import { js } from "./gulp/tasks/js.js";
import { images } from "./gulp/tasks/images.js";
import { otfToTtf, ttfToWoff, fontsStyle } from "./gulp/tasks/fonts.js";
import { svgSpriteTask } from "./gulp/tasks/svg-sprive.js";
import { zip } from "./gulp/tasks/zip.js";
import { ftp } from "./gulp/tasks/ftp.js";
import { reactTask } from "./gulp/tasks/react.js";

// Наблюдатель за изменениями в файлах
function watcher() {
	gulp.watch(path.watch.files, copy);
	gulp.watch(path.watch.html, gulp.series(html, (done) => {
  browserSync.reload();
  done();
	})); //gulp.series(html, ftp)
	gulp.watch(path.watch.scss, gulp.series(scss, (done) => {
  browserSync.reload();
  done();
	}));
	gulp.watch(path.watch.js, gulp.series(js, (done) => {
  browserSync.reload();
  done();
	}));
	gulp.watch(path.watch.images, images);
	gulp.watch('src/react/**/*.{js,jsx}', gulp.series(reactTask, (done) => {
  browserSync.reload();
  done();
	}));
}

// Последовательная обработака шрифтов
const fonts = gulp.series(otfToTtf, ttfToWoff, fontsStyle);

// Основные задачи
const mainTasks = gulp.series(reset,gulp.parallel(copy, html, scss, js, images, reactTask, fonts));

// Построение сценариев выполнения задач
const dev = gulp.series(reset, mainTasks, gulp.parallel(startNodemon, watcher, startBrowserSync));
const gulpBuild = gulp.series(reset, mainTasks);
const deployZIP = gulp.series(reset, mainTasks, zip);
const deployFTP = gulp.series(reset, mainTasks, ftp);

// Экспорт сценариев
export { svgSpriteTask }
export { dev }
export { gulpBuild }
export { deployZIP }
export { deployFTP }

// Выполнение сценария по умолчанию
gulp.task('default', dev);