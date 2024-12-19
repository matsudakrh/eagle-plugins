import React, { memo, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useKey } from 'react-use'
import * as FileType from 'file-type'
import fs from 'fs'
import resizeThumbnail from '../lib/resize-thumbnail'
import charEncode from '../lib/char-encode'
import PdfViewer from '../comopnents/PdfViewer'
import AudioPlayer from '../comopnents/AudioPlayer'
import VideoPlayer from '../comopnents/VideoPlayer'
import spinIcon from '../resources/spin.svg'

const Preview = memo(({ entries }) => {
  const location = useLocation()
  const [buffer, setBuffer] = useState()
  const [imgSrc, setImgSrc] = useState(spinIcon)
  const [text, setText] = useState('')
  const navigate = useNavigate()
  const [fileType, setFileType] = useState()
  const entry = useMemo(() => {
    //　ファイルを閉じてもプレビューへの遷移が残っているケースがあったため暫定対応
    if (!(Number.isInteger(location.state?.index))) {
      navigate('/', {
        replace: true
      })
      return
    }
    return entries[location.state.index]
  }, [entries, location.state?.index])
  const words = useMemo(() => {
    if (!entry) {
      return <div></div>
    }
    return entry.encodedFileName.split('/').filter((word) => word !== '')
  }, [entry])

  const handlePrev = () => {
    if (location.state.index === 0) {
      return
    }

    navigate('/preview', {
      state: {
        index: location.state.index - 1
      },
      replace: true,
    })
  }
  useKey('ArrowLeft', handlePrev, {}, [location.state])
  const handleNext = () => {
    if (location.state.index === entries.length - 1) {
      return
    }
    navigate('/preview', {
      state: {
        index: location.state.index + 1
      },
      replace: true,
    })
  }
  useKey('ArrowRight', handleNext, {}, [location.state])

  const handleBack = () => {
    navigate(-1)
  }
  useKey('Backspace', handleBack, {}, [])

  const handleContextMenu = () => {
    const items = [
      {
        id: 'export',
        label: 'ファイルをエクスポート',
        click: async () => {
          entry.zipFile.openReadStream(entry, {}, (err, readStream) => {
            if (err) {
              return
            }
            const chunks = []
            readStream.on('data', (chunk) => {
              chunks.push(chunk)
            })
            readStream.on('end', () => {
              const buffer = Buffer.concat(chunks)
              const blob = new Blob([buffer], { type: fileType.mime })
              const url = URL.createObjectURL(blob)
              // ダウンロードリンクを作成
              const a = document.createElement('a')
              a.href = url
              a.download = words[words.length - 1]
              a.click()

              URL.revokeObjectURL(url);
            })
          })
        }
      }
    ]

    if (fileType?.mime.startsWith('image')) {
      items.push(      {
        id: 'thumbnail',
        label: 'サムネイルに設定',
        click: async () => {
          if (!fileType || !fileType.mime.startsWith('image/')) {
            alert('画像ではないファイルは設定出来ません')
            return
          }

          resizeThumbnail(buffer, async (buffer) => {
            let item = (await window.eagle.item.getSelected())[0]
            const tmpPath = eagle.os.tmpdir()
            const filePath = `${tmpPath}/${words[words.length - 1]}`
            fs
              .promises
              .writeFile(
                filePath,
                buffer.toString('base64'),
                { encoding: 'base64' }
              )
              .then(() => {
                item.setCustomThumbnail(filePath).then((result) => {
                  console.log('result =>  ', result)
                })
              }).catch((result) => {
              console.log(result)
            })
          })
        }
      })
    }

    window.eagle.contextMenu.open(items)
  }

  // ファイルタイプの取得のみを行う
  useEffect(() => {
    if (!entry) {
      return
    }
    entry.zipFile.openReadStream(entry, {}, (err, readStream) => {
      if (err) {
        console.error(err)
        return
      }

      const chunks = []
      readStream.on('data', (chunk) => {
        chunks.push(chunk)
        const binary = Buffer.concat(chunks)
        return new Promise(async (resolve, reject) => {
          try {
            await FileType.fromBuffer(binary).then((fileType) => {
              setFileType(fileType)
              /// Error: stream destroyed
              readStream.destroy()
              resolve()
            })
          } catch (e) {
            reject(e)
          }
        })
      })
    })
  }, [entry, location.state])

  useEffect(() => {
    if (!entry) {
      return
    }
    if (
      fileType?.mime.startsWith('image/') || fileType?.mime === 'application/pdf' || entry.encodedFileName.endsWith('txt')) {
      entry.zipFile.openReadStream(entry, {}, (err, readStream) => {
        if (err) {
          console.error(err)
          return
        }
        const chunks = []
        readStream.on('data', (chunk) => {
          chunks.push(chunk)
        })
        readStream.on('end', () => {
          const binary = Buffer.concat(chunks)

          // テキストの時はfile typeが取れない
          if (entry.encodedFileName.endsWith('txt')) {
            setText(charEncode(binary))
            return
          }

          if (fileType.mime.startsWith('image/')) {
            setImgSrc(`data:${fileType.mime};base64,${binary.toString('base64')}`)
            setBuffer(binary)
            return
          }

          if (fileType.mime === 'application/pdf') {
            setBuffer(binary)
          }
          // setBuffer(chunks)
        })
      })
    }
    console.log('各処理を行う')
  }, [entry, fileType])

  const detailComponent = () => {
    if (!entry) {
      return <div></div>
    }

    if (fileType?.mime.startsWith('image/')) {
      return <img
        src={imgSrc}
        alt=""
        style={{
          display: 'block',
          margin: 'auto',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
        onContextMenu={fileType?.mime.startsWith('image/') ? handleContextMenu : null}
      />
    }

    if (entry.fileName.endsWith('txt')) {
      return <div style={{ whiteSpace: 'pre-wrap', padding: '24px', overflow: 'auto' }}>
        {text}
      </div>
    }

    if (fileType?.mime === 'application/pdf' && buffer) {
      return <PdfViewer buffer={buffer} />
    }

    if (fileType?.mime.startsWith('audio/')) {
      return <AudioPlayer entry={entry} onContextMenu={handleContextMenu} />
    }

    if (fileType?.mime.startsWith('video/')) {
      return <VideoPlayer entry={entry} onContextMenu={handleContextMenu} />
    }

    return <div>
      TODO: 未対応のファイル形式です
    </div>
  }

  return <div style={{
    width: '100vw',
    height: '100vh',
    display: 'grid',
    gridTemplateRows: 'min-content 1fr min-content',
  }}>
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px',
      borderBottom: '',
    }}>
      <div>
        <button onClick={handleBack}>
          戻る
        </button>
        {words[words.length - 1]}
      </div>
      <div>
        <button onClick={handlePrev}>
          前のファイル
        </button>
        <button onClick={handleNext}>
          次のファイル
        </button>
      </div>
    </header>
    <div style={{ position: 'relative', overflow: 'auto' }}>
      {detailComponent()}
    </div>
  </div>
})

export default Preview