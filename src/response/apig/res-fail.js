module.exports = {
  fail({ statusCode, message }) {
    return {
      statusCode: statusCode || 500,
      body: JSON.stringify({ message: message || 'Internal server error' }),
      headers: {
        'content-type': 'application/json'
      }
    }
  }
}
