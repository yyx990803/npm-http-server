import 'isomorphic-fetch'
import { fetch } from 'http-client'
import { parse as parseURL } from 'url'
import gunzip from 'gunzip-maybe'
import mkdirp from 'mkdirp'
import tar from 'tar-fs'

const URLFormat = /^\/((?:@[^\/@]+\/)?[^\/@]+)(?:@([^\/]+))?(\/.*)?$/

const decodeParam = (param) =>
  param && decodeURIComponent(param)

const ValidQueryKeys = {
  main: true
}

const queryIsValid = (query) =>
  Object.keys(query).every(key => ValidQueryKeys[key])

export const parsePackageURL = (url) => {
  const { pathname, search, query } = parseURL(url, true)

  if (!queryIsValid(query))
    return null

  const match = URLFormat.exec(pathname)

  if (match == null)
    return null

  const packageName = match[1]
  const version = decodeParam(match[2]) || 'latest'
  const filename = decodeParam(match[3])

  return {        // If the URL is /@scope/name@version/path.js?bundle:
    packageName,  // @scope/name
    version,      // version
    filename,     // /path.js
    search,       // ?main=browser
    query         // { main: 'browser' }
  }
}

export const createPackageURL = (packageName, version, filename, search) => {
  let pathname = `/${packageName}`

  if (version != null)
    pathname += `@${version}`

  if (filename != null)
    pathname += filename

  if (search)
    pathname += search

  return pathname
}

export const getPackage = (tarballURL, outputDir, callback) => {
  mkdirp(outputDir, (error) => {
    if (error) {
      callback(error)
    } else {
      let callbackWasCalled = false

      fetch(tarballURL).then(response => {
        response.body
          .pipe(gunzip())
          .pipe(tar.extract(outputDir, {
            map(header) {
              header.name = header.name.replace(/^package\//, '')
              return header
            }
          }))
          .on('finish', callback)
          .on('error', (error) => {
            if (callbackWasCalled) // LOL node streams
              return

            callbackWasCalled = true
            callback(error)
          })
      })
    }
  })
}
