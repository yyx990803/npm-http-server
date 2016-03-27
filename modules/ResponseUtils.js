import { stat as statFile, createReadStream } from 'fs'
import mime from 'mime'

export const sendText = (res, statusCode, text) => {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain',
    'Content-Length': text.length
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

const TextFiles = /\/?(LICENSE|README|CHANGES|AUTHORS|Makefile|\.[a-z]*rc|\.git[a-z]*|\.[a-z]*ignore)$/i

export const getContentType = (file) =>
  TextFiles.test(file) ? 'text/plain' : mime.lookup(file)

export const sendFile = (res, file, maxAge = 0) => {
  statFile(file, (error, stat) => {
    if (error) {
      sendServerError(res, error)
    } else {
      res.writeHead(200, {
        'Content-Type': `${getContentType(file)}; charset=utf-8`,
        'Content-Length': stat.size,
        'Cache-Control': `public, max-age=${maxAge}`
      })

      const stream = createReadStream(file)

      stream.on('error', (error) => {
        sendServerError(res, error)
      })

      stream.pipe(res)
    }
  })
}
