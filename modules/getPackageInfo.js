import { get } from 'request'
import LRU from 'lru-cache'

const RegistryURL = process.env.npm_package_config_registryURL

const OneMinute = 60 * 1000
const RegistryCache = LRU({
  max: 500,
  maxAge: OneMinute
})

function getPackageInfo(packageName, callback) {
  let encodedPackageName
  if (packageName.charAt(0) === '@') {
    encodedPackageName = `@${encodeURIComponent(packageName.substring(1))}`
  } else {
    encodedPackageName = encodeURIComponent(packageName)
  }

  let value = RegistryCache.get(encodedPackageName)

  if (value) {
    callback(null, value)
  } else {
    get({
      uri: `${RegistryURL}/${encodedPackageName}`,
      headers: {
        'Accept': 'application/json'
      }
    }, function (error, res) {
      if (res && res.body) {
        value = JSON.parse(res.body)
        RegistryCache.set(encodedPackageName, value)
        callback(null, value)
      } else {
        callback(error)
      }
    })
  }
}

export default getPackageInfo
