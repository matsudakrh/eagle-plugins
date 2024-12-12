import React, { useEffect, useState } from 'react'

const AudioPlayer = ({ entry }) => {
  const [src, setSrc] = useState()

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

  return <div style={{ display: 'flex', alignItems: 'end', height: '100%' }}>
    <audio src={src} style={{ width: '100%' }} controls autoPlay></audio>
  </div>
}
window.components.AudioPlayer = AudioPlayer