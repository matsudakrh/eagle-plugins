import React, { useLayoutEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { DBConfig } from '../db/config'
import { putVideoObject } from '../db/stores/video-store'
import spinIcon from '../resources/spin.svg'

const VideoPlayer = ({ entry, onContextMenu }) => {
  const videoRef = useRef(null)
  const identify = useSelector(state => state.root.identify)
  const [src, setSrc] = useState()

  useLayoutEffect(() => {
    if (!videoRef.current) {
      return
    }
    let db
    const openReq = indexedDB.open(window.eagle.plugin.manifest.id, DBConfig.VERSION)

    openReq.onsuccess = (event)=> {
      db = event.target.result
      const transaction = db.transaction(DBConfig.STORE_NAMES.Video, 'readonly')
      const store = transaction.objectStore(DBConfig.STORE_NAMES.Video)
      const getReq = store.get([identify, entry.encodedFileName])

      getReq.onsuccess = (event) => {
        if (getReq.result) {
          videoRef.current.currentTime = event.target.result.lastTime
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
      const currentTime = videoRef.current.currentTime
      const putReq = putVideoObject(db, {
        filePath: entry.encodedFileName,
        itemId: identify,
        lastTime: currentTime - 0.3,
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

    entry.zipFile.openReadStream(entry, {}, (err, readStream) => {
      const chunks = []

      readStream.on('data', chunk => {
        chunks.push(chunk)
      })

      readStream.on('end', async () => {
        const buffer = Buffer.concat(chunks)
        const blob = new Blob([buffer], { type: 'video/mp4' })
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
      style={{
        display: src ? 'block' : 'none',
        maxWidth: '100%',
        maxHeight: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 'auto',
      }}
      autoPlay
      controls
      onContextMenu={onContextMenu}
    ></video>
    <img
      style={{
        display: src ? 'block' : 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 'auto',
      }}
      src={spinIcon}
      alt=""
    />
  </>
}

export default VideoPlayer