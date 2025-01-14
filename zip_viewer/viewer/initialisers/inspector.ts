import './theme'
import { DBConfig } from '../db/config'
import AppParameters from '../lib/app-parameters'

window.eagle.onPluginCreate(() => {
  const renderLastFile = () => {
    let db: IDBDatabase
    const openReq = indexedDB.open(AppParameters.pluginId, DBConfig.VERSION)

    openReq.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(DBConfig.STORE_NAMES.Info)) {
        return
      }

      const transaction = db.transaction(DBConfig.STORE_NAMES.Info, 'readonly')
      const store = transaction.objectStore(DBConfig.STORE_NAMES.Info)
      const getReq = store.get([AppParameters.paramsId])

      getReq.onsuccess = () => {
        if (getReq.result) {
          const p = document.getElementById('lastFileName')
          if (p) {
            p.textContent =  getReq.result.lastFilePath.split('/').join('/\n')
          }
        }
      }
    }
  }
  renderLastFile()
  setInterval(renderLastFile, 1000)
})
