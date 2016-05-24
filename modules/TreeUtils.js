import fs from 'fs'
import path from 'path'
import { getContentType } from './ResponseUtils'

const getStats = (file) =>
  new Promise((resolve, reject) => {
    fs.lstat(file, (error, stats) => {
      if (error) {
        reject(error)
      } else {
        resolve(stats)
      }
    })
  })

const getType = (stats) => {
  if (stats.isFile()) return 'file'
  if (stats.isDirectory()) return 'directory'
  if (stats.isBlockDevice()) return 'blockDevice'
  if (stats.isCharacterDevice()) return 'characterDevice'
  if (stats.isSymbolicLink()) return 'symlink'
  if (stats.isFIFO()) return 'fifo'
  if (stats.isSocket()) return 'socket'
  return 'unknown'
}

const formatTime = (time) =>
  new Date(time).toISOString()

const resolveDirectory = (baseDir, path, stats, maximumDepth) => {
  const files = maximumDepth > 0
    ? getEntries(baseDir, path, maximumDepth - 1)
    : Promise.resolve(null)

  return files
    .then(
      files => ({
        path,
        lastModified: formatTime(stats.mtime),
        contentType: getContentType(path),
        size: stats.size,
        type: getType(stats),
        files
      })
    )
}

const resolveEntry = (baseDir, path, stats, maximumDepth) =>
  stats.isDirectory()
    ? resolveDirectory(baseDir, path, stats, maximumDepth)
    : Promise.resolve({
        path,
        lastModified: formatTime(stats.mtime),
        contentType: getContentType(path),
        size: stats.size,
        type: getType(stats)
      })

const getEntries = (baseDir, name, maximumDepth) =>
  new Promise((resolve, reject) => {
    const dir = path.join(baseDir, name)

    fs.readdir(dir, (error, files) => {
      if (error) {
        reject(error)
      } else {
        resolve(
          Promise.all(
            files.map(file => getStats(path.join(dir, file)))
          ).then(
            statsArray => Promise.all(statsArray.map(
              (stats, index) => resolveEntry(baseDir, path.join(name, files[index]), stats, maximumDepth)
            ))
          )
        )
      }
    })
  })

export const generateDirectoryTree = (baseDir, dir, maximumDepth, callback) =>
  getEntries(baseDir, dir, maximumDepth)
    .then(files => callback(null, { files }), callback)
