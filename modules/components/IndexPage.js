import semver from 'semver'
import React, { PropTypes } from 'react'
import DirectoryListing from './DirectoryListing'
import { readCSS } from '../StyleUtils'

const IndexPageStyle = readCSS(__dirname, 'IndexPage.css')
const IndexPageScript = `
var s = document.getElementById('version'), v = s.value
s.onchange = function () {
  window.location.href = window.location.href.replace('@' + v, '@' + s.value)
}
`

const byVersion = (a, b) =>
  semver.lt(a, b) ? -1 : (semver.gt(a, b) ? 1 : 0)

class IndexPage extends React.Component {
  static propTypes = {
    packageInfo: PropTypes.object.isRequired,
    version: PropTypes.string.isRequired,
    dir: PropTypes.string.isRequired,
    entries: PropTypes.array.isRequired
  }

  render() {
    const { packageInfo, version, dir, entries } = this.props

    const versions = Object.keys(packageInfo.versions).sort(byVersion)
    const options = versions.map(v => (
      <option key={v} value={v}>{packageInfo.name}@{v}</option>
    ))

    return (
      <html>
        <head>
          <meta charSet="utf-8"/>
          <title>Index of {dir}</title>
          <style dangerouslySetInnerHTML={{ __html: IndexPageStyle }}/>
        </head>
        <body>
          <div className="version-wrapper">
            <select id="version" defaultValue={version}>{options}</select>
          </div>
          <h1>Index of {dir}</h1>
          <script dangerouslySetInnerHTML={{ __html: IndexPageScript }}/>
          <hr/>
          <DirectoryListing dir={dir} entries={entries}/>
          <hr/>
          <address>{packageInfo.name}@{version}</address>
        </body>
      </html>
    )
  }
}

export default IndexPage
