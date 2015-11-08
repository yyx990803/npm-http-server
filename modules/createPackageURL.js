import assert from 'assert'

function createPackageURL(packageName, version, filename, search) {
  assert(
    packageName != null,
    'createPackageURL requires a packageName argument'
  )

  let url = `/${packageName}`

  if (version != null)
    url += `@${version}`

  if (filename != null)
    url += filename

  if (search)
    url += search

  return url
}

export default createPackageURL
