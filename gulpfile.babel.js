import gulp from 'gulp'
import {
  resolve
} from 'path'
import run from 'gulp-run-command'

const IMPUT = resolve('.', 'index.js')
const OUTPUT = resolve('.', 'index.es5.js')

gulp.task('clean', run(`rimraf ${OUTPUT}`))
gulp.task('build', ['clean'], run(`babel ${IMPUT} --out-file ${OUTPUT}`))