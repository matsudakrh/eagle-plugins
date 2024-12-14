import React, {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  memo,
  useMemo,
  useCallback,
} from 'react'
import { Provider, useSelector, useDispatch } from 'react-redux'
import { createRoot } from 'react-dom/client'
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  HashRouter,
} from 'react-router-dom'
import { useKey } from 'react-use'
import { fileTypeFromBuffer } from 'file-type'
import store from './store.js'
import { setStructure, setCurrentDirectory } from './directory-store.js'
const {
  findObjectByCondition,
} = require('./lib/zip-tree.js')
const fs = require('fs')
const yauzl = require('yauzl')
const _ = require('lodash')
const { Entry } = yauzl
const charEncode = require('./lib/char-encode')

// HTMLからみた相対パスを書く
const resizeThumbnail = require('./lib/resize-thumbnail.js')
const styles = require('./styles.js')

const {
  AudioPlayer,
  PdfViewer,
  VideoPlayer,
} = window.components

const { gridStyle } = styles

/*

components
コンポーネント

 */

const ListThumbnail = memo(({
  entry,
  index,
  onOpenDirectory,
}) => {
  const ref = useRef(undefined)
  // IntersectionObserverでlazyロードするため初期画像が最低限の高さを与える役割を兼ねる
  const [src, setSrc] = useState('./resources/spin.svg')
  const [fileType, setFileType] = useState()
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
          let item = (await window.eagle.item.getSelected())[0]
          const tmpPath = eagle.os.tmpdir()
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
        if (entry.encodedFileName.endsWith('/')) {
          setSrc('./resources/kkrn_icon_folder_2.png')
          return
        }

        entry.zipFile.openReadStream(entry, {}, (err, readStream) => {
          if (err) {
            console.error(err)
            return
          }

          let isImage = null
          const chunks = []
          let _fileType
          readStream.on('data', (chunk) => {
            chunks.push(chunk)
            if (isImage !== null || _fileType) {
              return
            }
            if (entry.encodedFileName.endsWith('txt')) {
              return
            }
            fileTypeFromBuffer(Buffer.concat(chunks)).then((fileType) => {
              if (_fileType) {
                return
              }
              if (fileType) {
                _fileType = fileType
                setFileType(fileType)
                if (!fileType.mime.startsWith('image/')) {
                  readStream.destroy()

                  if (fileType.mime.startsWith('audio/')) {
                    setSrc('./resources/icon_audio.png')
                    return
                  }

                  console.log('TODO: アイコン設定')
                }
              } else {
                console.log('TODO: アイコン設定')
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
    }
  }, [])

  const handleDbClick = () => {
    if (entry.isDirectory) {
      onOpenDirectory(entry.encodedFileName)
      return
    }
    navigate(`/preview`, {
      state: {
        index
      },
      replace: false,
    })
  }

  return (
    <div ref={ref} onDoubleClick={handleDbClick}>
      <div>
        {src.startsWith('blob')
          ? <div style={{ padding: '4px', border: '1px solid #fff' }} ><img src={src} style={{ maxWidth: '100%' }} alt="" /></div>
          : <img style={gridStyle.img} onContextMenu={handleContextMenu} src={src} alt="" />
        }
      </div>
      <p style={gridStyle.p}>{words[words.length - 1]}</p>
    </div>
  )
})

/*

components
コンポーネント
ここまで
 */

/*

pages
ページ

 */

const Preview = memo(({ entries }) => {
  const location = useLocation()
  const [buffer, setBuffer] = useState()
  const [imgSrc, setImgSrc] = useState('./resources/spin.svg')
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
    window.eagle.contextMenu.open([
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
              a.download = entry.encodedFileName
              a.click()

              URL.revokeObjectURL(url);
            })
          })
        }
      },
      {
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
                buffer.toString('base64').replace('data:' + fileType.mime + ';base64,', ''),
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
      },
    ])
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
            await fileTypeFromBuffer(binary).then((fileType) => {
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
      return <div style={{ whiteSpace: 'pre-wrap', padding: '24px' }}>
        {text}
      </div>
    }

    if (fileType?.mime === 'application/pdf' && buffer) {
      return <PdfViewer buffer={buffer} />
    }

    if (fileType?.mime.startsWith('audio/')) {
      return <AudioPlayer entry={entry} />
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
    gridTemplateRows: 'min-content 1fr',
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
    <div style={{ position: 'relative' }}>
      {detailComponent()}
    </div>
  </div>
})

const Entries = memo(({ entries }) => {
  const structure = useSelector((state) => state.directory.structure)
  const currentDirectory = useSelector((state) => state.directory.currentDirectory)
  const dispath = useDispatch()
  const [visibleEntries, setVisibleEntries] = useState([])

  const parentDirectory = useMemo(() => {
    if (!structure || !currentDirectory) {
      return
    }

    return findObjectByCondition(structure, (obj) => {
      const children = Object.values(obj)
      const dirs = children.filter(child => typeof child === 'object' && child !== null)

      return dirs.some((value) => {
        return value.$_uuid === currentDirectory.$_uuid
      })
    })
  }, [structure, currentDirectory])

  useEffect(() => {
    if (!currentDirectory) {
      return
    }

    const dupDir = _.cloneDeep(currentDirectory)
    const filteredDir = _.omitBy(dupDir, (value, key) => {
      return key.startsWith('$_')
    })

    const children = Object.values(filteredDir)
    const dirs = children.filter(child => typeof child === 'object' && child !== null)
    const uuids = children.filter(child => typeof child === 'string')
    const files = entries.filter(entry => uuids.includes(entry.$_uuid))
    setVisibleEntries([...dirs, ...files])
  }, [currentDirectory, entries])

  useEffect(() => {
    const keys = Object.keys(structure)
    if (!keys.length) {
      return
    }

    if (currentDirectory) {
      return
    }

    dispath(setCurrentDirectory(structure))
  }, [structure])

  const handleOpenDirectory = useCallback((dir) => {
    dispath(setCurrentDirectory(dir))
  }, [])

  const handleBack = useCallback(() => {
    if (!currentDirectory) {
      return
    }
    const dir = findObjectByCondition(structure, (obj) => {
      const children = Object.values(obj)
      const dirs = children.filter(child => typeof child === 'object' && child !== null)

      return dirs.some((value) => {
        return value.$_uuid === currentDirectory.$_uuid
      })
    })

    dispath(setCurrentDirectory(dir))
  }, [currentDirectory])

  return <div>
    <div>
      {parentDirectory ? <span onClick={handleBack}>
        前のフォルダに戻る
      </span> : null}
      <span style={{
        whiteSpace: 'pre-wrap',
        paddingLeft: '12px',
      }}>
       {currentDirectory?.$_name ? `「${currentDirectory.$_name}」` : null}
      </span>
    </div>
    <div id="images" style={gridStyle.images}>
      {
        visibleEntries.map((entry) => {
          const isEntry = entry instanceof Entry

          if (isEntry) {
            return <ListThumbnail
              key={entry.encodedFileName}
              entry={entry}
              index={entries.findIndex(e => entry === e)}
              onOpenDirectory={handleOpenDirectory}
            />
          }

          return <div key={entry.$_name} onDoubleClick={() => handleOpenDirectory(entry)}>
            <div>
              <img style={gridStyle.img} src="./resources/kkrn_icon_folder_2.png" alt="" />
            </div>
            <p style={gridStyle.p}>{entry.$_name}</p>
          </div>
        })
      }
    </div>
  </div>
})

/*

pages
ページ
ここまで

 */

const App = memo(() => {
  const [entries, setEntries] = useState([])
  const dispatch = useDispatch()
  useEffect(() => {
    let _file
    window.eagle.item.getSelected().then((selected) => {
      if (selected.length > 1) {
        return alert('一つのみ選択してください')
      }
      if (!selected.length) {
        return alert('ファイルが選択されていません')
      }
      const filePath = selected[0].filePath
      if (!filePath.endsWith('zip')) {
        return alert('Zipファイルを選択してください')
      }

      yauzl.open(filePath, { autoClose: false, lazyEntries: true }, (err, zipFile) => {
        if (err) {
          console.error(err)
          return
        }
        _file = zipFile

        const entries = []
        zipFile.readEntry()
        zipFile.on('entry', (entry) => {
          entry.encodedFileName = charEncode(entry.fileNameRaw)
          entry.isDirectory = entry.encodedFileName.endsWith('/')
          entry.zipFile = zipFile
          entries.push(entry)
          zipFile.readEntry()
        })
        zipFile.on('end', () => {
          entries.sort((a, b) => {
            const aName = a.encodedFileName
            const bName = b.encodedFileName

            if (a.isDirectory && !b.isDirectory) {
              return -1
            } else if (!a.isDirectory && b.isDirectory) {
              return 1
            }

            return aName.localeCompare(bName, 'ja', {
              sensitivity: 'variant',
              numeric: true,
            })
          })

          setEntries(entries)
          dispatch(setStructure(entries))
        })
      })
    })

    return () => {
      if (_file) {
        _file.close()
      }
    }
  }, [])

  return (<HashRouter>
    <Routes>
      <Route key="entries" index element={<Entries entries={entries} />} />
      <Route
        key="preview"
        path="/preview"
        element={<Preview entries={entries}  />}
      />
    </Routes>
  </HashRouter>)
})

if (window.createdEaglePlugin) {
  /// trueなのにエラーが出るので対策
  window.setTimeout(() => {
    const root = createRoot(document.getElementById('root'))
    root.render(
      <Provider store={store}>
        <App />
      </Provider>
    )
  }, 200)
} else {
  eagle.onPluginCreate(() => {
    const root = createRoot(document.getElementById('root'))
    root.render(
      <Provider store={store}>
        <App />
      </Provider>
    )
  })
}