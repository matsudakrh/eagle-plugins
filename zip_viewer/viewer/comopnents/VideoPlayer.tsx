import React, { useLayoutEffect, useRef, useState } from 'react'
import * as FileType from 'file-type'
import { Entry } from 'yauzl'
import { DBConfig } from '../db/config'
import { putVideoObject, VideoObject } from '../db/stores/video'
import AppParameters from '../lib/app-parameters'
import styles from './VideoPlayer.module.scss'
import { spinIcon } from '../resources'

const VideoPlayer: React.FC<{
  entry: Entry
  onContextMenu: () => void
}> = ({ entry, onContextMenu }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [src, setSrc] = useState<string>()

  useLayoutEffect(() => {
    if (!videoRef.current) {
      return
    }
    let db: IDBDatabase
    const openReq = indexedDB.open(AppParameters.pluginId, DBConfig.VERSION)

    openReq.onsuccess = function (_) {
      db = this.result
      const transaction = db.transaction(DBConfig.STORE_NAMES.Video, 'readonly')
      const store = transaction.objectStore(DBConfig.STORE_NAMES.Video)
      const getReq = store.get([AppParameters.identify, entry.encodedFileName])

      getReq.onsuccess = (event) => {
        if (getReq.result) {
          videoRef.current.currentTime = (event.target as IDBRequest<VideoObject>).result.lastTime
        }
      }
      getReq.onerror = (event) => {
        console.log(event)
      }
      transaction.oncomplete = () => {
        console.log('transaction complete')
      }
    }

    const putData = () => {
      // データの解釈がまだの時は上書きしない
      if (!videoRef.current.duration) {
        return
      }
      const currentTime = videoRef.current.currentTime
      let lastTime: number
      if (currentTime >= videoRef.current.duration - 30) {
        lastTime = 0
      } else {
        lastTime =  currentTime - 0.3 > 0 ?  currentTime - 0.3 : 0
      }

      const putReq = putVideoObject(db, {
        filePath: entry.encodedFileName,
        itemId: AppParameters.identify,
        lastTime,
      })

      putReq.onsuccess = () => {
        console.log('put data success.')
      }

      putReq.onerror = (event) => {
        console.log(event)
      }

      db.close()
    }

    window.addEventListener('beforeunload', putData)

    return () => {
      window.removeEventListener('beforeunload', putData)
      putData()
    }
  }, [entry])

  useLayoutEffect(() => {
    if (!entry) {
      return
    }
    URL.revokeObjectURL(src)

    entry.zipFile.openReadStream(entry, null, (err, readStream) => {
      const chunks: Uint8Array<ArrayBuffer>[] = []

      readStream.on('data', chunk => {
        chunks.push(chunk)
      })

      readStream.on('end', async () => {
        const buffer = Buffer.concat(chunks)
        const fileType = await FileType.fromBuffer(buffer)
        const blob = new Blob([buffer], { type: fileType?.mime || 'video/mp4' })
        setSrc(URL.createObjectURL(blob))
      })
    })

    return () => {
      URL.revokeObjectURL(src)
    }
  }, [entry])

  return <>
    <video
      ref={videoRef}
      src={src}
      className={src ? styles.video : styles.video_hidden}
      autoPlay
      controls
      controlsList="nofullscreen"
      onContextMenu={onContextMenu}
    ></video>
    <img
      className={src ? styles.loading_hidden : styles.loading}
      src={spinIcon}
      alt=""
    />
  </>
}

export default VideoPlayer