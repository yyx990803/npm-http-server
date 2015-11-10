import { resolve as resolvePath } from 'path'
import { sendFile, sendNotFoundError } from './ResponseUtils'

const IndexFile = resolvePath(__dirname, '../index.html')
const OneMinute = 60

function serveWebsite(req, res, next) {
  if (req.path === '/') {
    sendFile(res, IndexFile, OneMinute)
  } else if (req.path === '/favicon.ico') {
    sendNotFoundError(res, 'favicon.ico')
  } else {
    next()
  }
}

export default serveWebsite
