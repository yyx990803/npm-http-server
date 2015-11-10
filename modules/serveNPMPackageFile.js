import tmpdir from 'os-tmpdir'
import { parse as parseURL } from 'url'
import { stat as statFile, readFile } from 'fs'
import { join as joinPaths, basename } from 'path'
import { maxSatisfying as maxSatisfyingVersion } from 'semver'
import { sendFile, sendInvalidURLError, sendServerError, sendNotFoundError, sendRedirect } from './ResponseUtils'
import createPackageURL from './createPackageURL'
import parsePackageURL from './parsePackageURL'
import getPackageInfo from './getPackageInfo'
import getPackage from './getPackage'
import getProperty from './getProperty'
import getMaxAge from './getMaxAge'

const TmpDir = tmpdir()
const ResolveExtensions = [ '', '.js', '.json' ]

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

/**
 * Serves a file from an NPM package. Supported URL schemes are:
 *
 * /history@1.12.5/umd/History.min.js (recommended)
 * /history@1.12.5 (package.json's main is implied)
 *
 * Additionally, the following URLs are supported but will return a
 * temporary (302) redirect:
 *
 * /history (redirects to version, latest is implied)
 * /history/umd/History.min.js (redirects to version, latest is implied)
 * /history@latest/umd/History.min.js (redirects to version)
 */
function serveNPMPackageFile(req, res) {
  const url = parsePackageURL(req.path)

  if (url == null) {
    sendInvalidURLError(res, req.path)
    return
  }

  let { packageName, version, filename, search } = url

  if (version == null)
    version = 'latest' // Use the latest version by default

  let tarballDir = joinPaths(TmpDir, packageName + '-' + version)

  function tryToFinish() {
    if (filename) {
      const file = joinPaths(tarballDir, filename)

      resolveFile(file, function (error, file) {
        if (error) {
          sendServerError(res, error)
        } else if (file == null) {
          sendNotFoundError(res, `file "${filename}" in package ${packageName}@${version}`)
        } else {
          sendFile(res, file, getMaxAge(version))
        }
      })
    } else {
      readFile(joinPaths(tarballDir, 'package.json'), 'utf8', function (error, data) {
        if (error) {
          if (error.code === 'ENOENT') {
            sendServerError(res, new Error(`No package.json in package ${packageName}@${version}`))
          } else {
            sendServerError(res, error)
          }
        } else {
          const packageConfig = JSON.parse(data)
          const mainPath = req.query && req.query.main || 'main'

          filename = getProperty(packageConfig, mainPath)

          if (filename == null) {
            sendNotFoundError(res, `property "${mainPath}" in ${packageName}@${version}/package.json`)
          } else {
            tryToFinish()
          }
        }
      })
    }
  }

  statFile(joinPaths(tarballDir, 'package.json'), function (error, stat) {
    if (stat && stat.isFile()) {
      // Best-case scenario: we already have this package on disk.
      tryToFinish()
      return
    }

    // Fetch package info from NPM registry.
    getPackageInfo(packageName, function (error, info) {
      if (error) {
        if (error.statusCode === 404) {
          sendNotFoundError(res, `package "${packageName}"`)
        } else {
          sendServerError(res, error)
        }

        return
      }
      
      if (info == null || info.versions == null) {
        sendServerError(res, new Error(`Unable to retrieve info for package ${packageName}`))
        return
      }

      const { versions, 'dist-tags': tags } = info

      if (version in versions) {
        // A valid request for a package we haven't downloaded yet.
        const packageConfig = versions[version]
        const tarballURL = parseURL(packageConfig.dist.tarball)
        const tarballName = basename(tarballURL.pathname, '.tgz')

        tarballDir = joinPaths(TmpDir, tarballName)

        getPackage(tarballURL, tarballDir, function (error) {
          if (error) {
            sendServerError(res, error)
          } else {
            tryToFinish()
          }
        })
      } else if (version in tags) {
        sendRedirect(res, createPackageURL(packageName, tags[version], filename, search))
      } else {
        const maxVersion = maxSatisfyingVersion(Object.keys(versions), version)

        if (maxVersion) {
          sendRedirect(res, createPackageURL(packageName, maxVersion, filename, search))
        } else {
          sendNotFoundError(res, `package ${packageName}@${version}`)
        }
      }
    })
  })
}

export default serveNPMPackageFile
