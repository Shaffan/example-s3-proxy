module.exports = {
  fail({ statusCode, message }) {
    statusCode = statusCode || 500
    message = message || 'Internal server error'

    return {
      statusCode,
      statusDescription: `${statusCode} ${message}`,
      body: JSON.stringify({ message }),
      headers: {
        'content-type': 'application/json'
      }
    }
  }
}
