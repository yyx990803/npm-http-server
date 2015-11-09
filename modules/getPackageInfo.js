import { get } from 'request'
import LRU from 'lru-cache'

const RegistryURL = process.env.npm_package_config_registryURL

function getPackageInfoFromRegistry(packageName, callback) {
  let encodedPackageName
  if (packageName.charAt(0) === '@') {
    encodedPackageName = `@${encodeURIComponent(packageName.substring(1))}`
  } else {
    encodedPackageName = encodeURIComponent(packageName)
  }

  get({
    uri: `${RegistryURL}/${encodedPackageName}`,
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

function getPackageInfo(packageName, callback) {
  let info = RegistryCache.get(packageName)

  if (info) {
    callback(null, info)
  } else {
    getPackageInfoFromRegistry(packageName, function (error, info) {
      if (info)
        RegistryCache.set(packageName, info)

      callback(error, info)
    })
  }
}

export default getPackageInfo
