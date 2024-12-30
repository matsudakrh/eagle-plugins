import sharp, { ResizeOptions } from 'sharp'

const resizeThumbnail = (
  binary: Buffer,
  callback: (buffer: Buffer) => void,
  options: ResizeOptions = { width: 400 },
) => {
  sharp(binary)
    .resize({
      width: options.width,
    })
    .toBuffer()
    .then((buffer) => {
      callback(buffer)
    }).catch((error) => {
      console.log(error)
      throw 'リサイズ処理に失敗しました。'
  })
}

export default resizeThumbnail