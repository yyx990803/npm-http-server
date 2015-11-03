import RegistryClient from 'silent-npm-registry-client'

const RegistryURL = process.env.npm_package_config_registryURL
const client = new RegistryClient

function getPackageInfo(packageName, packageVersion, callback) {
  const packageURI = RegistryURL + '/' + packageName
  const params = { timeout: 1000 }

  client.get(packageURI, params, function (error, info) {
    if (error) {
      callback(error)
      return
    }

    if (!(packageVersion in info.versions)) {
      if (packageVersion in info['dist-tags']) {
        packageVersion = info['dist-tags'][packageVersion]
      } else {
        callback(new Error('Cannot find package ' + packageName + '@' + packageVersion))
        return
      }
    }

    callback(null, info.versions[packageVersion])
  })
}

export default getPackageInfo
