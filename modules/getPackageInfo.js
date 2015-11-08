import RegistryClient from 'silent-npm-registry-client'

const RegistryURL = process.env.npm_package_config_registryURL
const client = new RegistryClient

function getPackageInfo(packageName, callback) {
  client.get(`${RegistryURL}/${packageName}`, { timeout: 1000 }, callback)
}

export default getPackageInfo
