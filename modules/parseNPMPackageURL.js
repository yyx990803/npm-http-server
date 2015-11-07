const PathnameFormat = /^\/((?:(@[^\/@]+)\/)?([^\/@]+)(?:@([^\/]+))?)(\/.+)?$/

function parseNPMPackageURL(pathname) {
  const match = PathnameFormat.exec(pathname)

  if (match == null)
    return null

  return {
    packageSpec: match[1],
    scope: match[2],
    packageName: match[3],
    version: match[4],
    filename: match[5]
  }
}

export default parseNPMPackageURL
