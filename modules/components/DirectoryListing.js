import React from 'react'
import byteSize from 'byte-size'
import { getContentType } from '../FileUtils'

const formatTime = (time) =>
  new Date(time).toISOString()

class DirectoryListing extends React.Component {
  static propTypes = {
    dir: React.PropTypes.string.isRequired,
    entries: React.PropTypes.array.isRequired
  }

  render() {
    const { dir, entries } = this.props

    const rows = entries.map(({ file, stats }, index) => {
      const isDir = stats.isDirectory()
      const href = file + (isDir ? '/' : '')

      return (
        <tr key={file} className={index % 2 ? 'odd' : 'even'}>
          <td><a title={file} href={href}>{file}</a></td>
          <td>{isDir ? '-' : getContentType(file)}</td>
          <td>{isDir ? '-' : byteSize(stats.size)}</td>
          <td>{isDir ? '-' : formatTime(stats.mtime)}</td>
        </tr>
      )
    })

    if (dir !== '/')
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
}

export default DirectoryListing
