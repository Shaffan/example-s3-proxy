module.exports = {
  base64({ ContentType, ContentEncoding, Body }) {
    if (!ContentType) throw new Error("base64 response: 'ContentType' must be supplied")
    if (!Body) throw new Error("base64 response: 'Body' must be supplied")

    const response = {
      statusCode: 200,
      statusDescription: '200 OK',
      body: Body.toString('base64'),
      headers: {
        'Content-Type': ContentType
      },
      isBase64Encoded: true
    }

    if (ContentEncoding) response.headers['Content-Encoding'] = ContentEncoding

    return response
  }
}
