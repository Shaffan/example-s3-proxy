const chai = require('chai')
var path = require('path')
var fs = require('fs')

chai.should()
chai.use(require('sinon-chai'))

const res = require('./webp')

describe('#convert.webp()', () => {
    const png = fs.readFileSync(path.resolve(__dirname, '../../../__tests__/32.png'))
    const webp = fs.readFileSync(path.resolve(__dirname, '../../../__tests__/32.webp'))

    it ('should convert the image to webp format', async() => {
        const converted = await res.webp(png)
        
        converted.toString().should.equal(webp.toString())
    })
})