const sharp = require('sharp')

module.exports = {
    async webp(buf) {
        return await sharp(buf)
        .webp({ lossless: true })
        .toBuffer();
    }
}