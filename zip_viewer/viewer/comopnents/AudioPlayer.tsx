import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
import { Entry } from 'yauzl'
import { DBConfig } from '../db/config'
import { AudioObject, putAudioObject } from '../db/stores/audio-store'
import { useAppSelector } from '../hooks/redux'
import AppParameters from '../lib/app-parameters'
import VolumeBar from './AudioPlayer/VolumeBar'
import SeekBar from './AudioPlayer/SeekBar'
import CurrentTime from './AudioPlayer/CurrentTime'
import iconSpin from '../resources/spin.svg'

const AudioPlayer: React.FC<{
  entry: Entry
  onContextMenu: () => void
}> = ({ entry, onContextMenu }) => {
  const audioRef = useRef(null)
  const volume = useAppSelector(state => state.audio.volume)
  const [src, setSrc] = useState<string>()
  const [thumb, setThumb] = useState<string>()
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>()
  const [isPlaying, setIsPlaying] = useState(false)
  const audioContext = useMemo(() => {
    return new window.AudioContext()
  }, [])

  useLayoutEffect(() => {
    let db: IDBDatabase
    const openReq = indexedDB.open(AppParameters.pluginId, DBConfig.VERSION)

    openReq.onsuccess = (event)=> {
      db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction(DBConfig.STORE_NAMES.Audio, 'readonly')
      const store = transaction.objectStore(DBConfig.STORE_NAMES.Audio)
      const getReq = store.get([AppParameters.identify, entry.encodedFileName])

      getReq.onsuccess = (event) => {
        if (getReq.result) {
          audioRef.current.currentTime = (event.target as IDBRequest<AudioObject>).result.lastTime
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
      const currentTime = audioRef.current.currentTime

      const putReq = putAudioObject(db, {
        filePath: entry.encodedFileName,
        itemId: AppParameters.identify,
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

  useEffect(() => {
    if (!audioRef.current) {
      return
    }
    audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    if (!entry) {
      return
    }
    URL.revokeObjectURL(src)
    setSrc(null)
    audioRef.current?.pause()

    entry.zipFile.openReadStream(entry, null, (err, readStream) => {
      const chunks = []

      readStream.on('data', chunk => {
        chunks.push(chunk)
      })

      readStream.on('end', () => {
        const buffer = Buffer.concat(chunks)
        const blob = new Blob([buffer], { type: 'video/mp4' })
        setSrc(URL.createObjectURL(blob))
        audioContext.decodeAudioData(buffer.buffer).then((audioBuffer) => {
          setAudioBuffer(audioBuffer)
        })
      })
    })

    return () => {
      URL.revokeObjectURL(src)
    }
  }, [entry])

  useEffect(() => {
    const getThumbnail = async () => {
      let item = (await window.eagle.item.getSelected())[0]
      setThumb(item.thumbnailPath)
    }

    getThumbnail().catch(() => {})
  }, [])

  const handleClick = () => {
    if (!audioRef.current) {
      return
    }

    if (audioRef.current.paused) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }

  return <div style={{ display: 'grid', gridTemplateRows: '1fr 80px', height: '100%' }}>
    <div onContextMenu={onContextMenu}
         style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <img src={thumb} alt="" style={{ maxWidth: '100%', maxHeight: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, margin: 'auto' }} />
    </div>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'min-content min-content min-content 1fr',
      borderTop: '1px solid #ffffff22',
      position: 'relative',
    }}>
      {src ? null : <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 10,
          width: '100%',
          height: '100%',
          background: 'rgba(100, 100, 100, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={iconSpin}
          alt=""
        />
      </div>}
      <div onClick={handleClick} style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isPlaying ? <span className="video_pause"></span> : <span className="video_play"></span>}
      </div>
      <div style={{ padding: '8px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
        <CurrentTime audio={audioRef.current} />
      </div>
      <div style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <VolumeBar />
      </div>
      <div>
        <SeekBar audio={audioRef.current} audioBuffer={audioBuffer} />
      </div>
    </div>
    <audio
      ref={audioRef}
      src={src}
      style={{ display: 'none' }}
      controls
      autoPlay
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onEnded={() => setIsPlaying(false)}
    ></audio>
  </div>
}
export default AudioPlayer