import { join as joinPaths} from 'path'
import { stat as statFile, readFile, createWriteStream } from 'fs'
import getProperty from './getProperty'
import archiver from 'archiver'


const promisify = func => (...args) =>
  new Promise((resolve, reject) =>
    func(...args, (error, data) => error ? reject(error) : resolve(data)))

const readFilePromised = promisify(readFile)
const statFilePromised = promisify(statFile)

const tryToFinish = ({ tarballDir }) =>
  Promise.all([
      readFilePromised(joinPaths(tarballDir, 'bower.json'), 'utf8'),
      readFilePromised(joinPaths(tarballDir, 'package.json'), 'utf8')
    ])
    .then(([ bowerJson ]) => {
      const main = getProperty(JSON.parse(bowerJson), 'main')
      const files = [ 'bower.json' ].concat(Array.isArray(main) ? main : [ main ])
      const bowerZip = joinPaths(tarballDir, 'bower.zip')
      const out = createWriteStream(bowerZip)

      return new Promise((resolve, reject) => {
        const zip = archiver('zip', {})
        zip.on('error', reject)
        zip.pipe(out)
        out.on('error', reject)
        out.on('finish', () => resolve(bowerZip))
        files.forEach(file => zip.file(joinPaths(tarballDir, file), { name: file }))
        zip.finalize()
      })
    })

const createBowerPackage = ({ tarballDir }, callback) =>
  statFilePromised(joinPaths(tarballDir, 'bower.json'))
    .then(stat => {
      if (!stat.isFile()) {
        throw new Error('bower.json is not a file')
      }
      return tryToFinish({ tarballDir })
        .then(bowerZip => callback(null, bowerZip))
        .catch(callback)
    })
    .catch(() => callback(new Error('bower.json is required to create bower.zip package')))


export default createBowerPackage
