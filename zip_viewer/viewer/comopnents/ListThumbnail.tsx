import React, { memo, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import * as FileType from 'file-type'
import { Entry } from 'yauzl'
import fs from 'fs'
import { useAppDispatch } from '../hooks/redux'
import { setCurrentHoverEntry } from '../store/directory-store'
import charEncode from '../lib/char-encode'
import resizeThumbnail from '../lib/resize-thumbnail'
import AppContextMenu from '../lib/app-context-menu'
import { getThumbnailPath, saveThumbnail } from '../lib/entry-thumbnails'
import styles from './ListThumbnail.module.scss'
import { spinIcon, folderIcon, audioIcon } from '../resources'

const ListThumbnail: React.FC<{
  entry: Entry
  onOpenDirectory: (name: string) => void
}> = memo(({
  entry,
  onOpenDirectory,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  // IntersectionObserverでlazyロードするため初期画像が最低限の高さを与える役割を兼ねる
  const [src, setSrc] = useState<string>(spinIcon)
  const [fileType, setFileType] = useState<FileType.FileTypeResult>()
  const navigate = useNavigate()
  const words = useMemo(() => {
    return entry.encodedFileName.split('/').filter((word) => word !== '')
  }, [])

  const handleContextMenu = () => {
    if (entry.isDirectory) {
      return
    }
    AppContextMenu.entries({ entry, fileType, src })
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

        getThumbnailPath(entry).then((path) => {
          const exists = fs.existsSync(path)
          if (exists) {
            setSrc(path)
          }

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
            const chunks: Uint8Array[] = []
            let _fileType: FileType.FileTypeResult
            readStream.on('data', (chunk) => {
              if (!_fileType?.mime?.startsWith('image/')) {
                if (chunks.length > 2) {
                  // 一定量データを読み込んでも判別出来ていない時は終わる
                  // if (!readStream.destroyed && !readStream.closed) {
                  //   readStream.destroy()
                  // }
                  return
                }
              }

              chunks.push(chunk)

              if (isImage === true) {
                if (exists) {
                  readStream.destroy()
                }
                return
              }

              if (entry.encodedFileName.endsWith('txt')) {
                return
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
                    // AppMetadata.setThumbnail({
                    //   key: entry.encodedFileName,
                    //   src: audioIcon,
                    // })
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

                  // AppMetadata.setThumbnail({
                  //   key: entry.encodedFileName,
                  //   src: canvas.toDataURL(),
                  // })
                })

                return
              }

              if (isImage) {
                if (exists) {
                  return
                }
                resizeThumbnail(buffer, (buffer) => {
                  const image = buffer.toString('base64')
                  const base64 = `data:${_fileType.mime};base64,${image}`
                  setSrc(base64)

                  saveThumbnail(entry, image)
                  // return AppMetadata.setThumbnail({
                  //   key: entry.encodedFileName,
                  //   src: image,
                  // })
                })
              }
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
      ref={ref}
      onDoubleClick={handleDbClick}
      onPointerEnter={() =>
        dispatch(setCurrentHoverEntry(entry.encodedFileName)
      )}
      onPointerLeave={() => dispatch(setCurrentHoverEntry(null))}
    >
      <div>
        {src.startsWith('blob')
          ? <div className={styles.imgContainer}><img src={src} alt="" /></div>
          : <img className={styles.img} onContextMenu={handleContextMenu} src={src} alt="" />
        }
      </div>
      <p className={styles.file_name}>{words[words.length - 1]}</p>
    </div>
  )
})

export default ListThumbnail