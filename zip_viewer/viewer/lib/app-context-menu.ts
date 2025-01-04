import { Entry } from 'yauzl'
import * as FileType from 'file-type'
import fs from 'fs'
import { EagleResources } from 'eagle'
import resizeThumbnail from './resize-thumbnail'
import AppParameters from './app-parameters'

export default class AppContextMenu {
  static preview({
    entry,
    fileType,
    buffer,
 }: { entry: Entry, fileType: FileType.FileTypeResult, buffer: Buffer }) {
    const words = entry.encodedFileName.split('/')
    const items: EagleResources.ContextMenuItem[] = [
      {
        id: 'export',
        label: 'ファイルをエクスポート',
        click: async () => {
          entry.zipFile.openReadStream(entry, null, (err, readStream) => {
            if (err) {
              return
            }
            const chunks: Uint8Array[] = []
            readStream.on('data', (chunk) => {
              chunks.push(chunk)
            })
            readStream.on('end', () => {
              const buffer = Buffer.concat(chunks)
              const blob = new Blob([buffer], { type: fileType?.mime })
              const url = URL.createObjectURL(blob)
              // ダウンロードリンクを作成
              const a = document.createElement('a')
              a.href = url
              a.download = words[words.length - 1]
              a.click()

              URL.revokeObjectURL(url);
            })
          })
        }
      }
    ]

    if (fileType?.mime.startsWith('image')) {
      const handleClick = async (size) => {
        if (!fileType || !fileType.mime.startsWith('image/')) {
          alert('画像ではないファイルは設定出来ません')
          return
        }

        resizeThumbnail(buffer, async (buffer) => {
          let item = await window.eagle.item.getById(AppParameters.identify)
          const tmpPath = window.eagle.os.tmpdir()
          const filePath = `${tmpPath}/${words[words.length - 1]}`
          fs
            .promises
            .writeFile(
              filePath,
              buffer.toString('base64'),
              { encoding: 'base64' }
            )
            .then(() => {
              item.setCustomThumbnail(filePath).then((result) => {
                console.log('result =>  ', result)
              })
            }).catch((result) => {
            console.log(result)
          })
        }, { width: size })
      }
      items.push({
        id: 'thumbnail',
        label: 'サムネイルに設定',
        submenu: [
          {
            id: 'small',
            label: '小',
            click: () => handleClick(400),
          },
          {
            id: 'middle',
            label: '中',
            click: () => handleClick(700),
          },
          {
            id: 'large',
            label: '大',
            click: () => handleClick(1000),
          },
          {
            id: 'original',
            label: 'オリジナル',
            click: () => handleClick(null),
          },
        ],
      })
    }

    window.eagle.contextMenu.open(items)
  }

  static entries({
    entry,
    fileType,
    src,
  }: { entry: Entry, fileType: FileType.FileTypeResult, src: string }) {
    const words = entry.encodedFileName.split('/')
    const items: EagleResources.ContextMenuItem[] = [{
      id: 'export',
      label: 'ファイルをエクスポート',
      click: async () => {
        entry.zipFile.openReadStream(entry, null, (err, readStream) => {
          if (err) {
            return
          }
          const chunks: Uint8Array[] = []
          readStream.on('data', (chunk) => {
            chunks.push(chunk)
          })
          readStream.on('end', () => {
            const buffer = Buffer.concat(chunks)
            const blob = new Blob([buffer], { type: fileType.mime })
            const url = URL.createObjectURL(blob)
            // ダウンロードリンクを作成
            const a = document.createElement('a')
            a.href = url
            a.download = entry.encodedFileName
            a.click()

            URL.revokeObjectURL(url);
          })
        })
      }
    }]
    if (fileType?.mime.startsWith('image/')) {
      items.push(      {
        id: 'thumbnail',
        label: 'サムネイルに設定',
        click: async () => {
          if (!fileType || !fileType.mime.startsWith('image/')) {
            alert('画像ではないファイルは設定出来ません')
            return
          }
          let item = await window.eagle.item.getById(AppParameters.identify)
          const tmpPath = window.eagle.os.tmpdir()
          const filePath = `${tmpPath}/${words[words.length - 1]}`
          fs
            .promises
            .writeFile(
              filePath,
              src.replace('data:' + fileType.mime + ';base64,',''),
              { encoding: 'base64' }
            )
            .then(() => {
              item.setCustomThumbnail(filePath).then((result) => {
                console.log('result =>  ', result)
              })
            }).catch((result) => {
            console.log(result)
          })
        }
      })
    }
    window.eagle.contextMenu.open(items)
  }
}