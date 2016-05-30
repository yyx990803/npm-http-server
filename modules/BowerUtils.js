import { join as joinPaths } from 'path'
import { stat as statFile, readFile, createWriteStream } from 'fs'
import archiver from 'archiver'

const generateZip = (packageDir, packageVersion, callback) => {
  readFile(joinPaths(packageDir, 'bower.json'), 'utf8', (error, bowerJSON) => {
    if (error) {
      callback(error)
      return
    }

    const bowerConfig = Object.assign(JSON.parse(bowerJSON), { version: packageVersion })
    const main = bowerConfig.main
    const files = Array.isArray(main) ? main : [ main ]
    const bowerZip = joinPaths(packageDir, 'bower.zip')
    const out = createWriteStream(bowerZip)

    const zip = archiver('zip', {})
    let callbackWasCalled = false

    const onError = (error) => {
      if (callbackWasCalled)
        return

      callbackWasCalled = true
      callback(error)
    }

    const onFinish = () => {
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
    files.forEach(file => {
      zip.file(joinPaths(packageDir, file), { name: file })
    })

    zip.finalize()
  })
}

export const createBowerPackage = (packageDir, callback) => {
  statFile(joinPaths(packageDir, 'bower.json'), (error, stat) => {
    if (error || !stat.isFile()) {
      callback(new Error('Missing bower.json'))
      return
    }

    readFile(joinPaths(packageDir, 'package.json'), 'utf8', (error, packageJSON) => {
      if (error) {
        callback(error)
        return
      }

      const packageVersion = JSON.parse(packageJSON).version

      generateZip(packageDir, packageVersion, callback)
    })
  })
}
