import React, { useCallback, useEffect, useMemo, useState } from 'react'

// 音声ストリームを処理する関数
function handleAudioStream(readStream) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()

  // ReadableStreamからArrayBufferを生成するためのバッファを用意
  const chunks = []

  // ストリームのデータをchunksに蓄積
  readStream.on('data', chunk => {
    chunks.push(chunk)
  })

  readStream.on('end', () => {
    // ストリームが終了したら、バッファを結合してArrayBufferに変換
    const buffer = Buffer.concat(chunks)
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)

    // AudioContextでデコードして音声を再生
    audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext.destination)
      source.start(0)
    }, (err) => {
      console.error('AudioBufferのデコードに失敗しました:', err)
    })
  })

  // エラーが発生した場合の処理
  readStream.on('error', (err) => {
    console.error('ストリーム読み込み中にエラーが発生しました:', err)
  })
}
const AudioPlayer = ({ entry }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioContext = useMemo(() => {
    return new window.AudioContext()
  }, [])

  useEffect(() => {
    if (!entry) {
      return
    }
    let source

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
          const source = audioContext.createBufferSource()
          source.buffer = audioBuffer
          source.connect(audioContext.destination)
          source.start(0)
          setIsPlaying(true)
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
        if (source) {
          source.disconnect()
        }
      } catch (e) {
        console.log(e)
      }
    }
  }, [entry])

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
      再生する
    </div>
  </div>
}
window.components.AudioPlayer = AudioPlayer