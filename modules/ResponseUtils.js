import fs from 'fs'
import { getContentType, getStats } from './FileUtils'

export const sendText = (res, statusCode, text) => {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain',
    'Content-Length': text.length
  })

  res.end(text)
}

export const sendJSON = (res, json, maxAge = 0, statusCode = 200) => {
  const text = JSON.stringify(json)

  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': text.length,
    'Cache-Control': `public, max-age=${maxAge}`
  })

  res.end(text)
}

export const sendInvalidURLError = (res, url) =>
  sendText(res, 403, `Invalid URL: ${url}`)

export const sendNotFoundError = (res, what) =>
  sendText(res, 404, `Not found: ${what}`)

export const sendServerError = (res, error) =>
  sendText(res, 500, `Server error: ${error.message || error}`)

export const sendHTML = (res, html, maxAge = 0, statusCode = 200) => {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html',
    'Content-Length': html.length,
    'Cache-Control': `public, max-age=${maxAge}`
  })

  res.end(html)
}

export const sendRedirect = (res, location, maxAge = 0, statusCode = 302) => {
  const html = `<p>You are being redirected to <a href="${location}">${location}</a>`

  res.writeHead(statusCode, {
    'Content-Type': 'text/html',
    'Content-Length': html.length,
    'Cache-Control': `public, max-age=${maxAge}`,
    Location: location
  })

  res.end(html)
}

export const sendFile = (res, file, stats, maxAge = 0) =>
  Promise.resolve(stats || getStats(file))
    .then(stats => {
      let contentType = getContentType(file)

      if (contentType === 'text/html')
        contentType = 'text/plain' // We can't serve HTML because bad people :(

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Cache-Control': `public, max-age=${maxAge}`
      })

      const stream = fs.createReadStream(file)

      stream.on('error', (error) => {
        sendServerError(res, error)
      })

      stream.pipe(res)
    })
    .catch(error => {
      sendServerError(res, error)
    })
