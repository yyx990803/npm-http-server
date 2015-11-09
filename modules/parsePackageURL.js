import { parse as parseURL } from 'url'

const PathnameFormat = /^\/((?:@[^\/@]+\/)?[^\/@]+)(?:@([^\/]+))?(\/.+)?$/

function decodeParam(param) {
  return param && decodeURIComponent(param)
}

function parsePackageURL(requestURL) {
  const url = parseURL(requestURL)
  const match = PathnameFormat.exec(url.pathname)

  if (match == null)
    return null

  return {                            // If the URL is /@scope/name@version/path.js?bundle:
    packageName: match[1],            // @scope/name
    version: decodeParam(match[2]),   // version
    filename: decodeParam(match[3]),  // /path.js
    search: url.search                // ?main=config.browserMain
  }
}

export default parsePackageURL
