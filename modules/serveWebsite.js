import { resolve as resolvePath } from 'path'
import { sendFile, sendNotFoundError } from './ResponseUtils'

const IndexFile = resolvePath(__dirname, '../index.html')

function serveWebsite(req, res, next) {
  if (req.path === '/') {
    sendFile(res, IndexFile, new Date(Date.now() + 1000 * 60))
  } else if (req.path === '/favicon.ico') {
    sendNotFoundError(res, 'favicon.ico')
  } else {
    next()
  }
}

export default serveWebsite
