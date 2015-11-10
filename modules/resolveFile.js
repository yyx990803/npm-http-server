import { stat as statFile } from 'fs'

const ResolveExtensions = [ '', '.js', '.json' ]

/**
 * Resolves a path like "lib/index" into "lib/index.js" or
 * "lib/index.json" depending on which one is available, similar
 * to how require('lib/index') does.
 */
function resolveFile(file, callback) {
  ResolveExtensions.reduceRight(function (next, ext) {
    return function () {
      statFile(file + ext, function (error, stat) {
        if (stat && stat.isFile()) {
          callback(null, file + ext)
        } else if (error && error.code !== 'ENOENT') {
          callback(error)
        } else {
          next()
        }
      })
    }
  }, callback)()
}

export default resolveFile
