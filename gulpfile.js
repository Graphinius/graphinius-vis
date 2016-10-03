var gulp        = require('gulp');
var browserSync = require('browser-sync');
var glob        = require('glob');
var webpack     = require('webpack-stream');
var rename 			= require('gulp-rename');
var uglify      = require('gulp-uglify');


gulp.task('browserSync', function() {
  browserSync({
	files: ['src/core/*', 'index.html'],
    server: {
      baseDir: './'
    }
  });

  gulp.watch('src/**/*.js', ['pack']); //.on('change', browserSync.reload);
  gulp.watch(['*.html', 'build/*.js']).on('change', browserSync.reload);
});

// Packaging - Webpack
gulp.task('pack', function() {
  return gulp.src('./index.js')
    .pipe(webpack( require('./webpack.config.js') ))
    .pipe(gulp.dest('build/'));
});

// Uglification...
gulp.task('bundle', ['pack'], function() {
	return gulp.src('build/graphinius.vis.js')
		.pipe(uglify())
		.pipe(rename('graphinius.vis.min.js'))
		.pipe(gulp.dest('build'));
});

gulp.task('default', ['browserSync']);


// gulp.task('sass', function() {
//   return gulp.src('lib/plotly/scss/*')
//     .pipe(sass()) // Using gulp-sass
//     .pipe(gulp.dest('lib/plotly/css'))
// });
