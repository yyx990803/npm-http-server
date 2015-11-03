const URLFormat = /^\/([^\/]+)(\/.+)$/

function parseNPMPackageURL(pathname) {
  const match = URLFormat.exec(pathname)

  if (match == null)
    return null

  return {
    packageSpec: match[1],
    filename: match[2]
  }
}

export default parseNPMPackageURL
