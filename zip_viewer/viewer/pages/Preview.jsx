import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useKey } from 'react-use'
import * as FileType from 'file-type'
import fs from 'fs'
import resizeThumbnail from '../lib/resize-thumbnail'
import charEncode from '../lib/char-encode'
import { findObjectByCondition, MetaKeys } from '../lib/zip-tree'
import { setCurrentDirectory } from '../store/directory-store'
import PdfViewer from '../comopnents/PdfViewer'
import AudioPlayer from '../comopnents/AudioPlayer'
import VideoPlayer from '../comopnents/VideoPlayer'
import PreviewHeader from '../comopnents/PreviewHeader'
import spinIcon from '../resources/spin.svg'

const Preview = memo(({ entries }) => {
  const dispatch = useDispatch()
  const structure = useSelector(state => state.directory.structure)
  const currentDirectory = useSelector(state => state.directory.currentDirectory)
  const location = useLocation()
  const [buffer, setBuffer] = useState()
  const [imgSrc, setImgSrc] = useState(spinIcon)
  const [text, setText] = useState('')
  const navigate = useNavigate()
  const [fileType, setFileType] = useState()
  const entry = useMemo(() => {
    if (location.state?.fullpath) {
      return entries.find(entry => entry.encodedFileName === location.state.fullpath)
    }
  }, [entries, location.state?.fullpath])

  useEffect(() => {
    // リロードした場合にcurrentDirectoryを見失うのを修正
    if (currentDirectory || !structure || !entry) {
      return
    }
    const dir = findObjectByCondition(structure, (obj) => {
      return Object.values(obj).includes(entry[MetaKeys.UUID])
    })
    dispatch(setCurrentDirectory(dir))
  }, [currentDirectory, structure, entry])

  const currentDirEntries = useMemo(() => {
    if (!currentDirectory) {
      return []
    }

    return entries.filter((entry) => {
      return Object.values(currentDirectory).includes(entry[MetaKeys.UUID]) && !entry.isDirectory
    })
  }, [entries, currentDirectory])

  const preEntry = useMemo(() => {
    const index = currentDirEntries.findIndex(a => a.encodedFileName ===  entry.encodedFileName)
    return currentDirEntries[index - 1]
  },  [currentDirEntries, entry])
  const nextEntry = useMemo(() => {
    const index = currentDirEntries.findIndex(a => a.encodedFileName ===  entry.encodedFileName)
    return currentDirEntries[index + 1]
  }, [currentDirEntries, entry])

  const words = useMemo(() => {
    if (!entry) {
      return <div></div>
    }
    return entry.encodedFileName.split('/').filter((word) => word !== '')
  }, [entry])

  const handlePrev = () => {
    if (!preEntry) {
      return
    }

    navigate('/preview', {
      state: {
        fullpath: preEntry.encodedFileName,
      },
      replace: true,
    })
  }
  useKey('ArrowLeft', handlePrev, {}, [preEntry])

  const handleNext = () => {
    if (!nextEntry) {
      return
    }

    navigate('/preview', {
      state: {
        fullpath: nextEntry.encodedFileName,
      },
      replace: true,
    })
  }
  useKey('ArrowRight', handleNext, {}, [nextEntry])

  const handleBack = useCallback(() => {
    navigate(-1)
  }, [])
  useKey('Backspace',  handleBack, {}, [])

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
      const handleClick = async (size) => {
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
        }, { width: size })
      }
      items.push(      {
        id: 'thumbnail',
        label: 'サムネイルに設定',
        submenu: [
          {
            id: 'small',
            label: '小',
            click: () => handleClick(400),
          },
          {
            id: 'middle',
            label: '中',
            click: () => handleClick(700),
          },
          {
            id: 'large',
            label: '大',
            click: () => handleClick(1000),
          },
          {
            id: 'original',
            label: 'オリジナル',
            click: () => handleClick(null),
          },
        ],
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
            return
          }

          console.log('TODO: 各処理を行う')
        })
      })
    }
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
      return <AudioPlayer key={entry.encodedFileName} entry={entry} onContextMenu={handleContextMenu} />
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
    <PreviewHeader
      name={words[words.length - 1]}
      count={entries.length}
      onBack={handleBack}
      onPrev={preEntry ? handlePrev : null}
      onNext={nextEntry ? handleNext : null}
    />
    <div style={{ position: 'relative', overflow: 'auto' }}>
      {detailComponent()}
    </div>
  </div>
})

export default Preview