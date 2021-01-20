module.exports = {
  text({ ContentType, ContentLength, ContentEncoding, Body }) {
    if (!ContentType) throw new Error("text response: 'ContentType' must be supplied")
    if (!Body) throw new Error("text response: 'Body' must be supplied")

    return {
      statusCode: 200,
      statusDescription: '200 OK',
      body: Body.toString('utf8'),
      headers: {
        'content-type': ContentType + '; charset=utf-8',
        'content-length': ContentLength,
        'content-encoding': ContentEncoding
      },
      isBase64Encoded: false
    }
  }
}
