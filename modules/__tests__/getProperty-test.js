import expect from 'expect'
import getProperty from '../getProperty'

describe('getProperty', function () {
  it('gets deeply nested properties of an object', function () {
    expect(getProperty({ a: { b: { c: 'c' } } }, 'a.b.c')).toBe('c')
    expect(getProperty({ a: { b: { c: 'c' } } }, 'a.b.d')).toBe(undefined)
  })
})
