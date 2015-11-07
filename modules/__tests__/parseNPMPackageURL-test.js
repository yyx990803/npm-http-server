import expect from 'expect'
import parseNPMPackageURL from '../parseNPMPackageURL'

describe('parseNPMPackageURL', function () {
  it('correctly parses a pathname like /@scope/name@version/path.js', function () {
    expect(parseNPMPackageURL('/@scope/name@version/path.js')).toEqual({
      packageSpec: '@scope/name@version',
      scope: '@scope',
      packageName: 'name',
      version: 'version',
      filename: '/path.js'
    })
  })

  it('correctly parses a pathname like /@scope/name@version', function () {
    expect(parseNPMPackageURL('/@scope/name@version')).toEqual({
      packageSpec: '@scope/name@version',
      scope: '@scope',
      packageName: 'name',
      version: 'version',
      filename: null
    })
  })

  it('correctly parses a pathname like /@scope/name/path.js', function () {
    expect(parseNPMPackageURL('/@scope/name/path.js')).toEqual({
      packageSpec: '@scope/name',
      scope: '@scope',
      packageName: 'name',
      version: null,
      filename: '/path.js'
    })
  })

  it('correctly parses a pathname like /@scope/name', function () {
    expect(parseNPMPackageURL('/@scope/name')).toEqual({
      packageSpec: '@scope/name',
      scope: '@scope',
      packageName: 'name',
      version: null,
      filename: null
    })
  })

  it('fails to parse a pathname like /@scope@version/path.js', function () {
    expect(parseNPMPackageURL('/@scope@version/path.js')).toBe(null)
  })

  it('fails to parse a pathname like /@scope@version', function () {
    expect(parseNPMPackageURL('/@scope@version')).toBe(null)
  })

  it('correctly parses a pathname like /name@version/path.js', function () {
    expect(parseNPMPackageURL('/name@version/path.js')).toEqual({
      packageSpec: 'name@version',
      scope: null,
      packageName: 'name',
      version: 'version',
      filename: '/path.js'
    })
  })

  it('correctly parses a pathname like /name@version', function () {
    expect(parseNPMPackageURL('/name@version')).toEqual({
      packageSpec: 'name@version',
      scope: null,
      packageName: 'name',
      version: 'version',
      filename: null
    })
  })

  it('correctly parses a pathname like /name/path.js', function () {
    expect(parseNPMPackageURL('/name/path.js')).toEqual({
      packageSpec: 'name',
      scope: null,
      packageName: 'name',
      version: null,
      filename: '/path.js'
    })
  })

  it('correctly parses a pathname like /name', function () {
    expect(parseNPMPackageURL('/name')).toEqual({
      packageSpec: 'name',
      scope: null,
      packageName: 'name',
      version: null,
      filename: null
    })
  })
})
