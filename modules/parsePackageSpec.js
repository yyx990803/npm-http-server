function parsePackageSpec(spec) {
  const index = spec.indexOf('@')

  let name, version
  if (index !== -1) {
    name = spec.substring(0, index)
    version = spec.substring(index + 1)
  } else {
    name = spec
    version = 'latest'
  }

  return {
    name,
    version
  }
}

export default parsePackageSpec
