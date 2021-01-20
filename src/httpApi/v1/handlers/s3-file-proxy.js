const { isImage } = require('../../../utils')

module.exports.makeHandler = ({ s3, res, bucket, log }) => {
  if (!bucket) throw new Error("Missing 'bucket' parameter. Are you missing an environment variable?")

  return async function handler(req) {
    if (req.httpMethod !== 'GET')
      return res.fail({ statusCode: 405, message: 'Method not allowed' })

    try {
      let key = decodeURIComponent(req.path)
      key = key.startsWith('/') ? key.substring(1) : key

      const obj = await s3
        .getObject({
          Bucket: bucket,
          Key: key
        })
        .promise()

      if (isImage(key)) return await res.base64({ ...obj })

      return res.text({ ...obj })
    } catch (e) {
      if (e.name === 'NoSuchKey') return res.fail({ statusCode: 404, message: 'Not found' })

      log.error(e)

      return res.fail()
    }
  }
}
