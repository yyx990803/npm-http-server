import { readFile } from 'fs'
import mime from 'mime'

export function sendText(res, text) {
  res.type('text/plain').end(text)
}

export function sendInvalidURLError(res, url) {
  sendText(res.status(403), 'Invalid URL: ' + url)
}

export function sendNotFoundError(res, what) {
  sendText(res.status(404), 'Not found: ' + what)
}

export function sendServerError(res, error) {
  sendText(res.status(500), 'Server error: ' + error.message)
}

export function sendFile(res, file, expirationDate) {
  readFile(file, 'utf8', function (error, data) {
    if (error) {
      sendServerError(res, error)
    } else {
      res.writeHead(200, {
        'Content-Type': mime.lookup(file) + '; charset=utf-8',
        'Expires': expirationDate.toGMTString()
      })

      res.end(data)
    }
  })
}
