import React from 'react'
import { readCSS } from '../StyleUtils'
import DirectoryListing from './DirectoryListing'

const IndexPageCSS = readCSS(__dirname, 'IndexPage.css')

class IndexPage extends React.Component {
  static propTypes = {
    dir: React.PropTypes.string.isRequired,
    displayName: React.PropTypes.string.isRequired,
    entries: React.PropTypes.array.isRequired
  }

  render() {
    const { dir, displayName, entries } = this.props

    return (
      <html>
        <head>
          <meta charSet="utf-8"/>
          <title>Index of {dir}</title>
          <style>{IndexPageCSS}</style>
        </head>
        <body>
          <h1>Index of {dir}</h1>
          <hr/>
          <DirectoryListing dir={dir} entries={entries}/>
          <hr/>
          <address>{displayName}</address>
        </body>
      </html>
    )
  }
}

export default IndexPage
