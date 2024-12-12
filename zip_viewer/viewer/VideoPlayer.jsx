import React, { useLayoutEffect, useState } from 'react'

const VideoPlayer = ({ entry }) => {
  const [src, setSrc] = useState()

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

  return src
    ? <video
      src={src}
      style={{
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
    ></video>
    : <div></div>
}

window.components.VideoPlayer = VideoPlayer