import { get } from 'request'

const RegistryURL = process.env.npm_package_config_registryURL

function getPackageInfo(packageName, callback) {
  var encodedPackageName
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

export default getPackageInfo
