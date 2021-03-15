const gulp = require('gulp');
const apidoc = require('gulp-api-doc');

gulp.task('doc', () => {
  return gulp.src('functions/controllers/*.js')
  .pipe(apidoc())
  .pipe(gulp.dest('documentation'));
});
