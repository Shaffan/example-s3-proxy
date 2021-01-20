const chai = require('chai')

chai.should()
chai.use(require('sinon-chai'))

const res = require('./res-fail')

describe('#response.fail()', () => {
  it('should have a default status code', () => {
    const response = res.fail(fakeFailure({ statusCode: null }))

    response.should.have.property('statusCode')
  })

  it('can have a custom status code', () => {
    const response = res.fail(fakeFailure({ statusCode: 400 }))

    response.should.have.property('statusCode', 400)
  })

  it('should have a default error message', () => {
    const response = res.fail(fakeFailure({ message: null }))

    response.should.have.property('body')
    JSON.parse(response.body).should.have.property('message')
  })

  it('can have a custom error message', () => {
    const response = res.fail(fakeFailure({ message: 'oh lawd!' }))

    response.should.have.property('body')
    response.body.should.equal(JSON.stringify({ message: 'oh lawd!' }))
  })

  it("should have a content-type header of 'application/json'", () => {
    const response = res.fail(fakeFailure())

    response.should.have.property('headers')
    response.headers.should.have.property('content-type')
    response.headers['content-type'].should.equal('application/json')
  })
})

function fakeFailure(overrides) {
  return {
    statusCode: 500,
    message: 'Oh noes!',
    ...overrides
  }
}
