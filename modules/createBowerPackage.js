import { join as joinPaths } from 'path'
import { stat as statFile, readFile, createWriteStream } from 'fs'
import getProperty from './getProperty'
import archiver from 'archiver'

function promisify(func) {
  return function (...args) {
    return new Promise(function (resolve, reject) {
      func(...args, function (error, data) {
        error ? reject(error) : resolve(data)
      })
    })
  }
}

const readFilePromised = promisify(readFile)
const statFilePromised = promisify(statFile)

function tryToFinish({ tarballDir }) {
  Promise.all([
      readFilePromised(joinPaths(tarballDir, 'bower.json'), 'utf8'),
      readFilePromised(joinPaths(tarballDir, 'package.json'), 'utf8')
    ])
    .then(function ([ bowerJson, packageJson ]) {
      const bowerConfig = Object.assign(JSON.parse(bowerJson), { version: packageJson.version })
      const main = getProperty(bowerConfig, 'main')
      const files = Array.isArray(main) ? main : [ main ]
      const bowerZip = joinPaths(tarballDir, 'bower.zip')
      const out = createWriteStream(bowerZip)

      return new Promise(function (resolve, reject) {
        const zip = archiver('zip', {})
        zip.on('error', reject)
        zip.pipe(out)
        out.on('error', reject)
        out.on('finish', function () {
          resolve(bowerZip)
        })

        // add `bower.json` file with updated version
        zip.append(JSON.stringify(bowerConfig, null, 2), { name: 'bower.json' })

        // add all files from `main` section of Bower config
        files.forEach(function (file) {
          zip.file(joinPaths(tarballDir, file), { name: file })
        })
        zip.finalize()
      })
    })
}

function createBowerPackage({ tarballDir }, callback) {
  statFilePromised(joinPaths(tarballDir, 'bower.json'))
    .then(function (stat) {
      if (!stat.isFile()) {
        throw new Error('bower.json is not a file')
      }
      return tryToFinish({ tarballDir })
        .then(function (bowerZip) {
          callback(null, bowerZip)
        })
        .catch(callback)
    })
    .catch(function () {
      callback(new Error('bower.json is required to create bower.zip package'))
    })
}

export default createBowerPackage
