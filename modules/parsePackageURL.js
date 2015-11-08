import { parse as parseURL } from 'url'

const PathnameFormat = /^\/((?:@[^\/@]+\/)?[^\/@]+)(?:@([^\/]+))?(\/.+)?$/

function parsePackageURL(requestURL) {
  const url = parseURL(requestURL)
  const match = PathnameFormat.exec(url.pathname)

  if (match == null)
    return null

  return {                  // If the URL is /@scope/name@version/path.js?bundle:
    packageName: match[1],  // @scope/name
    version: match[2],      // version
    filename: match[3],     // /path.js
    search: url.search      // ?bundle
  }
}

export default parsePackageURL
