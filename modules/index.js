import http from 'http'
import { join as joinPaths } from 'path'
import { stat as statFile, readFile } from 'fs'
import { maxSatisfying as maxSatisfyingVersion } from 'semver'
import { parsePackageURL, createPackageURL, getPackage } from './PackageUtils'
import { generateDirectoryIndexHTML } from './IndexUtils'
import { generateMetadata } from './MetadataUtils'
import { getPackageInfo } from './RegistryUtils'
import { createBowerPackage } from './BowerUtils'
import { createTempPath } from './PathUtils'
import { getFileType } from './FileUtils'
import {
  sendNotFoundError,
  sendInvalidURLError,
  sendServerError,
  sendRedirect,
  sendFile,
  sendText,
  sendJSON,
  sendHTML
} from './ResponseUtils'

const OneMinute = 60
const OneDay = OneMinute * 60 * 24
const OneYear = OneDay * 365

const checkLocalCache = (dir, callback) =>
  statFile(joinPaths(dir, 'package.json'), (error, stats) => {
    callback(stats && stats.isFile())
  })

const ResolveExtensions = [ '', '.js', '.json' ]

/**
 * Resolves a path like "lib/file" into "lib/file.js" or
 * "lib/file.json" depending on which one is available, similar
 * to how require('lib/file') does.
 */
const resolveFile = (path, useIndex, callback) => {
  ResolveExtensions.reduceRight((next, ext) => {
    const file = path + ext

    return () => {
      statFile(file, (error, stats) => {
        if (error) {
          if (error.code === 'ENOENT') {
            next()
          } else {
            callback(error)
          }
        } else if (useIndex && stats.isDirectory()) {
          resolveFile(joinPaths(file, 'index'), false, (error, indexFile, indexStats) => {
            if (error) {
              callback(error)
            } else if (indexFile) {
              callback(null, indexFile, indexStats)
            } else {
              next()
            }
          })
        } else {
          callback(null, file, stats)
        }
      })
    }
  }, callback)()
}

/**
 * Creates and returns a function that can be used in the "request"
 * event of a standard node HTTP server. Options are:
 *
 * - registryURL    The URL of the npm registry (defaults to https://registry.npmjs.org)
 * - bowerBundle    A special pathname that is used to create and serve zip files required by Bower
 *                  (defaults to "/bower.zip")
 * - redirectTTL    The TTL (in seconds) for redirects (defaults to 0)
 * - autoIndex      Automatically generate index HTML pages for directories (defaults to true)
 *
 * Supported URL schemes are:
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
 * /history@^1/umd/History.min.js (redirects to max satisfying version)
 */
export const createRequestHandler = (options = {}) => {
  const registryURL = options.registryURL || 'https://registry.npmjs.org'
  const bowerBundle = options.bowerBundle || '/bower.zip'
  const redirectTTL = options.redirectTTL || 0
  const autoIndex = options.autoIndex !== false
  const maximumDepth = options.maximumDepth || Number.MAX_VALUE
  const blacklist = options.blacklist || []

  const handleRequest = (req, res) => {
    const url = parsePackageURL(req.url)

    if (url == null)
      return sendInvalidURLError(res, req.url)

    const { pathname, search, query, packageName, version, filename } = url
    const displayName = `${packageName}@${version}`

    const isBlacklisted = blacklist.indexOf(packageName) !== -1

    if (isBlacklisted)
      return sendText(res, 403, `Package ${packageName} is blacklisted`)

    // Step 1: Fetch the package from the registry and store a local copy.
    // Redirect if the URL does not specify an exact version number.
    const fetchPackage = (next) => {
      const packageDir = createTempPath(displayName)

      checkLocalCache(packageDir, (isCached) => {
        if (isCached)
          return next(packageDir) // Best case: we already have this package on disk.

        // Fetch package info from NPM registry.
        getPackageInfo(registryURL, packageName, (error, packageInfo) => {
          if (error)
            return sendServerError(res, error)

          if (packageInfo == null)
            return sendNotFoundError(res, `package "${packageName}"`)

          if (packageInfo.versions == null)
            return sendServerError(res, new Error(`Unable to retrieve info for package ${packageName}`))

          const { versions, 'dist-tags': tags } = packageInfo

          if (version in versions) {
            // A valid request for a package we haven't downloaded yet.
            const packageConfig = versions[version]
            const tarballURL = packageConfig.dist.tarball

            getPackage(tarballURL, packageDir, (error) => {
              if (error) {
                sendServerError(res, error)
              } else {
                next(packageDir)
              }
            })
          } else if (version in tags) {
            sendRedirect(res, createPackageURL(packageName, tags[version], filename, search), redirectTTL)
          } else {
            const maxVersion = maxSatisfyingVersion(Object.keys(versions), version)

            if (maxVersion) {
              sendRedirect(res, createPackageURL(packageName, maxVersion, filename, search), redirectTTL)
            } else {
              sendNotFoundError(res, `package ${displayName}`)
            }
          }
        })
      })
    }

    // Step 2: Determine which file we're going to serve and get its stats.
    // Redirect if the request targets a directory with no trailing slash.
    const findFile = (packageDir, next) => {
      if (filename === bowerBundle) {
        createBowerPackage(packageDir, (error, file) => {
          if (error) {
            sendServerError(res, error)
          } else if (file == null) {
            sendNotFoundError(res, `bower.zip in package ${displayName}`)
          } else {
            next('bower.zip', null)
          }
        })
      } else if (filename) {
        const path = joinPaths(packageDir, filename)

        // Based on the URL, figure out which file they want.
        resolveFile(path, false, (error, file, stats) => {
          if (error) {
            sendServerError(res, error)
          } else if (file == null) {
            sendNotFoundError(res, `file "${filename}" in package ${displayName}`)
          } else if (stats.isDirectory() && pathname[pathname.length - 1] !== '/') {
            // Append `/` to directory URLs
            sendRedirect(res, pathname + '/' + search, OneYear)
          } else {
            next(file.replace(packageDir, ''), stats)
          }
        })
      } else {
        // No filename in the URL. Try to serve the package's "main" file.
        readFile(joinPaths(packageDir, 'package.json'), 'utf8', (error, data) => {
          if (error)
            return sendServerError(res, error)

          let packageConfig
          try {
            packageConfig = JSON.parse(data)
          } catch (error) {
            return sendText(res, 500, `Error parsing ${displayName}/package.json: ${error.message}`)
          }

          let mainFilename
          const queryMain = query && query.main

          if (queryMain) {
            if (!(queryMain in packageConfig))
              return sendNotFoundError(res, `field "${queryMain}" in ${displayName}/package.json`)

            mainFilename = packageConfig[queryMain]
          } else {
            // The "unpkg" field allows packages to explicitly declare the
            // file to serve at the bare URL.
            if (typeof packageConfig.unpkg === 'string') {
              mainFilename = packageConfig.unpkg
            } else if (typeof packageConfig.browser === 'string') {
              // fallback to the "browser" field if declared
              mainFilename = packageConfig.browser
            } else {
              // If there is no main, use "index" (same as npm).
              mainFilename = packageConfig.main || 'index'
            }
          }

          resolveFile(joinPaths(packageDir, mainFilename), true, (error, file, stats) => {
            if (error) {
              sendServerError(res, error)
            } else if (file == null) {
              sendNotFoundError(res, `main file "${mainFilename}" in package ${displayName}`)
            } else {
              next(file.replace(packageDir, ''), stats)
            }
          })
        })
      }
    }

    // Step 3: Send the file, JSON metadata, or HTML directory listing.
    const serveFile = (baseDir, path, stats) => {
      if (query.json != null) {
        generateMetadata(baseDir, path, stats, maximumDepth, (error, metadata) => {
          if (metadata) {
            sendJSON(res, metadata, OneYear)
          } else {
            sendServerError(res, `unable to generate JSON metadata for ${displayName}${filename}`)
          }
        })
      // TODO: Remove "stats == null" check when we remove Bower support.
      } else if (stats == null || stats.isFile()) {
        sendFile(res, joinPaths(baseDir, path), stats, OneYear)
      } else if (autoIndex && stats.isDirectory()) {
        getPackageInfo(registryURL, packageName, (error, packageInfo) => {
          if (error) {
            sendServerError(res, `unable to generate index page for ${displayName}${filename}`)
          } else {
            generateDirectoryIndexHTML(packageInfo, version, baseDir, path, (error, html) => {
              if (html) {
                sendHTML(res, html, OneYear)
              } else {
                sendServerError(res, `unable to generate index page for ${displayName}${filename}`)
              }
            })
          }
        })
      } else {
        sendInvalidURLError(res, `${displayName}${filename} is a ${getFileType(stats)}`)
      }
    }

    fetchPackage(packageDir => {
      findFile(packageDir, (file, stats) => {
        serveFile(packageDir, file, stats)
      })
    })
  }

  return handleRequest
}

/**
 * Creates and returns an HTTP server that serves files from NPM packages.
 */
export const createServer = (options) =>
  http.createServer(
    createRequestHandler(options)
  )
