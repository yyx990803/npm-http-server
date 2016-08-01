import debug from 'debug'
import 'isomorphic-fetch'
import { createFetch, accept, parseJSON } from 'http-client'
import createLRUCache from 'lru-cache'

const log = debug('npm-http-server')

const fetch = createFetch(
  accept('application/json'),
  parseJSON()
)

const getPackageInfoFromRegistry = (registryURL, packageName) => {
  let encodedPackageName
  if (packageName.charAt(0) === '@') {
    encodedPackageName = `@${encodeURIComponent(packageName.substring(1))}`
  } else {
    encodedPackageName = encodeURIComponent(packageName)
  }

  const url = `${registryURL}/${encodedPackageName}`

  return fetch(url).then(response => {
    if (response.status === 404)
      return null

    return response.jsonData
  })
}

const OneMinute = 60 * 1000
const RegistryCache = createLRUCache({
  max: 500,
  maxAge: OneMinute
})

export const getPackageInfo = (registryURL, packageName, callback) => {
  const cacheKey = registryURL + packageName

  let promise = RegistryCache.get(cacheKey)

  if (!promise) {
    log('Registry cache miss for package %s', packageName)
    promise = getPackageInfoFromRegistry(registryURL, packageName)
    RegistryCache.set(cacheKey, promise)
  }

  promise.then(
    info => callback(null, info),
    error => {
      RegistryCache.del(cacheKey)
      throw error
    }
  )
}
