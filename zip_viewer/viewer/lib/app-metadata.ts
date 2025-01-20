import fs from 'fs'
import AppParameters from '../lib/app-parameters'

export default class AppMetadata {
  static async setThumbnail(data: { src: string, key: string }): Promise<void> {
    // TODO: indexedDBの方が良い？要検討の為一旦設定機能を止めておく
    // TODO: あるいはthumbnails.jsonを作成してしまう・コマンドでの削除を前提とするならこちらのほうが捗りそう
    // const metadata = AppParameters.metadata
    // metadata.thumbnails ||= {}
    // metadata.thumbnails[data.key] = data.src
    // return fs.promises.writeFile(AppParameters.metadataFilePath, JSON.stringify(metadata), 'utf8')
  }

  static getThumbnail(key: string) {
    const metadata = AppParameters.metadata
    metadata.thumbnails ||= {}
    return metadata.thumbnails[key]
  }
}