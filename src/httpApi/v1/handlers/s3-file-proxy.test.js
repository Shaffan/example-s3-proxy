const chai = require('chai')
const sinon = require('sinon')
var path = require('path')
var fs = require('fs')
const AWS = require('aws-sdk')
const awsMock = require('aws-sdk-mock')

chai.should()
chai.use(require('sinon-chai'))

const expect = chai.expect

const { makeHandler } = require('./s3-file-proxy')
const { assert } = require('console')

describe('#makeHttpHandler() - S3 file proxy', () => {
  it("should throw if 'bucket' isn't supplied", async () => {
    expect(() => makeHandler(mockHandler({ bucket: null }))).to.throw(Error)
  })
})

describe('#httpHandler() - S3 file proxy', () => {
  const s3response = mockS3Response()

  afterEach(() => {
    awsMock.restore()
  })

  it("should return 405 - Method if request method is not 'GET'", async () => {
    // arrange
    const handler = makeHandler(mockHandler())

    // act
    const response = await handler({ httpMethod: 'POST' })

    // assert
    response.should.have.property('statusCode')
    response.statusCode.should.equal(405)
  })

  it('should retrieve the item from the given S3 bucket', async () => {
    process.env.BUCKET = 'somebucket'
    // arrange
    const spy = sinon.spy((_, callback) => {
      callback(null, mockS3Response())
    })
    awsMock.mock('S3', 'getObject', spy)
    const s3 = new AWS.S3()
    const handler = makeHandler(mockHandler({ s3, bucket: 'somebucket' }))

    // act
    await handler(mockInput())

    // assert
    spy.should.have.been.calledWithMatch({
      Bucket: 'somebucket'
    })
  })

  it('should use the request path as the object key in the S3 request', async () => {
    // arrange
    const spy = sinon.spy((_, callback) => {
      callback(null, s3response)
    })
    awsMock.mock('S3', 'getObject', spy)
    const s3 = new AWS.S3()
    const handler = makeHandler(mockHandler({ s3 }))

    // act
    await handler(mockInput({ path: 'js/somefile.js' }))

    // assert
    spy.should.have.been.calledWithMatch({
      Key: 'js/somefile.js'
    })
  })

  it('should remove any leading / from the request path', async () => {
    // arrange
    const spy = sinon.spy((_, callback) => {
      callback(null, s3response)
    })
    awsMock.mock('S3', 'getObject', spy)
    const s3 = new AWS.S3()
    const handler = makeHandler(mockHandler({ s3 }))

    // act
    await handler(mockInput({ path: '/js/somefile.js' }))

    // assert
    spy.should.have.been.calledWithMatch({
      Key: 'js/somefile.js'
    })
  })

  it('should decode the request path', async () => {
    // arrange
    const spy = sinon.spy((_, callback) => {
      callback(null, s3response)
    })
    awsMock.mock('S3', 'getObject', spy)
    const s3 = new AWS.S3()
    const handler = makeHandler(mockHandler({ s3 }))

    // act
    await handler(mockInput({ path: '%2Fjs%2Fmin%2Fsomefile.js' }))

    // assert
    spy.should.have.been.calledWithMatch({
      Key: 'js/min/somefile.js'
    })
  })

  it('should return 404 if there is no such key', async () => {
    // arrange
    awsMock.mock('S3', 'getObject', (_, callback) => {
      const err = new Error()
      err.name = 'NoSuchKey'
      callback(err, {})
    })
    const s3 = new AWS.S3()
    const handler = makeHandler(mockHandler({ s3 }))

    // act
    const response = await handler(mockInput())

    // assert
    response.should.have.property('statusCode')
    expect(response.statusCode).to.equal(404)
  })

  it('should return an error response if it encounters an unexpected error', async () => {
    // arrange
    const spy = sinon.spy()
    awsMock.mock('S3', 'getObject', (_, callback) => {
      callback('oh noes!')
    })
    const s3 = new AWS.S3()
    const handler = makeHandler(mockHandler({ s3 }, { fail: spy }))

    // act
    await handler(mockInput())

    // assert
    spy.should.have.been.calledOnce
  })

  it('should log unexpected errors', async () => {
    // arrange
    const spy = sinon.spy()
    awsMock.mock('S3', 'getObject', (_, callback) => {
      callback('oh noes!')
    })
    const s3 = new AWS.S3()
    const handler = makeHandler(mockHandler({ s3, log: { error: spy } }))

    // act
    await handler(mockInput())

    // assert
    spy.should.have.been.calledOnce
  })

  it('should respond with the base64 response method if the requested S3 object is an image', async () => {
    // arrange
    const spy = sinon.spy()
    awsMock.mock('S3', 'getObject', (_, callback) => callback(null, mockS3Response()))
    const s3 = new AWS.S3()
    const handler = makeHandler(mockHandler({ s3 }, { base64: spy }))

    // act
    await handler(mockInput({ path: '/img/someimage.jpg' }))

    // assert
    spy.should.have.been.calledOnce
  })

  it('should respond with the default if the requested S3 object is not an image', async () => {
    // arrange
    const spy = sinon.spy()
    awsMock.mock('S3', 'getObject', (_, callback) => callback(null, mockS3Response()))
    const s3 = new AWS.S3()
    const handler = makeHandler(mockHandler({ s3 }, { text: spy }))

    // act
    await handler(mockInput({ path: '/content/some.file' }))

    // assert
    spy.should.have.been.calledOnce
  })
})

function mockHandler(overrides, resOverrides) {
  return {
    s3: () => {},
    res: {
      file: (args) => args,
      image: (args) => args,
      fail: (args) => args,
      ...resOverrides
    },
    bucket: 'dev-ved-content',
    log: { error: () => {}, debug: () => {} },
    ...overrides
  }
}

function mockInput(overrides) {
  return {
    httpMethod: 'GET',
    path: 'js/min/dummy.js',
    ...overrides
  }
}

function mockS3Response(overrides) {
  return {
    AcceptRanges: 'bytes',
    LastModified: '2020-11-20T11:46:40.000Z',
    ContentLength: 1385535,
    ContentEncoding: 'base64',
    ETag: '"f99e77e939998e0c85c758372e341588"',
    ContentType: 'application/js',
    Metadata: {},
    Body: fs.readFileSync(path.resolve(__dirname, '../../../../__tests__/dummy.js')),
    ...overrides
  }
}
