import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const AudioPlayer = ({ entry }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.1)
  const [audioGain, setAudioGain] = useState()

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
          const gainNode = audioContext.createGain()
          const source = audioContext.createBufferSource()
          source.buffer = audioBuffer
          gainNode.connect(audioContext.destination)
          source.connect(gainNode)
          source.start(0)
          setIsPlaying(true)
          setAudioGain(gainNode)
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

  useEffect(() => {
    if (!audioGain) {
      return
    }
    audioGain.gain.value = volume
  }, [volume, audioGain])


  const handleChangeVolume = useCallback( (e) => {
    setVolume(e.target.value / 100)
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
      再生する
    </div>

    <dl>
      <dt>ボリューム</dt>
      <dd><input value={volume * 100} onChange={handleChangeVolume} type="range" /></dd>
    </dl>
  </div>
}
window.components.AudioPlayer = AudioPlayer