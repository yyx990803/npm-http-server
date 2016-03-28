import fs from 'fs'
import path from 'path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import IndexPage from './components/IndexPage'

const getStats = (file) =>
  new Promise((resolve, reject) => {
    fs.stat(file, (error, stats) => {
      if (error) {
        reject(error)
      } else {
        resolve(stats)
      }
    })
  })

const getEntries = (dir) =>
  new Promise((resolve, reject) => {
    fs.readdir(dir, (error, files) => {
      if (error) {
        reject(error)
      } else {
        resolve(
          Promise.all(
            files.map(file => getStats(path.join(dir, file)))
          ).then(
            statsArray => statsArray.map(
              (stats, index) => ({ file: files[index], stats })
            )
          )
        )
      }
    })
  })

const DOCTYPE = '<!DOCTYPE html>'

const generateIndexPage = (baseDir, dir, displayName, entries) =>
  DOCTYPE + renderToStaticMarkup(
    <IndexPage baseDir={baseDir} dir={dir} displayName={displayName} entries={entries}/>
  )

export const generateDirectoryIndexHTML = (baseDir, dir, displayName, callback) =>
  getEntries(path.join(baseDir, dir))
    .then(entries => generateIndexPage(baseDir, dir, displayName, entries))
    .then(html => callback(null, html), callback)
