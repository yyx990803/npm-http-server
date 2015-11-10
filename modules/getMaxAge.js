const OneMinute = 60
const OneDay = OneMinute * 60 * 24
const OneYear = OneDay * 365

function isVersionNumber(version) {
  return (/^\d/).test(version)
}

function getMaxAge(packageVersion) {
  if (!isVersionNumber(packageVersion))
    return OneMinute

  // Since NPM package versions can't be overwritten,
  // cache this file for a very long time.
  return OneYear
}

export default getMaxAge
