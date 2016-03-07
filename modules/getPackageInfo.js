import LRU from 'lru-cache'
import { createFetch, accept, parseJSON } from 'http-client'

const fetch = createFetch(
  accept('application/json'),
  parseJSON()
)

function getPackageInfoFromRegistry(registryURL, packageName, callback) {
  let encodedPackageName
  if (packageName.charAt(0) === '@') {
    encodedPackageName = `@${encodeURIComponent(packageName.substring(1))}`
  } else {
    encodedPackageName = encodeURIComponent(packageName)
  }

  const url = `${registryURL}/${encodedPackageName}`

  fetch(url).then(
    response => callback(null, response),
    callback
  )
}

const OneMinute = 60 * 1000
const RegistryCache = LRU({
  max: 500,
  maxAge: OneMinute
})

function getPackageInfo(registryURL, packageName, callback) {
  const cacheKey = registryURL + packageName
  const info = RegistryCache.get(cacheKey)

  if (info) {
    callback(null, info)
  } else {
    getPackageInfoFromRegistry(registryURL, packageName, function (error, registryInfo) {
      if (registryInfo)
        RegistryCache.set(cacheKey, registryInfo)

      callback(error, registryInfo)
    })
  }
}

export default getPackageInfo
