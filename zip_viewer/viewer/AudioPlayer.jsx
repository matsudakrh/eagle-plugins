import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const SeekBar = () => {
  const canvas = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(0)

  useEffect(() => {
    if (!canvas.current) {
      return
    }

    const el = canvas.current.closest('*:not(canvas)')
    const bounding = el.getBoundingClientRect()
    canvas.current.width = bounding.width
    const width = canvas.current.width
    const height = canvas.current.height
    const ctx = canvas.current.getContext('2d')
    ctx.clearRect(0, 0, width, height)
    ctx.lineWidth = 1
    ctx.strokeStyle = '#fff'
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(bounding.width, height / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.moveTo(currentPosition, 0)
    ctx.lineTo(currentPosition, height)
    ctx.stroke()
  }, [canvas, currentPosition, isDragging])

  const handleMouseMove = (e) => {
    if (isDragging) {
      setCurrentPosition(e.clientX - canvas.current.offsetLeft)
    }
  }

  const handlePointerDown = () => {
    setIsDragging(true)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  return <canvas
    ref={canvas}
    onMouseMove={handleMouseMove}
    onPointerDown={handlePointerDown}
    onPointerUp={handlePointerUp}
  >
  </canvas>
}

const AudioPlayer = ({ entry }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.01)
  const [audioGain, setAudioGain] = useState()
  const [totalDuration, setTotalDuration] = useState(0)

  const audioContext = useMemo(() => {
    return new window.AudioContext()
  }, [])

  useEffect(() => {
    if (!entry || audioGain) {
      return
    }

    entry.zipFile.openReadStream(entry, {}, (err, readStream) => {
      const chunks = []

      readStream.on('data', chunk => {
        chunks.push(chunk)
      })

      readStream.on('end', () => {
        const buffer = Buffer.concat(chunks)
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)

        // AudioContextでデコードして音声を再生
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          const gainNode = audioContext.createGain()
          const source = audioContext.createBufferSource()
          source.buffer = audioBuffer
          gainNode.connect(audioContext.destination)
          source.connect(gainNode)
          source.start(0)
          setIsPlaying(true)
          setAudioGain(gainNode)
          setTotalDuration(audioBuffer.duration)
        }, (err) => {
          console.error('AudioBufferのデコードに失敗しました:', err)
        })
      })

      // エラーが発生した場合の処理
      readStream.on('error', (err) => {
        console.error('ストリーム読み込み中にエラーが発生しました:', err)
      })
    })

    return () => {
      try {
        if (audioContext.state !== 'closed') {
          audioContext.close()
        }
      } catch (e) {
        console.log(e)
      }
    }
  }, [entry])

  useEffect(() => {
    if (!audioGain) {
      return
    }
    audioGain.gain.value = volume
  }, [volume, audioGain])

  const handleChangeVolume = useCallback( (e) => {
    setVolume(e.target.value)
  }, [])

  return <div>
    <div onClick={() => {
      if (isPlaying) {
        audioContext.suspend().then(() => {
          setIsPlaying(false)
        })
        return
      }

      audioContext.resume()
      setIsPlaying(true)
    }}>
      {isPlaying ? '再生を止める' : '再生する'}
    </div>

    <dl>
      <dt>ボリューム</dt>
      <dd>
        <input
          value={volume}
          min="0"
          max="1"
          step="0.001"
          type="range"
          onChange={handleChangeVolume}
        />
      </dd>
      <dt>シークバー</dt>
      <dd style={{ margin: 0 }}>
        {audioContext.state !== 'closed' && totalDuration
          ? <SeekBar totalDuration={totalDuration} />
          : null}
      </dd>
    </dl>
  </div>
}
window.components.AudioPlayer = AudioPlayer