import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import iconSpin from '../resources/spin.svg'
import VolumeBar from './AudioPlayer/VolumeBar'
import SeekBar from './AudioPlayer/SeekBar'
import CurrentTime from './AudioPlayer/CurrentTime'

const AudioPlayer = ({ entry, onContextMenu }) => {
  const audio = useRef(null)
  const volume = useSelector(root => root.audio.volume)
  const [src, setSrc] = useState()
  const [thumb, setThumb] = useState()
  const [audioBuffer, setAudioBuffer] = useState()
  const [isPlaying, setIsPlaying] = useState(false)
  const audioContext = useMemo(() => {
    return new window.AudioContext()
  }, [])

  useEffect(() => {
    if (!audio.current) {
      return
    }
    audio.current.volume = volume
  }, [volume])

  useEffect(() => {
    if (!entry) {
      return
    }
    URL.revokeObjectURL(src)
    setSrc(null)
    audio.current?.pause()

    entry.zipFile.openReadStream(entry, {}, (err, readStream) => {
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
    if (!audio.current) {
      return
    }

    if (audio.current.paused) {
      audio.current.play()
    } else {
      audio.current.pause()
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
        <CurrentTime audio={audio.current} />
      </div>
      <div style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <VolumeBar />
      </div>
      <div>
        <SeekBar audio={audio.current} audioBuffer={audioBuffer} />
      </div>
    </div>
    <audio
      ref={audio}
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