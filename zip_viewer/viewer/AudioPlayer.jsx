import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
const drawWave=  require('./lib/draw-wave.js')

const audioContext = new window.AudioContext()

const CurrentTime = ({ audio }) => {
  const [curentTime, setCurrentTime] = useState(0)

  useLayoutEffect(() => {
    if (!audio) {
      return
    }
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })
  }, [audio])

  return <div>
    {Number.isInteger(Number.parseInt(curentTime))
      ? `${`${Math.trunc(curentTime / 60)}`.padStart(2, '0')}:${`${Math.ceil(curentTime % 60)}`.padStart(2, '0')}`
      : '--:--'} / {
    Number.isInteger(Number.parseInt(audio?.duration))
      ? `${`${Math.trunc(audio?.duration / 60)}`.padStart(2, '0')}:${`${Math.ceil(audio?.duration % 60)}`.padStart(2, '0')}`
      : '--:--'
  }
  </div>
}

const SeekBar = ({ audioBuffer, audio }) => {
  const canvas = useRef(null)
  const waveCanvas = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [timer, setTimer] = useState()

  useEffect(() => {
    if (!audio) {
      return
    }
    // シームレスな描画をするなら audio.addEventListener('timeupdate' を使う
    const timer = setInterval(() => {
      setCurrentTime(audio.currentTime)
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [audio])

  useEffect(() => {
    if (!waveCanvas.current || !audioBuffer) {
      return
    }
    drawWave(audioBuffer, waveCanvas.current)
  }, [audioBuffer, waveCanvas])

  useEffect(() => {
    if (!canvas.current || !audioBuffer) {
      return
    }
    const SelectStyle = getComputedStyle(document.body)
    const color = String(SelectStyle.getPropertyValue('--color')).trim()
    const ctx = canvas.current.getContext('2d')
    const parentElement = canvas.current.closest('*:not(canvas)')
    const bounding =  parentElement.getBoundingClientRect()
    const width = bounding.width
    const height = bounding.height
    const ratio = currentTime / audioBuffer.duration
    canvas.current.width = width
    canvas.current.height = height
    ctx.clearRect(0, 0, width, height)
    ctx.lineWidth = 1
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(isDragging ? currentPosition : width * ratio, 0)
    ctx.lineTo(isDragging ? currentPosition : width * ratio, canvas.current.height)
    ctx.stroke()
  }, [canvas, currentPosition, isDragging, audioBuffer, currentTime])

  const handlePointerDown = (e) => {
    clearTimeout(timer)
    setIsDragging(true)
    const bounding = canvas.current.getBoundingClientRect()
    setCurrentPosition(e.clientX - bounding.x)

    const handleMouseMove = (e) => {
      const bounding = canvas.current.getBoundingClientRect()
      setCurrentPosition(e.clientX - bounding.x > 0 ? e.clientX - bounding.x : 0)
    }
    const handlePointerUp = (e) => {
      const bounding = canvas.current.getBoundingClientRect()
      const currentPosition = e.clientX - bounding.x > 0 ? e.clientX - bounding.x : 0
      const ratio = currentPosition / canvas.current.width
      audio.currentTime = audioBuffer.duration * ratio
      setCurrentPosition(currentPosition)

      setTimer(setTimeout(() => {
        setIsDragging(false)
      }, 1000))
      document.removeEventListener('pointermove', handleMouseMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }

    document.addEventListener('pointermove', handleMouseMove)
    document.addEventListener('pointerup', handlePointerUp)
  }

  return <div style={{
    height: '100%',
    position: 'relative',
  }}>
    <canvas
      ref={waveCanvas}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        margin: 'auto',
        zIndex: 1,
        width: '100%',
        maxHeight: '100%',
      }}
    ></canvas>
    <canvas
      ref={canvas}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        margin: 'auto',
        zIndex: 2,
        width: '100%',
        maxHeight: '100%',
      }}
      onPointerDown={handlePointerDown}
    >
    </canvas>
  </div>
}

const AudioPlayer = ({ entry, onContextMenu }) => {
  const audio = useRef(null)
  const [src, setSrc] = useState()
  const [thumb, setThumb] = useState()
  const [audioBuffer, setAudioBuffer] = useState()
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!entry || audioBuffer) {
      return
    }
    URL.revokeObjectURL(src)

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
    <div onContextMenu={onContextMenu} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={thumb} alt="" style={{ maxWidth: '100%', maxHeight: '100%' }} />
    </div>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'min-content min-content min-content 1fr',
      borderTop: '1px solid #ffffff22',
    }}>
      <div onClick={handleClick} style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isPlaying ? <span className="video_pause"></span> : <span className="video_play"></span>}
      </div>
      <div style={{ padding: '8px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
        <CurrentTime audio={audio.current} />
      </div>
      <div style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <input type="range" className="inputRange" max="1" step="0.01" onChange={(e) => {
          audio.current.volume = e.target.value
          const activeColor = "#6dd5ff";
          const inactiveColor = "#dddddd";
          const ratio = (e.target.value - e.target.min) / (e.target.max - e.target.min) * 100
          e.target.style.background = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`
        }} />
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
window.components.AudioPlayer = AudioPlayer