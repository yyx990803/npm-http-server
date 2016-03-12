import { join as joinPaths } from 'path'
import { stat as statFile, readFile, createWriteStream } from 'fs'
import archiver from 'archiver'

function generateZip(tarballDir, packageVersion, callback) {
  readFile(joinPaths(tarballDir, 'bower.json'), 'utf8', function (error, bowerJSON) {
    if (error) {
      callback(error)
      return
    }

    const bowerConfig = Object.assign(JSON.parse(bowerJSON), { version: packageVersion })
    const main = bowerConfig.main
    const files = Array.isArray(main) ? main : [ main ]
    const bowerZip = joinPaths(tarballDir, 'bower.zip')
    const out = createWriteStream(bowerZip)

    const zip = archiver('zip', {})
    let callbackWasCalled = false

    function onError(error) {
      if (callbackWasCalled)
        return

      callbackWasCalled = true
      callback(error)
    }

    function onFinish() {
      if (callbackWasCalled)
        return

      callbackWasCalled = true
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

function createBowerPackage(tarballDir, callback) {
  statFile(joinPaths(tarballDir, 'bower.json'), function (error, stat) {
    if (error || !stat.isFile()) {
      callback(new Error('Missing bower.json'))
      return
    }

    readFile(joinPaths(tarballDir, 'package.json'), 'utf8', function (error, packageJSON) {
      if (error) {
        callback(error)
        return
      }

      const packageVersion = JSON.parse(packageJSON).version

      generateZip(tarballDir, packageVersion, callback)
    })
  })
}

export default createBowerPackage
