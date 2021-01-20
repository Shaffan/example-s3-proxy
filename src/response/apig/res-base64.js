module.exports = {
  base64({ ContentType, ContentLength, ContentEncoding, Body }) {
    if (!ContentType) throw new Error("base64 response: 'ContentType' must be supplied")
    if (!Body) throw new Error("base64 response: 'Body' must be supplied")

    return {
      statusCode: 200,
      body: Body.toString('base64'),
      headers: {
        'content-type': ContentType,
        'content-length': ContentLength,
        'content-encoding': ContentEncoding
      },
      isBase64Encoded: true
    }
  }
}
