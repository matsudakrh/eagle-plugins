import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useKey } from 'react-use'
import * as FileType from 'file-type'
import yauzl from 'yauzl'
import { putInfoObject } from '../db/stores/info'
import { DBConfig } from '../db/config'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import charEncode from '../lib/char-encode'
import { setCurrentDirectory } from '../store/directory-store'
import AppParameters from '../lib/app-parameters'
import { findObjectByCondition, MetaKeys } from '../lib/zip-tree'
import AppContextMenu from '../lib/app-context-menu'
import PdfViewer from '../comopnents/PdfViewer'
import AudioPlayer from '../comopnents/AudioPlayer'
import VideoPlayer from '../comopnents/VideoPlayer'
import PreviewHeader from '../comopnents/PreviewHeader'
import styles from './Preview.module.scss'
import { spinIcon } from '../resources'

const Preview: React.FC<{
  entries: yauzl.Entry[]
}>  = memo(({ entries }) => {
  const dispatch = useAppDispatch()
  const structure = useAppSelector(state => state.directory.structure)
  const currentDirectory = useAppSelector(state => state.directory.currentDirectory)
  const location = useLocation()
  const [buffer, setBuffer] = useState<Buffer>()
  const [imgSrc, setImgSrc] = useState(spinIcon)
  const [text, setText] = useState('')
  const navigate = useNavigate()
  const [fileType, setFileType] = useState<FileType.FileTypeResult | undefined>()
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

  const words: string[] = useMemo(() => {
    if (!entry) {
      return []
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
    AppContextMenu.preview({
      entry,
      fileType,
      buffer,
    })
  }

  // ファイルタイプの取得のみを行う
  useEffect(() => {
    if (!entry) {
      return
    }
    entry.zipFile.openReadStream(entry, null, (err, readStream) => {
      if (err) {
        console.error(err)
        return
      }

      const chunks: Uint8Array<ArrayBuffer>[] = []
      readStream.on('data', (chunk) => {
        chunks.push(chunk)
        const binary = Buffer.concat(chunks)
        return new Promise(async (resolve, reject) => {
          try {
            await FileType.fromBuffer(binary).then((fileType) => {
              setFileType(fileType)
              /// Error: stream destroyed
              readStream.destroy()
              resolve(true)
            })
          } catch (e) {
            reject(e)
          }
        })
      })
    })

    let db: IDBDatabase
    const openReq = indexedDB.open(AppParameters.pluginId, DBConfig.VERSION)

    openReq.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result

      putInfoObject(db, {
        itemId: AppParameters.identify,
        lastFilePath: entry.encodedFileName,
      })
    }
  }, [entry, location.state])

  useEffect(() => {
    if (!entry) {
      return
    }
    if (
      fileType?.mime.startsWith('image/') || fileType?.mime === 'application/pdf' || entry.encodedFileName.endsWith('txt')) {
      entry.zipFile.openReadStream(entry, null, (err, readStream) => {
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
        className={imgSrc === spinIcon ? styles.image_loading : styles.image}
        onContextMenu={fileType?.mime.startsWith('image/') ? handleContextMenu : null}
      />
    }

    if (entry.fileName.endsWith('txt')) {
      return <div className={styles.text_container}>
        {text}
      </div>
    }

    if (fileType?.mime === 'application/pdf' && buffer) {
      return <PdfViewer key={entry.encodedFileName} entry={entry} buffer={buffer} />
    }

    if (fileType?.mime.startsWith('audio/')) {
      return <AudioPlayer key={entry.encodedFileName} entry={entry} onContextMenu={handleContextMenu} />
    }

    if (fileType?.mime.startsWith('video/')) {
      return <VideoPlayer key={entry.encodedFileName} entry={entry} onContextMenu={handleContextMenu} />
    }

    return <div>
    </div>
  }

  return <div className={styles.preview}>
    <PreviewHeader
      name={words[words.length - 1]}
      onBack={handleBack}
      onPrev={preEntry ? handlePrev : null}
      onNext={nextEntry ? handleNext : null}
    />
    <div className={styles.body}>
      {detailComponent()}
    </div>
  </div>
})

export default Preview
