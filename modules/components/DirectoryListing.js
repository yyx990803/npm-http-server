import React from 'react'
import byteSize from 'byte-size'
import { getContentType } from '../ResponseUtils'

const DirectoryListing = (props) => {
  const { dirname, entries } = props

  const rows = entries.map(({ file, stats }, index) => {
    const isDir = stats.isDirectory()
    const href = file + (isDir ? '/' : '')

    return (
      <tr key={file} className={index % 2 ? 'odd' : 'even'}>
        <td><a title={file} href={href}>{file}</a></td>
        <td>{isDir ? '-' : getContentType(file)}</td>
        <td>{isDir ? '-' : byteSize(stats.size)}</td>
        <td>{isDir ? '-' : new Date(stats.mtime).toISOString()}</td>
      </tr>
    )
  })

  if (dirname !== '/')
    rows.unshift(
      <tr key=".." className="odd">
        <td><a title="Parent directory" href="../">..</a></td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </tr>
    )

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Size</th>
          <th>Last Modified</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  )
}

export default DirectoryListing
