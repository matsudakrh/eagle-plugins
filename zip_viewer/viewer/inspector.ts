import path from 'path'
import fs from 'fs'
import './initialisers/theme'
import './initialisers/db'
import { DBConfig } from './db/config'
import { InfoObject } from './db/stores/info'
import AppParameters from './lib/app-parameters'
import { GeneratedTagName } from './lib/entry-thumbnails'

window.eagle.onPluginCreate(() => {
  const renderLastFile = () => {
    window.eagle.item.getSelected().then(result => {
      AppParameters.setItem(result[0])

      let db: IDBDatabase
      const openReq = indexedDB.open(AppParameters.pluginId, DBConfig.VERSION)

      openReq.onsuccess = function (_) {
        db = this.result

        const transaction = db.transaction(DBConfig.STORE_NAMES.Info, 'readonly')
        const store = transaction.objectStore(DBConfig.STORE_NAMES.Info)
        const getReq = store.get([AppParameters.paramsId])

        getReq.onsuccess = (_) => {
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

    setTimeout(() => {
      window.eagle.item.getSelected().then(result => {
        const item = result[0]
        const index = item.tags.findIndex(tag => tag === GeneratedTagName)
        if (index > -1) {
          item.tags.splice(index, 1)
        }
        item.save()
      })
    })
  }
})