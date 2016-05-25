import tmpdir from 'os-tmpdir'
import { join as joinPaths } from 'path'

export const createTempPath = (name) =>
  joinPaths(tmpdir(), `npm-http-server-${name}`)
