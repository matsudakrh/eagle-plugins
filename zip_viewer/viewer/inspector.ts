import fs from 'fs'
import './initialisers/theme'
import AppParameters from './lib/app-parameters'
import { DBConfig } from './db/config'
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
          if (count && data.count) {
            count.textContent = `${data.count}`
          }
          window.eagle.item.getSelected().then(result => {
            AppParameters.setItem(result[0])
            const thumbnails = document.getElementById('thumbnails')
            const metadata = AppParameters.metadata
            if (thumbnails && metadata.thumbnails) {
              thumbnails.textContent = `${Object.keys(metadata.thumbnails).length}`
            }
          })
        }
      }
    }
  }
  renderLastFile()
  setInterval(renderLastFile, 1000)
})


const deleteThumbButton = document.getElementById('deleteThumbButton')
deleteThumbButton?.addEventListener('click', async () => {
  const result = await window.eagle.dialog.showMessageBox({
    message: 'サムネイルの情報を削除しますか？',
    buttons: ['キャンセル', 'OK'],
    type: 'none'
  })

  if (result.response === 1) {
    const metadata = AppParameters.metadata
    metadata.thumbnails = {}
    fs.writeFileSync(AppParameters.metadataFilePath, JSON.stringify(metadata), 'utf8')
  }
})