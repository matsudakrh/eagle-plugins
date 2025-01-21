import fs from 'fs'
import AppParameters from '../lib/app-parameters'

export default class AppMetadata {
  // TODO: Unexpected non-whitespace character after JSON at position 65488
  static async setThumbnail(data: { src: string, key: string }): Promise<void> {}

  static getThumbnail(key: string) {
    const metadata = AppParameters.metadata
    metadata.thumbnails ||= {}
    return metadata.thumbnails[key]
  }
}