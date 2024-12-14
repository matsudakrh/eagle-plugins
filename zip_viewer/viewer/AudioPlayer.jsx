import React, { useEffect, useRef, useState } from 'react'

const AudioPlayer = ({ entry }) => {
  const audio = useRef(null)
  const [src, setSrc] = useState()
  const [thumb, setThumb] = useState()

  useEffect(() => {
    if (!entry) {
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

  return <div style={{ display: 'grid', gridTemplateRows: '1fr auto', height: '100%' }}>
    <div onClick={handleClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={thumb} alt="" style={{ maxWidth: '100%', maxHeight: '100%' }} />
    </div>
    <audio ref={audio} src={src} style={{ width: '100%' }} controls autoPlay></audio>
  </div>
}
window.components.AudioPlayer = AudioPlayer