import { stat as statFile } from 'fs'
import { sendInvalidURLError, sendServerError, sendNotFoundError, sendFile } from './ResponseUtils'
import parseNPMPackageURL from './parseNPMPackageURL'
import getExpirationDate from './getExpirationDate'
import getPackageFile from './getPackageFile'

/**
 * Serves a file from an NPM package. Supported URL schemes are:
 *
 * /history@1.12.5/umd/History.min.js (recommended)
 * /history@latest/umd/History.min.js
 * /history/umd/History.min.js (latest is implied)
 */
function serveNPMPackageFile(req, res, next) {
  const url = parseNPMPackageURL(req.path)

  if (url == null) {
    sendInvalidURLError(res, req.path)
    return
  }

  const { packageSpec, filename } = url

  if (filename == null) {
    // TODO: Serve the "main" file. #1
    sendInvalidURLError(res, req.path)
    return
  }

  getPackageFile(packageSpec, filename, function (error, file, version) {
    if (error) {
      sendServerError(res, error)
    } else if (file) {
      statFile(file, function (error) {
        if (error) {
          if (error.code === 'ENOENT') {
            sendNotFoundError(res, 'File "' + filename + '" in package ' + packageSpec)
          } else {
            sendServerError(res, error)
          }
        } else {
          sendFile(res, file, getExpirationDate(version))
        }
      })
    } else {
      sendNotFoundError(res, 'Package ' + packageSpec)
    }
  })
}

export default serveNPMPackageFile
