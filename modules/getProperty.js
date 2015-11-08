function getProperty(object, path) {
  const pieces = path.split('.')

  return pieces.reduce(function (object, p) {
    if (object && typeof object === 'object' && !Array.isArray(object))
      return object[p]

    return null
  }, object)
}

export default getProperty
