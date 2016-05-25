import fs from 'fs'
import mime from 'mime'

const TextFiles = /\/?(LICENSE|README|CHANGES|AUTHORS|Makefile|\.[a-z]*rc|\.git[a-z]*|\.[a-z]*ignore)$/i

export const getContentType = (file) =>
  TextFiles.test(file) ? 'text/plain' : mime.lookup(file)

export const getStats = (file) =>
  new Promise((resolve, reject) => {
    fs.lstat(file, (error, stats) => {
      if (error) {
        reject(error)
      } else {
        resolve(stats)
      }
    })
  })

export const getFileType = (stats) => {
  if (stats.isFile()) return 'file'
  if (stats.isDirectory()) return 'directory'
  if (stats.isBlockDevice()) return 'blockDevice'
  if (stats.isCharacterDevice()) return 'characterDevice'
  if (stats.isSymbolicLink()) return 'symlink'
  if (stats.isSocket()) return 'socket'
  if (stats.isFIFO()) return 'fifo'
  return 'unknown'
}
