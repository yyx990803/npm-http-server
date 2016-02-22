import LRU from 'lru-cache'
import { get } from 'request'

function getPackageInfoFromRegistry(registryURL, packageName, callback) {
  let encodedPackageName
  if (packageName.charAt(0) === '@') {
    encodedPackageName = `@${encodeURIComponent(packageName.substring(1))}`
  } else {
    encodedPackageName = encodeURIComponent(packageName)
  }

  get({
    uri: `${registryURL}/${encodedPackageName}`,
    headers: {
      'Accept': 'application/json'
    }
  }, function (error, res) {
    callback(error, res && res.body ? JSON.parse(res.body) : null)
  })
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
