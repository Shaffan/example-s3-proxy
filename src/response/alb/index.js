const fail = require('./res-fail')
const text = require('./res-text')
const base64 = require('./res-base64')

class Response {
  constructor() {
    Object.assign(this, fail, text, base64)
  }
}

module.exports = Response
