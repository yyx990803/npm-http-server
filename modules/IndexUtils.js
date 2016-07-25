import fs from 'fs'
import React from 'react'
import { join as joinPaths } from 'path'
import { renderToStaticMarkup } from 'react-dom/server'
import IndexPage from './components/IndexPage'
import { getStats } from './FileUtils'

const getEntries = (dir) =>
  new Promise((resolve, reject) => {
    fs.readdir(dir, (error, files) => {
      if (error) {
        reject(error)
      } else {
        resolve(
          Promise.all(
            files.map(file => getStats(joinPaths(dir, file)))
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

const generateIndexPage = (props) =>
  DOCTYPE + renderToStaticMarkup(<IndexPage {...props}/>)

export const generateDirectoryIndexHTML = (packageInfo, version, baseDir, dir, callback) =>
  getEntries(joinPaths(baseDir, dir))
    .then(entries => generateIndexPage({ packageInfo, version, dir, entries }))
    .then(html => callback(null, html), callback)
