import React from 'react'
import { readCSS } from '../StyleUtils'
import DirectoryListing from './DirectoryListing'

const IndexPage = React.createClass({
  statics: {
    css: readCSS(__dirname, 'IndexPage.css')
  },

  render() {
    const { dir, displayName, entries } = this.props

    return (
      <html>
        <head>
          <meta charSet="utf-8"/>
          <title>Index of {dir}</title>
          <style>{IndexPage.css}</style>
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
})

export default IndexPage
