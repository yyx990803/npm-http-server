import 'isomorphic-fetch'
import debug from 'debug'
import RegistryCache from './RegistryCache'

const log = debug('npm-http-server')

const getPackageInfoFromRegistry = (registryURL, packageName) => {
  let encodedPackageName
  if (packageName.charAt(0) === '@') {
    encodedPackageName = `@${encodeURIComponent(packageName.substring(1))}`
  } else {
    encodedPackageName = encodeURIComponent(packageName)
  }

  const url = `${registryURL}/${encodedPackageName}`

  return fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  }).then(response => {
    if (response.status === 404)
      return null

    return response.json()
  })
}

const OneMinute = 60 * 1000
const PackageNotFound = 'PackageNotFound'

export const getPackageInfo = (registryURL, packageName, callback) => {
  const cacheKey = registryURL + packageName

  RegistryCache.get(cacheKey, (error, value) => {
    if (error) {
      callback(error)
    } else if (value) {
      callback(null, value === PackageNotFound ? null : value)
    } else {
      log('Registry cache miss for package %s', packageName)

      getPackageInfoFromRegistry(registryURL, packageName).then(value => {
        if (value == null) {
          // Keep 404s in the cache for 5 minutes. This prevents us
          // from making unnecessary requests to the registry for
          // bad package names. In the worst case, a brand new
          // package's info will be available within 5 minutes.
          RegistryCache.set(cacheKey, PackageNotFound, OneMinute * 5)
        } else {
          RegistryCache.set(cacheKey, value, OneMinute)
        }

        callback(null, value)
      }, error => {
        // Do not cache errors.
        RegistryCache.del(cacheKey)
        callback(error)
      })
    }
  })
}
