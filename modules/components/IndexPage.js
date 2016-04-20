import csso from 'csso'
import React from 'react'
import DirectoryListing from './DirectoryListing'

const IndexStyles = csso.minify(`
body {
  font: 14px Monaco, monospace;
  padding: 0px 10px 5px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
tr.even {
  background-color: #eee;
}
th {
  text-align: left;
}
th, td {
  padding: 0.1em 0.25em;
}
address {
  text-align: right;
}
`).css

const IndexPage = (props) => {
  const { baseDir, dir, displayName, entries } = props
  const dirname = dir.replace(baseDir, '')

  return (
    <html>
      <head>
        <title>Index of {dirname}</title>
        <style>{IndexStyles}</style>
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

export default IndexPage
