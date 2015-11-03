const OneMinute = 60000
const OneDay = OneMinute * 60 * 24
const OneYear = OneDay * 365

function isVersionNumber(version) {
  return (/^\d/).test(version)
}

function getExpirationDate(packageVersion) {
  if (!isVersionNumber(packageVersion))
    return new Date(Date.now() + OneMinute)

  // Since NPM package versions can't be overwritten,
  // cache this file for a very long time.
  return new Date(Date.now() + OneYear)
}

export default getExpirationDate
