jest.setTimeout(300000)

const region = 'eu-west-2'

const chai = require('chai')
chai.should()

var path = require('path')
var fs = require('fs')
const { invoke } = require('aws-testing-library/lib/utils/lambda')

const { putS3Object, deleteS3Object, getStackOutputs } = require('../../../../utils')

describe('image s3 proxy handler', () => {
  let stackoutputs
  let image
  let js
  const imageKey = 'images/32.png'
  const jsKey = 'js/min/dummy.js'
  const encoding = 'base64'

  beforeAll(async () => {
    stackoutputs = await getStackOutputs('dev')
    image = fs.readFileSync(path.resolve(__dirname, '../../../../32.png'))
    webp = fs.readFileSync(path.resolve(__dirname, '../../../../32.webp'))
    js = fs.readFileSync(path.resolve(__dirname, '../../../../dummy.js'))

    await Promise.all([
      putS3Object(stackoutputs.S3BucketNameImages, imageKey, image, 'image/png', encoding),
      putS3Object(stackoutputs.S3BucketNameImages, jsKey, js, 'application/js', encoding)
    ])
  })

  afterAll(async () => {
    await Promise.all([
      deleteS3Object(stackoutputs.S3BucketNameImages, imageKey),
      deleteS3Object(stackoutputs.S3BucketNameImages, jsKey)
    ])
  })

  it('retrieves an image from S3', async () => {
    // arrange
    const input = {
      httpMethod: 'GET',
      path: '/' + imageKey
    }

    // act
    const result = await invoke(region, stackoutputs.FunctionNameGetImage, input)

    // assert
    result.should.have.property('statusCode', 200)
    result.should.have.property('body', image.toString('base64'))
  })

  it('retrieves a static file from S3', async () => {
    // arrange
    const input = {
      httpMethod: 'GET',
      path: '/' + jsKey
    }

    // act
    const result = await invoke(region, stackoutputs.FunctionNameGetImage, input)

    // assert
    result.should.have.property('statusCode', 200)
    result.should.have.property('body', js.toString('utf8'))
  })
})
