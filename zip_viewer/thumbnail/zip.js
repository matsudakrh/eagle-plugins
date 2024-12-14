const fs = require('fs')
const yauzl = require('yauzl')
const imageSize = require('../lib/image-size')
const resizeThumbnail = require('../viewer/lib/resize-thumbnail.js')

module.exports = async ({ src, dest, item }) => {
  return new Promise(async (resolve, reject) => {
    try {
      yauzl.open(src, { lazyEntries: true }, (err, zipFile) => {
        if (err) {
          reject(err)
          return
        }

        let finded = false
        zipFile.readEntry()
        zipFile.on('entry', function(entry) {
          if (finded) {
            return
          }
          const fileName = entry.fileName.toLowerCase()
          const isImage = fileName.endsWith('jpg') || fileName.endsWith('jpeg') || fileName.endsWith('png')
          if (entry.fileName.endsWith('/') || !isImage) {
            zipFile.readEntry()
          } else {
            zipFile.openReadStream(entry, {}, (err, readStream) => {
              if (err) {
                zipFile.readEntry()
                console.error(err)
                return
              }
              finded = true
              const chunks = []
              /// これを設定して処理が終わるとendが発火する
              readStream.on('data', (chunk) => {
                chunks.push(chunk)
              })
              readStream.on('end', async () => {
                const buffer = Buffer.concat(chunks)

                resizeThumbnail(buffer,  async () => {
                  try {
                    await fs.promises.writeFile(
                      dest,
                      buffer.toString('base64'),
                      { encoding: 'base64' }
                    )
                    let size = await imageSize(dest)
                    item.height = size?.height || item.height
                    item.width = size?.width || item.width
                    zipFile.close()
                    // 4. return the result
                    return resolve(item)
                  } catch (err) {
                    return reject(err)
                  }
                })
              })
            })
          }
        })

        zipFile.on('end', function() {
          zipFile.close()
          reject(err)
        })
      })
    }
    catch (err) {
      return reject(err)
    }
  })
}