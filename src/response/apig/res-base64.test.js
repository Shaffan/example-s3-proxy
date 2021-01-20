const chai = require('chai')
const expect = chai.expect

chai.should()
chai.use(require('chai-as-promised'))

var fs = require('fs')
var path = require('path')

const Response = require('.')

describe('#response.base64()', () => {
  const res = new Response()

  it('should have a default success status code', async () => {
    const response = await res.base64(fakArgs())

    response.should.have.property('statusCode', 200)
  })

  it('should map provided headers onto response headers', async () => {
    const response = await res.base64(
      fakArgs({ ContentType: 'image/jpg', ContentLength: 1234567, ContentEncoding: 'gzip' })
    )

    response.should.have.property('headers')
    response.headers.should.have.property('content-type', 'image/jpg')
    response.headers.should.have.property('content-length', 1234567)
    response.headers.should.have.property('content-encoding', 'gzip')
  })

  it("should throw if ContentType isn't supplied", () => {
    expect(() => res.base64(fakArgs({ ContentType: null }))).to.throw(Error)
  })

  it("should throw if Body isn't supplied", () => {
    expect(() => res.base64(fakArgs({ Body: null }))).to.throw(Error)
  })

  it('should have property isBase64Encoded=true', async () => {
    const response = await res.base64(fakArgs())

    response.should.have.property('isBase64Encoded', true)
  })

  it('should have a base64-encoded body', async () => {
    const image = fs.readFileSync(path.resolve(__dirname, '../../../__tests__/32.png'))
    const response = await res.base64(fakArgs({ Body: image }))

    response.should.have.property('body', image.toString('base64'))
  })
})

function fakArgs(overrides) {
  return {
    ContentType: 'image/jpg',
    ContentLength: 12345,
    ContentEncoding: 'gzip',
    Body: fs.readFileSync(path.resolve(__dirname, '../../../__tests__/32.png')),
    ...overrides
  }
}
