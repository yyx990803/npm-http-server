import fs from 'fs'
import path from 'path'
import csso from 'csso'

export const minifyCSS = (css) =>
  csso.minify(css).css

export const readCSS = (...args) =>
  minifyCSS(fs.readFileSync(path.resolve(...args), 'utf8'))
