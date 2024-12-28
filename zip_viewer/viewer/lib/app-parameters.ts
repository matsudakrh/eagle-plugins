
export default class AppParameters {
  static #params =  new URLSearchParams(window.location.search)

  static get pluginId() {
    return window.eagle.plugin.manifest.id
  }

  static get identify() {
    return this.#params.get('id')
  }

  static get filePath() {
    return this.#params.get('path')
  }

  static get theme() {
    return this.#params.get('theme').toUpperCase()
  }
}