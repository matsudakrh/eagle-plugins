import path from 'path'
import fs from 'fs'
import './initialisers/theme'
import './initialisers/db'
import { DBConfig } from './db/config'
import { InfoObject } from './db/stores/info'
import AppParameters from './lib/app-parameters'
import { GeneratedAudioThumbTagName, GeneratedTagName, saveThumbnail } from './lib/entry-thumbnails'

window.eagle.onPluginCreate(() => {
  const renderLastFile = () => {
    window.eagle.item.getSelected().then(result => {
      const item = result[0]
      AppParameters.setItem(item)

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

              const playTime = (storeName: typeof DBConfig.STORE_NAMES.Audio | typeof DBConfig.STORE_NAMES.Video) => {
                const transaction = db.transaction(storeName, 'readonly')
                const store = transaction.objectStore(storeName)
                const getReq = store.get([AppParameters.paramsId, data.lastFilePath])

                getReq.onsuccess = (_) => {
                  if (getReq.result) {
                    const lastTime = document.getElementById('lastTime')
                    if (lastTime && getReq.result.lastTime) {
                      document.getElementById('lastTimeContainer').style.display = 'block'
                      lastTime.textContent =  `${`${Math.trunc(getReq.result.lastTime / 60)}`.padStart(2, '0')}:${`${Math.ceil(getReq.result.lastTime % 60)}`.padStart(2, '0')}`
                    } else {
                      document.getElementById('lastTimeContainer').style.display = 'none'
                    }
                  }
                }
              }
              playTime(DBConfig.STORE_NAMES.Audio)
              playTime(DBConfig.STORE_NAMES.Video)
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
        ['deleteThumbButton', 'audio', 'divider'].forEach((idName) => {
          const audioContainer = document.getElementById(idName)
          audioContainer.style.display = 'none'
        })
        return
      }
      ['deleteThumbButton', 'audio', 'divider'].forEach((idName) => {
        const audioContainer = document.getElementById(idName)
        audioContainer.style.display = 'block'
      })
      const list = fs.readdirSync(dirPath)

      if (list.length) {
        if (!item.tags.includes(GeneratedTagName)) {
          item.tags.push(GeneratedTagName)
          void item.save()
        }
        const thumbnails = document.getElementById('thumbnails')
        if (thumbnails) {
          thumbnails.textContent = `${list.filter(path => !path.startsWith('.')).length}`
        }
      }

      const fileName = `${AppParameters.identify}_Audio.jpg`
      const thumbnailPath = path.join(dirPath, fileName)

      if (!fs.existsSync(thumbnailPath)) {
        ['audio', 'divider'].forEach((idName) => {
          const audioContainer = document.getElementById(idName)
          audioContainer.style.display = 'none'
        })
        return
      }
      ['audio', 'divider'].forEach((idName) => {
        const audioContainer = document.getElementById(idName)
        audioContainer.style.display = 'block'
      })

      const audioThumb = document.getElementById('audioThumb') as  HTMLImageElement | null
      if (audioThumb) {
        audioThumb.src = thumbnailPath
      }
      if (!item.tags.includes(GeneratedAudioThumbTagName)) {
        item.tags.push(GeneratedAudioThumbTagName)
        void item.save()
      }
    })
  }
  renderLastFile()
  setInterval(renderLastFile, 1000)

  const audioThumb = document.getElementById('audioThumb')
  audioThumb?.addEventListener('contextmenu', () => {
    window.eagle.contextMenu.open([
      {
        id: 'thumbnail',
        label: '音声サムネイルを設定',
        submenu: [
          {
            id: 'file',
            label: 'ファイルから選択',
            click: () => {
              console.log('TODO: クリップボードから音声サムネイルを設定')
            },
          },
          {
            id: 'clipboard',
            label: 'クリップボードから設定',
            click: () => {
              console.log('TODO: クリップボードから音声サムネイルを設定')
            },
          }
        ]
      }
    ])
  })
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

// ZIP内に画像が無い場合にも音声サムネイルを設定出来るようにする
document.getElementById('voiceThumbButton')?.addEventListener('click', () => {
  window.eagle.contextMenu.open([
    // {
    //   id: 'file',
    //   label: 'ファイルから選択',
    //   click: () => {
    //     console.log('f;ewjofp;ew')
    //     console.log(window.eagle.clipboard.has('image/jpg'))
    //     console.log(window.eagle.clipboard.has('image/png'))
    //     console.log(window.eagle.clipboard.has('image/jpeg'))
    //   }
    // },
    {
      id: 'clipboard',
      label: 'クリップボードから設定',
      click: async () => {
        const image = window.eagle.clipboard.readImage()
        const buffer: Uint8Array = image.toJPEG(100)

        const fileName = `${AppParameters.identify}_Audio`
        await saveThumbnail(fileName, Buffer.from(buffer))
      }
    }
  ])
})

window.addEventListener(
  "keydown",
  (event) => {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }
    console.log(event.key)

    switch (event.key) {
      case "ArrowDown":
        // Do something for "down arrow" key press.
        break;
      case "ArrowUp":
        // Do something for "up arrow" key press.
        break;
      case "ArrowLeft":
        // Do something for "left arrow" key press.
        break;
      case "ArrowRight":
        // Do something for "right arrow" key press.
        break;
      case "Enter":
        // Do something for "enter" or "return" key press.
        break;
      case "Escape":
        // Do something for "esc" key press.
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
  },
  true,
);