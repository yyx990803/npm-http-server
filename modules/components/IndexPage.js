import React from 'react'
import { readCSS } from '../StyleUtils'
import DirectoryListing from './DirectoryListing'

const IndexPage = React.createClass({
  statics: {
    css: readCSS(__dirname, 'IndexPage.css')
  },

  render() {
    const { baseDir, dir, displayName, entries } = this.props
    const dirname = dir.replace(baseDir, '')

    return (
      <html>
        <head>
          <meta charSet="utf-8"/>
          <title>Index of {dirname}</title>
          <style>{IndexPage.css}</style>
        </head>
        <body>
          <h1>Index of {dirname}</h1>
          <hr/>
          <DirectoryListing dirname={dirname} entries={entries}/>
          <hr/>
          <address>{displayName}</address>
        </body>
      </html>
    )
  }
})

export default IndexPage
