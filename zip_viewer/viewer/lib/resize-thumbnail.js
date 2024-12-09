const sharp = require('sharp')
const resizeThumbnail = (binary, callback, options = { width: 400 }) => {
  sharp(binary)
    .resize({
      width: options.width,
    })
    .toBuffer()
    .then((buffer) => {
      callback(buffer)
    }).catch((error) => {
      console.log(error)
  })
}

module.exports = resizeThumbnail