import mime from 'mime'
import { stat as statFile, createReadStream } from 'fs'

export function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain',
    'Content-Length': text.length
  })

  res.end(text)
}

export function sendInvalidURLError(res, url) {
  sendText(res, 403, `Invalid URL: ${url}`)
}

export function sendNotFoundError(res, what) {
  sendText(res, 404, `Not found: ${what}`)
}

export function sendServerError(res, error) {
  sendText(res, 500, `Server error: ${error.message}`)
}

export function sendRedirect(res, location, statusCode=302) {
  const html = `<p>You are being redirected to <a href="${location}">${location}</a>`

  res.writeHead(statusCode, {
    'Content-Type': 'text/html',
    'Content-Length': html.length,
    'Location': location
  })

  res.end(html)
}

export function sendFile(res, file, maxAge=0) {
  statFile(file, function (error, stat) {
    if (error) {
      sendServerError(res, error)
    } else {
      res.writeHead(200, {
        'Content-Type': `${mime.lookup(file)}; charset=utf-8`,
        'Content-Length': stat.size,
        'Cache-Control': `public, max-age=${maxAge}`
      })

      const stream = createReadStream(file)

      stream.on('error', function (error) {
        sendServerError(res, error)
      })

      stream.pipe(res)
    }
  })
}
