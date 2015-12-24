import { join as joinPaths } from 'path'
import { stat as statFile, readFile, createWriteStream } from 'fs'
import getProperty from './getProperty'
import archiver from 'archiver'

function generateZip({ tarballDir, packageVersion }, callback) {

  readFile(joinPaths(tarballDir, 'bower.json'), 'utf8', function (error, bowerJson) {
    if (error) {
      callback(error)
      return
    }

    const bowerConfig = Object.assign(JSON.parse(bowerJson), { version: packageVersion })
    const main = getProperty(bowerConfig, 'main')
    const files = Array.isArray(main) ? main : [ main ]
    const bowerZip = joinPaths(tarballDir, 'bower.zip')
    const out = createWriteStream(bowerZip)

    const zip = archiver('zip', {})

    // we are dealing with streams so error may be emit several times,
    // but we can call callback only once
    let resolved = false


    function onError(error) {
      if (resolved)
        return

      resolved = true
      callback(error)
    }

    function onFinish() {
      if (resolved)
        return

      resolved = true
      callback(null, bowerZip)
    }

    zip.on('error', onError)
    out.on('error', onError)
    out.on('finish', onFinish)

    zip.pipe(out)

    // add `bower.json` file with updated version
    zip.append(JSON.stringify(bowerConfig, null, 2), { name: 'bower.json' })

    // add all files from `main` section of Bower config
    files.forEach(function (file) {
      zip.file(joinPaths(tarballDir, file), { name: file })
    })
    zip.finalize()
  })
}

function createBowerPackage({ tarballDir }, callback) {
  statFile(joinPaths(tarballDir, 'bower.json'), function (error, stat) {
    if (error) {
      callback(new Error('bower.json is required to create bower.zip package'))
      return
    }

    if (!stat.isFile()) {
      callback(new Error('bower.json is not a file'))
      return
    }

    readFile(joinPaths(tarballDir, 'package.json'), 'utf8', function (error, packageJson) {
      if (error) {
        callback(error)
        return
      }

      const packageVersion = getProperty(JSON.parse(packageJson), 'version')

      generateZip({ tarballDir, packageVersion }, callback)
    })
  })
}

export default createBowerPackage
