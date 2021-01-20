const chai = require('chai')
const expect = chai.expect

chai.should()
chai.use(require('sinon-chai'))

var fs = require('fs')
var path = require('path')

const Response = require('./index')

describe('#response.text()', () => {
  const res = new Response()

  it('should have a default success status code', () => {
    const response = res.text(fakArgs())

    response.should.have.property('statusCode', 200)
  })

  it('should map provided info onto response headers', async () => {
    const response = res.text(
      fakArgs({ ContentType: 'application/js', ContentLength: 1234567, ContentEncoding: 'gzip' })
    )

    response.should.have.property('headers')
    response.headers.should.have.property('content-type', 'application/js; charset=utf-8')
    response.headers.should.have.property('content-length', 1234567)
    response.headers.should.have.property('content-encoding', 'gzip')
  })

  it("should throw if ContentType isn't supplied", () => {
    expect(() => res.text(fakArgs({ ContentType: null }))).to.throw(Error)
  })

  it("should throw if Body isn't supplied", () => {
    expect(() => res.text(fakArgs({ Body: null }))).to.throw(Error)
  })

  it('should have property isBase64Encoded=false', () => {
    const response = res.text(fakArgs())

    response.should.have.property('isBase64Encoded', false)
  })

  it('should have a utf8-encoded text body', () => {
    const text = fs.readFileSync(path.resolve(__dirname, '../../../__tests__/dummy.js'))
    const response = res.text(fakArgs({ Body: text }))

    response.should.have.property('body', text.toString('utf8'))
  })
})

function fakArgs(overrides) {
  return {
    ContentType: 'application/js',
    ContentLength: 12345,
    ContentEncoding: 'gzip',
    Body: fs.readFileSync(path.resolve(__dirname, '../../../__tests__/dummy.js')),
    ...overrides
  }
}
