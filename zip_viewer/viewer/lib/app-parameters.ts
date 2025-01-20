import { EagleResources } from 'eagle'
import fs from 'fs'

export default class AppParameters {
  static #item: EagleResources.Item | undefined

  // TODO: window.locationと選択されたファイルに差異が出ることがあるが原因不明
  static #params =  new URLSearchParams(window.location.search)

  static setItem(item: EagleResources.Item) {
    this.#item = item
  }

  static get pluginId(): string {
    return window.eagle.plugin.manifest.id
  }

  static get paramsId(): string {
    return this.#params.get('id')
  }

  static get identify(): string {
    return this.#item?.id
  }

  static get filePath(): string {
    return this.#item.filePath
  }

  static get thumbnailPath(): string {
    return this.#item.thumbnailPath
  }

  static get metadataFilePath(): string {
    return this.#item.metadataFilePath
  }

  static get metadata(): { [k in string]: any } {
    return  JSON.parse(fs.readFileSync(AppParameters.metadataFilePath, 'utf8'))
  }

  static get width(): string {
    return this.#params.get('width')
  }

  static get height(): string {
    return this.#params.get('height')
  }

  static get lang(): string {
    return this.#params.get('lang')
  }

  static get theme(): string {
    return this.#params.get('theme').toUpperCase()
  }
}