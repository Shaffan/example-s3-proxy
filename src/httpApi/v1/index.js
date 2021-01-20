const AWS = require('aws-sdk')
const Response = require('../../response/alb')
const { makeHandler } = require('./handlers/s3-file-proxy')

const s3 = new AWS.S3()
const res = new Response()

module.exports.getFile = makeHandler({
  s3,
  res,
  bucket: process.env.BUCKET,
  log: { debug: (info) => console.debug(info), error: (e) => console.error(e) }
})
