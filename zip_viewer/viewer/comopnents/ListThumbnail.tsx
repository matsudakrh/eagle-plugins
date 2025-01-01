import React, { memo, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as FileType from 'file-type'
import fs from 'fs'
import { Entry } from 'yauzl'
import { useAppDispatch } from '../hooks/redux'
import { setCurrentHoverEntry } from '../store/directory-store'
import charEncode from '../lib/char-encode'
import resizeThumbnail from '../lib/resize-thumbnail'
import AppParameters from '../lib/app-parameters'
import folderIcon from '../resources/kkrn_icon_folder_2.png'
import audioIcon from '../resources/icon_audio.png'
import styles from '../styles'
import spinIcon from '../resources/spin.svg'

const { gridStyle } = styles

const ListThumbnail: React.FC<{
  entry: Entry
  onOpenDirectory: (name: string) => void
}> = memo(({
  entry,
  onOpenDirectory,
}) => {
  const ref = useRef(undefined)
  const dispatch = useAppDispatch()
  // IntersectionObserverでlazyロードするため初期画像が最低限の高さを与える役割を兼ねる
  const [src, setSrc] = useState(spinIcon)
  const [fileType, setFileType] = useState<FileType.FileTypeResult>()
  const navigate = useNavigate()
  const words = useMemo(() => {
    return entry.encodedFileName.split('/').filter((word) => word !== '')
  }, [])

  const handleContextMenu = () => {
    if (entry.isDirectory) {
      return
    }
    const items = [{
      id: 'export',
      label: 'ファイルをエクスポート',
      click: async () => {
        entry.zipFile.openReadStream(entry, null, (err, readStream) => {
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
            a.download = entry.encodedFileName
            a.click()

            URL.revokeObjectURL(url);
          })
        })
      }
    }]
    if  (fileType?.mime.startsWith('image/')) {
      items.push(      {
        id: 'thumbnail',
        label: 'サムネイルに設定',
        click: async () => {
          if (!fileType || !fileType.mime.startsWith('image/')) {
            alert('画像ではないファイルは設定出来ません')
            return
          }
          let item = await window.eagle.item.getById(AppParameters.identify)
          const tmpPath = window.eagle.os.tmpdir()
          const filePath = `${tmpPath}/${words[words.length - 1]}`
          fs
            .promises
            .writeFile(
              filePath,
              src.replace('data:' + fileType.mime + ';base64,',''),
              { encoding: 'base64' }
            )
            .then(() => {
              item.setCustomThumbnail(filePath).then((result) => {
                console.log('result =>  ', result)
              })
            }).catch((result) => {
            console.log(result)
          })
        }
      })
    }
    window.eagle.contextMenu.open(items)
  }

  useLayoutEffect(() => {
    const options = {
      root: document.querySelector('#images'),
      rootMargin: '0px 0px 20px',
      threshold: 0
    }
    const handler = ([intersection]) => {
      if (intersection.isIntersecting) {
        observer.disconnect()
        if (entry.encodedFileName.endsWith('/')) {
          setSrc(folderIcon)
          return
        }

        entry.zipFile.openReadStream(entry, null, (err, readStream) => {
          if (err) {
            console.error(err)
            return
          }

          let isImage = null
          const chunks = []
          let _fileType
          readStream.on('data', (chunk) => {
            chunks.push(chunk)

            if (isImage === true) {
              return
            }

            if (entry.encodedFileName.endsWith('txt')) {
              return
            }

            if (!_fileType?.mime?.startsWith('image/')) {
              if (chunks.length > 2) {
                // 一定量データを読み込んでも判別出来ていない時は終わる
                readStream.destroy()
                return
              }
            }

            FileType.fromBuffer(Buffer.concat(chunks)).then((fileType) => {
              if (_fileType) {
                return
              }
              if (fileType) {
                _fileType = fileType
                setFileType(fileType)

                isImage = _fileType.mime?.startsWith('image/')

                if (fileType.mime.startsWith('audio/')) {
                  setSrc(audioIcon)
                }
              }
            })
          })
          readStream.on('end', () => {
            const buffer = Buffer.concat(chunks)

            if (entry.encodedFileName.endsWith('txt')) {
              const canvas = document.createElement('canvas')
              canvas.width = 200
              canvas.height = 200
              const ctx = canvas.getContext('2d')
              ctx.fillStyle = '#fff'
              ctx.font = '20px Roboto medium'

              let y = 20
              charEncode(buffer).split('\n').forEach((line, index) => {
                ctx.fillText(line, 0, y)
                y += 32
              })

              canvas.toBlob((blob) => {
                setSrc(URL.createObjectURL(blob))
              })

              return
            }
            resizeThumbnail(buffer, (buffer) => {
              setSrc(`data:${_fileType.mime};base64,${buffer.toString('base64')}`)
            })
          })
        })
      }
    }
    const observer = new IntersectionObserver(handler, options)
    observer.observe(ref.current)

    return () => {
      if (src.startsWith('blob')) {
        URL.revokeObjectURL(src)
      }

      observer.disconnect()
    }
  }, [])

  const handleDbClick = () => {
    if (entry.isDirectory) {
      onOpenDirectory(entry.encodedFileName)
      return
    }
    navigate(`/preview`, {
      state: {
        fullpath: entry.encodedFileName
      },
      replace: false,
    })
  }

  return (
    <div
      className="list-thumbnail"
      ref={ref}
      onDoubleClick={handleDbClick}
      onPointerEnter={() =>
        dispatch(setCurrentHoverEntry(entry.encodedFileName)
      )}
      onPointerLeave={() => dispatch(setCurrentHoverEntry(null))}
    >
      <style>{`
        .img-container {
          padding: 4px;
          border: 1px solid #fff;
        }
        .img-container img {
            max-width: 100%;
            max-height: 100%;
          }
      `}</style>
      <div>
        {src.startsWith('blob')
          ? <div className="img-container"><img src={src} alt="" /></div>
          : <img style={gridStyle.img} onContextMenu={handleContextMenu} src={src} alt="" />
        }
      </div>
      <p style={gridStyle.p}>{words[words.length - 1]}</p>
    </div>
  )
})

export default ListThumbnail