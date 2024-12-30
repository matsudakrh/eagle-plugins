
export default class AppParameters {
  static #params =  new URLSearchParams(window.location.search)

  static get pluginId(): string {
    return window.eagle.plugin.manifest.id
  }

  static get identify(): string {
    return this.#params.get('id')
  }

  static get filePath(): string {
    return this.#params.get('path')
  }

  static get theme(): string {
    return this.#params.get('theme').toUpperCase()
  }
}