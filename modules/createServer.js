import express from 'express'
import serveNPMPackageFile from './serveNPMPackageFile'

function createServer() {
  const app = express()

  app.disable('x-powered-by')
  app.use(serveNPMPackageFile)

  return app
}

export default createServer
