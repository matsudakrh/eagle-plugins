import fs from 'fs'
import AppParameters from '../lib/app-parameters'

export default class AppMetadata {
  static async setThumbnail(data: { src: string, key: string }) {
    const metadata = AppParameters.metadata
    metadata.thumbnails ||= {}
    metadata.thumbnails[data.key] = data.src
    fs.writeFileSync(AppParameters.metadataFilePath, JSON.stringify(metadata), 'utf8')
  }

  static getThumbnail(key: string) {
    const metadata = AppParameters.metadata
    metadata.thumbnails ||= {}
    return metadata.thumbnails[key]
  }
}