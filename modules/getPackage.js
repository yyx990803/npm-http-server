import tar from 'tar-fs'
import mkdirp from 'mkdirp'
import gunzip from 'gunzip-maybe'
import { fetch } from 'http-client'

function getPackage(tarballURL, outputDir, callback) {
  mkdirp(outputDir, function (error) {
    if (error) {
      callback(error)
    } else {
      let callbackWasCalled = false

      fetch(tarballURL).then(response => {
        response.body
          .pipe(gunzip())
          .pipe(tar.extract(outputDir, {
            map: function (header) {
              header.name = header.name.replace(/^package\//, '')
              return header
            }
          }))
          .on('finish', callback)
          .on('error', function (error) {
            if (callbackWasCalled) // LOL node streams
              return

            callbackWasCalled = true
            callback(error)
          })
      })
    }
  })
}

export default getPackage
