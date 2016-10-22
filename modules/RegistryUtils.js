import 'isomorphic-fetch'
import debug from 'debug'
import createLRUCache from 'lru-cache'

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
const RegistryCache = createLRUCache({
  max: 1000
})

export const getPackageInfo = (registryURL, packageName, callback) => {
  const cacheKey = registryURL + packageName

  let promise = RegistryCache.get(cacheKey)

  if (!promise) {
    log('Registry cache miss for package %s', packageName)

    promise = getPackageInfoFromRegistry(registryURL, packageName)

    // Immediately cache the promise so we don't make concurrent
    // requests for the same package in the same minute.
    RegistryCache.set(cacheKey, promise, OneMinute)

    promise.then(
      value => {
        // Keep 404s in the cache for 5 minutes. This prevents us
        // from making unnecessary requests to the registry for
        // bad package names. In the worst case, a brand new
        // package's info will be available within 5 minutes.
        if (value == null)
          RegistryCache.set(cacheKey, promise, OneMinute * 5)

        return value
      },
      error => {
        // Do not cache errors.
        RegistryCache.del(cacheKey)
        throw error
      }
    )
  }

  promise.then(value => callback(null, value), callback)
}
