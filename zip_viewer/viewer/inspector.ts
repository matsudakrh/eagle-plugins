import path from 'path'
import fs from 'fs'
import './initialisers/theme'
import './initialisers/db'
import AppParameters from './lib/app-parameters'
import { DBConfig } from './db/config'
import { InfoObject } from './db/stores/info'

window.eagle.onPluginCreate(() => {
  const renderLastFile = () => {
    let db: IDBDatabase
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
        }
      }
    }

    window.eagle.item.getSelected().then(result => {
      AppParameters.setItem(result[0])
      const dirPath = path.join(path.dirname(AppParameters.metadataFilePath), 'thumbnails')
      if (!fs.existsSync(dirPath)) {
        return
      }
      const list = fs.readdirSync(dirPath)

      if (list.length) {
        const thumbnails = document.getElementById('thumbnails')
        if (thumbnails) {
          thumbnails.textContent = `${list.filter(path => !path.startsWith('.')).length}`
        }
      }
    })
  }
  renderLastFile()
  setInterval(renderLastFile, 1000)
})

document.getElementById('deleteThumbButton')?.addEventListener('click', async () => {
  const result = await window.eagle.dialog.showMessageBox({
    message: 'サムネイルを削除しますか？',
    buttons: ['キャンセル', 'OK']
  })

  if (result.response === 1) {
    const dirPath = path.join(path.dirname(AppParameters.metadataFilePath), 'thumbnails')
    if (!fs.existsSync(dirPath)) {
      return
    }
    await fs.promises.rm(dirPath, { recursive: true, force: true })
  }
})