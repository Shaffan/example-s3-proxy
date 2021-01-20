const _ = require('lodash')
const yaml = require('js-yaml')
const fs = require('fs')
const aws = require('aws-sdk')
const s3 = new aws.S3()

const cloudformation = new aws.CloudFormation({ region: 'eu-west-2' })

async function getStackOutputs(stage) {
  const serviceName = yaml.safeLoad(fs.readFileSync('serverless.yml')).service
  const stackName = `${serviceName}-${stage}`
  const result = await cloudformation.describeStacks({ StackName: stackName }).promise()
  const stack = result.Stacks[0]

  const keys = stack.Outputs.map((x) => x.OutputKey)
  const values = stack.Outputs.map((x) => x.OutputValue)

  return _.zipObject(keys, values)
}

async function putS3Object(bucket, key, body, contentType, contentEncoding) {
  await s3
    .putObject({
      Body: body,
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ContentEncoding: contentEncoding
    })
    .promise()
}

async function getS3Object(bucket, key) {
  const resp = await s3
    .getObject({
      Bucket: bucket,
      Key: key
    })
    .promise()

  return resp.Body
}

async function deleteS3Object(bucket, key) {
  await s3
    .deleteObject({
      Bucket: bucket,
      Key: key
    })
    .promise()
}

module.exports = {
  putS3Object,
  getS3Object,
  deleteS3Object,
  getStackOutputs
}
