import csso from 'csso'

export const minifyCSS = (css) =>
  csso.minify(css).css
