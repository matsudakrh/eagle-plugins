import React, { useEffect, useRef, useState } from 'react'
import drawWave from '../../lib/draw-wave'
import styles from './SeekBar.module.scss'

const SeekBar: React.FC<{
  audioBuffer: AudioBuffer
  audio: HTMLAudioElement
}> = ({ audioBuffer, audio }) => {
  const canvas = useRef<HTMLCanvasElement>(null)
  const waveCanvas = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [timer, setTimer] = useState<undefined | number>()

  useEffect(() => {
    if (!audio) {
      return
    }

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })
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
    const ctx = canvas.current.getContext('2d')
    const parentElement = canvas.current.closest('*:not(canvas)')
    const bounding =  parentElement.getBoundingClientRect()
    const width = bounding.width
    const height = bounding.height
    const ratio = currentTime / audioBuffer.duration
    canvas.current.width = width
    canvas.current.height = height
    ctx.clearRect(0, 0, width, height)
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(160, 160, 160)'
    ctx.beginPath()
    ctx.moveTo(isDragging ? currentPosition : width * ratio, 0)
    ctx.lineTo(isDragging ? currentPosition : width * ratio, canvas.current.height)
    ctx.stroke()
  }, [canvas, currentPosition, isDragging, audioBuffer, currentTime])

  const handlePointerDown = (e) => {
    if (!audioBuffer) {
      return
    }
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

      setTimer(window.setTimeout(() => {
        setIsDragging(false)
      }, 1000))
      document.removeEventListener('pointermove', handleMouseMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }

    document.addEventListener('pointermove', handleMouseMove)
    document.addEventListener('pointerup', handlePointerUp)
  }

  return <div className={styles.seekbar}>
    <canvas
      ref={waveCanvas}
      className={styles.canvas}
    ></canvas>
    <canvas
      ref={canvas}
      className={styles.canvas}
      onPointerDown={handlePointerDown}
    >
    </canvas>
  </div>
}

export default SeekBar