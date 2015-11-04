import mkdirp from 'mkdirp'
import tmpdir from 'os-tmpdir'
import { stat as statFile } from 'fs'
import { parse as parseURL } from 'url'
import { basename, join as joinPaths } from 'path'
import parsePackageSpec from './parsePackageSpec'
import getPackageInfo from './getPackageInfo'
import getPackage from './getPackage'

const TmpDir = tmpdir()

function getPackageFile(packageSpec, filename, callback) {
  const { name, version } = parsePackageSpec(packageSpec)

  let tarballDir = joinPaths(TmpDir, name + '-' + version)
  let file = joinPaths(tarballDir, filename)

  statFile(tarballDir, function (error, stat) {
    if (stat && stat.isDirectory()) {
      // Best case scenario-we already have this package on disk.
      callback(null, file, version)
    } else {
      // Grab package info from NPM registry.
      getPackageInfo(name, version, function (error, info) {
        if (error || info == null) {
          callback(error, null)
          return
        }

        let tarballURL = parseURL(info.dist.tarball)
        let tarballName = basename(tarballURL.pathname, '.tgz')

        // Re-compute tarballDir so we don't use e.g. history-latest
        tarballDir = joinPaths(TmpDir, tarballName)
        file = joinPaths(tarballDir, filename)

        statFile(joinPaths(tarballDir, 'package.json'), function (error) {
          if (error) {
            if (error.code === 'ENOENT') {
              // Cache miss. Fetch the tarball first.
              mkdirp(tarballDir, function (error) {
                if (error) {
                  callback(error)
                } else {
                  getPackage(tarballURL, tarballDir, function (error) {
                    callback(error, file, version)
                  })
                }
              })
            } else {
              callback(error)
            }

            return
          }

          callback(null, file, version)
        })
      })
    }
  })
}

export default getPackageFile
