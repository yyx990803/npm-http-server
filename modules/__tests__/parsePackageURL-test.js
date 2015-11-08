import expect from 'expect'
import parsePackageURL from '../parsePackageURL'

describe('parsePackageURL', function () {
  it('correctly parses a pathname like /@scope/name@version/path.js', function () {
    expect(parsePackageURL('/@scope/name@version/path.js')).toEqual({
      packageName: '@scope/name',
      version: 'version',
      filename: '/path.js',
      search: null
    })
  })

  it('correctly parses a pathname like /@scope/name@version', function () {
    expect(parsePackageURL('/@scope/name@version')).toEqual({
      packageName: '@scope/name',
      version: 'version',
      filename: null,
      search: null
    })
  })

  it('correctly parses a pathname like /@scope/name/path.js', function () {
    expect(parsePackageURL('/@scope/name/path.js')).toEqual({
      packageName: '@scope/name',
      version: null,
      filename: '/path.js',
      search: null
    })
  })

  it('correctly parses a pathname like /@scope/name', function () {
    expect(parsePackageURL('/@scope/name')).toEqual({
      packageName: '@scope/name',
      version: null,
      filename: null,
      search: null
    })
  })

  it('fails to parse a pathname like /@scope@version/path.js', function () {
    expect(parsePackageURL('/@scope@version/path.js')).toBe(null)
  })

  it('fails to parse a pathname like /@scope@version', function () {
    expect(parsePackageURL('/@scope@version')).toBe(null)
  })

  it('correctly parses a pathname like /name@version/path.js', function () {
    expect(parsePackageURL('/name@version/path.js')).toEqual({
      packageName: 'name',
      version: 'version',
      filename: '/path.js',
      search: null
    })
  })

  it('correctly parses a pathname like /name@version', function () {
    expect(parsePackageURL('/name@version')).toEqual({
      packageName: 'name',
      version: 'version',
      filename: null,
      search: null
    })
  })

  it('correctly parses a pathname like /name/path.js', function () {
    expect(parsePackageURL('/name/path.js')).toEqual({
      packageName: 'name',
      version: null,
      filename: '/path.js',
      search: null
    })
  })

  it('correctly parses a pathname like /name', function () {
    expect(parsePackageURL('/name')).toEqual({
      packageName: 'name',
      version: null,
      filename: null,
      search: null
    })
  })
})
