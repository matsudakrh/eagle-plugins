import React, { useEffect, useMemo, useRef, useState, useLayoutEffect, ReactEventHandler } from 'react'
import { useKey } from 'react-use'
import { Entry } from 'yauzl'
import fs from 'fs'
import path from 'path'
import { DBConfig } from '../db/config'
import { AudioObject, putAudioObject } from '../db/stores/audio'
import { useAppSelector } from '../hooks/redux'
import AppParameters from '../lib/app-parameters'
import VolumeBar from './AudioPlayer/VolumeBar'
import SeekBar from './AudioPlayer/SeekBar'
import CurrentTime from './AudioPlayer/CurrentTime'
import styles from './AudioPlayer.module.scss'
import iconSpin from '../resources/spin.svg'

const waitTime = (time = 4) => {
  return new Promise((resolve, reject) => {
    return setTimeout(() => {
      resolve(null)
    }, time)
  })
}

const AudioPlayer: React.FC<{
  entry: Entry
  onContextMenu: () => void
  onNext: () => void
}> = ({ entry, onContextMenu, onNext }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const volume = useAppSelector(state => state.audio.volume)
  const [src, setSrc] = useState<string>()
  const [thumb, setThumb] = useState('')
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>()
  const [isPlaying, setIsPlaying] = useState(false)
  const audioContext = useMemo(() => {
    return new window.AudioContext()
  }, [])

  useEffect(() => {
    const dirPath = path.join(path.dirname(AppParameters.metadataFilePath), 'thumbnails')
    const fileName = `${AppParameters.identify}_Audio.jpg`
    const thumbnailPath = path.join(dirPath, fileName)
    if (fs.existsSync(thumbnailPath)) {
      setThumb(thumbnailPath)
    } else {
      setThumb(AppParameters.thumbnailPath)
    }
  }, [])

  useLayoutEffect(() => {
    let db: IDBDatabase
    const openReq = indexedDB.open(AppParameters.pluginId, DBConfig.VERSION)

    openReq.onsuccess = function (_) {
      db = this.result
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
        db.close()
        console.log('transaction complete')
      }
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
      const chunks: Uint8Array<ArrayBuffer>[] = []

      readStream.on('data', chunk => {
        chunks.push(chunk)
      })

      readStream.on('end', () => {
        setSrc(URL.createObjectURL(new Blob(chunks, { type: 'audio/wav' })))

        setTimeout(() => {
          const buffer = Buffer.concat(chunks)
          audioContext.decodeAudioData(buffer.buffer).then((audioBuffer) => {
            setAudioBuffer(audioBuffer)
          })
        }, 200)
      })
    })

    return () => {
      URL.revokeObjectURL(src)
    }
  }, [entry])

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

  const handleTimeUpdate: ReactEventHandler<HTMLAudioElement> = (event) => {
    let db: IDBDatabase
    const openReq = indexedDB.open(AppParameters.pluginId, DBConfig.VERSION)

    openReq.onsuccess = function (_) {
      db = this.result
      const currentTime = (event.target as HTMLAudioElement).currentTime
      let lastTime: number
      if (!currentTime) {
        return
      }

      if (currentTime >= audioRef.current.duration - 10) {
        lastTime = 0
      } else {
        lastTime = currentTime - 0.3 > 0 ? currentTime - 0.3 : 0
      }

      putAudioObject(db, {
        filePath: entry.encodedFileName,
        itemId: AppParameters.identify,
        lastTime,
      })
    }
  }

  useKey(' ', handleClick, {}, [])

  return <div className={styles.audio_player}>
    <div onContextMenu={onContextMenu} className={styles.thumbnail_container}>
      <img src={thumb} alt="" className={styles.thumbnail} />
    </div>
    <div className={styles.body}>
      {src ? null : <div
        className={styles.loading_container}
      >
        <img
          src={iconSpin}
          alt=""
        />
      </div>}
      <div onClick={handleClick} className={styles.play_button_container}>
        {isPlaying ? <span className={styles.video_pause}></span> : <span className={styles.video_play}></span>}
      </div>
      <div className={styles.current_time_container}>
        <CurrentTime audio={audioRef.current} />
      </div>
      <div className={styles.volume_bar_container}>
        <VolumeBar />
      </div>
      <div>
        <SeekBar audio={audioRef.current} audioBuffer={audioBuffer} />
      </div>
    </div>
    <audio
      ref={audioRef}
      src={src}
      className={styles.audio}
      controls
      autoPlay
      onTimeUpdate={handleTimeUpdate}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onEnded={() => {
        setIsPlaying(false)
        onNext()
      }}
    ></audio>
  </div>
}
export default AudioPlayer