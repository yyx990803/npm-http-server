import debug from 'debug'
import 'isomorphic-fetch'
import { createFetch, accept, parseJSON } from 'http-client'
import createLRUCache from 'lru-cache'

const log = debug('npm-http-server')

const fetch = createFetch(
  accept('application/json'),
  parseJSON()
)

const getPackageInfoFromRegistry = (registryURL, packageName, callback) => {
  let encodedPackageName
  if (packageName.charAt(0) === '@') {
    encodedPackageName = `@${encodeURIComponent(packageName.substring(1))}`
  } else {
    encodedPackageName = encodeURIComponent(packageName)
  }

  const url = `${registryURL}/${encodedPackageName}`

  fetch(url).then(
    response => {
      if (response.status === 404) {
        callback(null, null)
      } else {
        callback(null, response.jsonData)
      }
    },
    callback
  )
}

const OneMinute = 60 * 1000
const RegistryCache = createLRUCache({
  max: 500,
  maxAge: OneMinute
})

export const getPackageInfo = (registryURL, packageName, callback) => {
  const cacheKey = registryURL + packageName
  const info = RegistryCache.get(cacheKey)

  if (info) {
    callback(null, info)
  } else {
    log('Registry cache miss for package %s', packageName)

    getPackageInfoFromRegistry(registryURL, packageName, (error, registryInfo) => {
      if (!error)
        RegistryCache.set(cacheKey, registryInfo)

      callback(error, registryInfo)
    })
  }
}
