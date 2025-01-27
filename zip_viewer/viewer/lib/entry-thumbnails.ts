import fs from 'fs'
import path from 'path'
import { Entry } from 'yauzl'
import generateHash from './generate-hash'
import AppParameters from '../lib/app-parameters'

export const GeneratedTagName = 'サムネイル生成'

export const getThumbnailPath = async (entry: Entry) => {
  // const dirPath = path.join('/Users/hiroki/hoby/eagle-plugins/zip_viewer', 'tmp/thumbnails', AppParameters.identify)
  const dirPath = path.join(path.dirname(AppParameters.metadataFilePath), 'thumbnails')
  const fileName = `${ await generateHash(entry.encodedFileName) }.jpg`
  return path.join(dirPath, fileName)
}

export const saveThumbnail = async (filePath: string, thumb: string /* base64 */ | Buffer) => {
  // const dirPath = path.join('/Users/hiroki/hoby/eagle-plugins/zip_viewer', 'tmp/thumbnails', AppParameters.identify)
  const dirPath = path.join(path.dirname(AppParameters.metadataFilePath), 'thumbnails')
  const fileName = `${ await generateHash(filePath) }.jpg`
  const thumbnailPath = path.join(dirPath, fileName)
  await fs.promises.mkdir(dirPath, { recursive: true })
  await fs.promises.writeFile(path.join(dirPath, fileName), thumb, { encoding: 'base64' })

  setTimeout(() => {
    window.eagle.item.getSelected().then(result => {
      const item = result[0]
      if (!item.tags.includes(GeneratedTagName)) {
        item.tags.push(GeneratedTagName)
      }
      item.save()
    })
  })
  return thumbnailPath
}
