import './initialisers/theme'
import { DBConfig } from './db/config'
import AppParameters from './lib/app-parameters'
import { InfoObject } from './db/stores/info'

window.eagle.onPluginCreate(() => {
  const renderLastFile = () => {
    let db: IDBDatabase
    // TODO: inspector側でonupgradeneededが発火しない確証がない
    const openReq = indexedDB.open(AppParameters.pluginId, DBConfig.VERSION)

    openReq.onsuccess = function (_) {
      db = this.result
      if (!db.objectStoreNames.contains(DBConfig.STORE_NAMES.Info)) {
        return
      }

      const transaction = db.transaction(DBConfig.STORE_NAMES.Info, 'readonly')
      const store = transaction.objectStore(DBConfig.STORE_NAMES.Info)
      const getReq = store.get([AppParameters.paramsId])

      getReq.onsuccess = () => {
        if (getReq.result) {
          const data: InfoObject = getReq.result
          const p = document.getElementById('lastFileName')
          if (p && data.lastFilePath) {
            p.textContent = data.lastFilePath.split('/').join('/\n')
          }
          const count = document.getElementById('count')
          if (count) {
            count.textContent = `${data.count}` || 'ー'
          }
        }
      }
    }
  }
  renderLastFile()
  setInterval(renderLastFile, 1000)
})
